import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/socketContext';
import { Send, User, Server, Zap } from 'lucide-react';
import './support.css';

const Support = () => {
    // Lấy thông tin socket và trạng thái kết nối từ context
    const { socket, isConnected } = useSocket();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        if (!socket) return;

        // Lắng nghe tin nhắn phản hồi từ backend
        const handleReceiveMessage = (data) => {
            setChatHistory(prev => [...prev, {
                sender: 'server',
                text: typeof data === 'string' ? data : data.message || JSON.stringify(data)
            }]);
        };

        socket.on('receive_message', handleReceiveMessage);

        // Code dọn dẹp (cleanup) khi rời component
        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !isConnected) return;
        setChatHistory(prev => [...prev, { sender: 'user', text: message }]);
        socket.emit('send_message', { message });
        setMessage('');
    };

    return (
        <div className="support-container">
            <div className="support-header">
                <h2><Zap size={20} style={{ display: 'inline', marginRight: 8 }} />Tư Vấn Trực Tuyến</h2>
                <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                    <span className="status-dot"></span>
                    {isConnected ? 'SOCKET ✓' : 'ĐANG KẾT NỐI...'}
                </div>
            </div>

            <div className="chat-box">
                <div className="chat-history">
                    {chatHistory.length === 0 ? (
                        <div className="empty-chat">
                            <Server size={40} className="empty-icon" />
                            <p>Test Socket: Thử gửi tin nhắn lên server.</p>
                        </div>
                    ) : (
                        chatHistory.map((msg, index) => (
                            <div key={index} className={`message-wrapper ${msg.sender}`}>
                                <div className="message-bubble">
                                    <div className="message-icon">
                                        {msg.sender === 'user' ? <User size={16} /> : <Server size={16} />}
                                    </div>
                                    <div className="message-content">
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={handleSendMessage} className="chat-input-area">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập tin nhắn test..."
                        disabled={!isConnected}
                    />
                    <button type="submit" disabled={!message.trim() || !isConnected} className="send-btn">
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Support;
