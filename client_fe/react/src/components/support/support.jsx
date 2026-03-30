import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/socketContext';
import { Send, User, Server, Zap, Loader2, ChevronDown } from 'lucide-react';
import './support.css';
import { manageToken, getInfor } from '../../utils/manageToken';
import { getHistoryChat } from '../../api/chatApi';

const Support = () => {
    const { socket, isConnected } = useSocket();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [error, setError] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isUserAtBottom, setIsUserAtBottom] = useState(true);
    const chatHistoryRef = useRef(null);
    let data
    // Load lịch sử chat khi component mount
    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                setIsLoadingHistory(true);
                const history = await getHistoryChat();
                console.log('Lịch sử chat đã tải:', history);
                if (history && history.messages) {
                    const formattedHistory = history.messages.map(chat => ({
                        sender: chat.sender === 'user' ? 'user' : 'admin',
                        text: chat.content,
                        timestamp: chat.timestamp
                    }));
                    setChatHistory(formattedHistory);
                }
            } catch (err) {
                console.error('Lỗi khi tải lịch sử chat:', err);
                setError('Không thể tải lịch sử trò chuyện');
            } finally {
                setIsLoadingHistory(false);
                // Sau khi load lịch sử, mặc định người dùng ở cuối
                setTimeout(() => setIsUserAtBottom(true), 100);
            }
        };

        loadChatHistory();
    }, []);

    // Tự động cuộn xuống cuối khi có tin nhắn mới (chỉ khi người dùng ở cuối)
    useEffect(() => {
        if (isUserAtBottom && chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory, isUserAtBottom]);

    // Hàm cuộn xuống cuối
    const scrollToBottom = () => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
            setIsUserAtBottom(true);
            setShowScrollButton(false);
        }
    };

    // Kiểm tra xem có cần hiển thị nút cuộn không
    const handleScroll = () => {
        if (chatHistoryRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatHistoryRef.current;
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px tolerance
            setIsUserAtBottom(isNearBottom);
            setShowScrollButton(!isNearBottom);
        }
    };

    useEffect(() => {
        if (!socket) return;
        const handleJoinRoom = () => {
            const userinfor = getInfor();
            data = {
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
           try {
             socket.emit('join_room', data);
           } catch (error) {
             socket.send(JSON.stringify({ event: 'join_room', data: data }));
           }
            console.log('da gui socket: ', data);
        }
        handleJoinRoom();
        const handleReceiveMessage = (data) => {
            console.log('Nhận tin nhắn từ admin:', data);
            setChatHistory(prev => [...prev, {
                sender: 'server',
                text: data.text,
                timestamp: new Date().toISOString()
            }]);
        };

        try {
            socket.send('receive_admin_message', handleReceiveMessage);
        } catch (error) {
            // socket.onmessage(JSON.stringify({ event: 'receive_admin_message', handleReceiveMessage }));
            socket.onmessage = (event) => {
                console.log(event);
                const msg = JSON.parse(event.data);
                if (msg.event === 'receive_admin_message') {
                    handleReceiveMessage(msg.data);
                }
            }
        }

        return () => {
            try {
                socket.off('receive_admin_message', handleReceiveMessage);
            } catch (error) {
                socket.send(JSON.stringify({ event: 'join_room', data: data }));
            }
            try {
                socket.emit('leave_room', socket.id);
            } catch (error) {
                socket.send(JSON.stringify({ event: 'join_room', data: data }));
            }
        };
    }, [socket]);

    // Thêm scroll listener khi component mount
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (chatHistoryRef.current) {
                chatHistoryRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !isConnected) return;

        const newMessage = {
            sender: 'user',
            text: message,
            timestamp: new Date().toISOString()
        };

        setChatHistory(prev => [...prev, newMessage]);
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
        try {
            socket.emit('send_message', { data: data, message: message });
        } catch (error) {
            socket.send(JSON.stringify({ event: 'send_message', data: data, message: message}));
        }
        // console.log('da gui socket: ', { ...data, message });
        setMessage('');
    };

    return (
        <div className="support-container">
            <div className="support-header">
                <h2><Zap size={20} style={{ display: 'inline', marginRight: 8 }} />Hỗ Trợ Khách Hàng</h2>
                <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                    <span className="status-dot"></span>
                    {isConnected ? 'ONLINE' : 'OFFLINE'}
                </div>
            </div>

            <div className="chat-box">
                <div className="chat-history" ref={chatHistoryRef}>
                    {isLoadingHistory ? (
                        <div className="loading-chat">
                            <Loader2 size={24} className="loading-icon" />
                            <p>Đang tải lịch sử trò chuyện...</p>
                        </div>
                    ) : error ? (
                        <div className="error-chat">
                            <p>{error}</p>
                        </div>
                    ) : chatHistory.length === 0 ? (
                        <div className="empty-chat">
                            <Server size={40} className="empty-icon" />
                            <p>Chào mừng bạn đến với hỗ trợ khách hàng!</p>
                            <p>Gửi tin nhắn để bắt đầu cuộc trò chuyện.</p>
                        </div>
                    ) : (
                        chatHistory.map((msg, index) => (
                            <div key={index} className={`message-wrapper ${msg.sender}`}>
                                <div className="message-bubble">
                                    <div className="message-icon">
                                        {msg.sender === 'user' ? <User size={16} /> : <Server size={16} />}
                                    </div>
                                    <div className="message-content">
                                        <p>{msg.text}</p>
                                        {msg.timestamp && (
                                            <span className="message-time">
                                                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Nút cuộn xuống cuối */}
                {showScrollButton && (
                    <button
                        onClick={scrollToBottom}
                        className="scroll-to-bottom-btn"
                        title="Cuộn xuống cuối"
                    >
                        <ChevronDown size={20} />
                    </button>
                )}

                <form onSubmit={handleSendMessage} className="chat-input-area">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={isConnected ? "Nhập tin nhắn của bạn..." : "Đang kết nối..."}
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
