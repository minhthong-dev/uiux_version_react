import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/socketContext';
import { Send, User, Server, Zap } from 'lucide-react';
import './support.css';
import { manageToken, getInfor } from '../../utils/manageToken';
const Support = () => {
    const { socket, isConnected } = useSocket();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        if (!socket) return;
        const handleJoinRoom = () => {
            const userinfor = getInfor();
            const data = {
                room: userinfor.id,
                infor: {
                    userId: userinfor.id,
                    username: userinfor.username,
                    // avatar: userinfor.avatar
                    email: userinfor.email,
                    role: userinfor.role
                },
                socketId: socket.id
            }
            socket.emit('join_room', data);
            console.log('da gui socket: ', data);
        }
        handleJoinRoom();
        const handleReceiveMessage = (data) => {
            console.log('da nhan socket: ', data);
            setChatHistory(prev => [...prev, {
                sender: 'server',
                text: data.text
            }]);
        };

        socket.on('receive_admin_message', handleReceiveMessage);

        return () => {
            socket.off('receive_admin_message', handleReceiveMessage);
            socket.emit('leave_room', socket.id);
        };
    }, [socket]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !isConnected) return;
        setChatHistory(prev => [...prev, { sender: 'user', text: message }]);
        const userinfor = getInfor();
        const data = {
            room: userinfor.id,
            infor: {
                userId: userinfor.id,
                username: userinfor.username,
                // avatar: userinfor.avatar
                email: userinfor.email,
                role: userinfor.role
            },
            socketId: socket.id
        }
        socket.emit('send_message', { data: data, message: message });
        // console.log('da gui socket: ', { ...data, message });
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
