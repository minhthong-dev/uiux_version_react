import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../context/socketContext';
import { Send, User, MessageCircle, Clock, Zap, Users } from 'lucide-react';
import './support.css';

const Support = () => {
    const { socket, isConnected } = useSocket();
    const [users, setUsers] = useState([]); // [{id, name, lastMessage, timestamp, isWaiting}]
    const [messages, setMessages] = useState({}); // {userId: [{sender, text, timestamp}]}
    const [activeUserId, setActiveUserId] = useState(null);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    // Tự động cuộn xuống cuối chat
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeUserId]);

    // Helper: thêm/cập nhật user trong danh sách
    const upsertUser = useCallback((userId, name, lastMessage, timestamp, isWaiting = false) => {
        setUsers(prev => {
            const updatedUser = {
                id: userId,
                name: name || `User #${userId.slice(-4)}`,
                lastMessage: lastMessage || '',
                timestamp: timestamp || new Date().toISOString(),
                isWaiting,
            };
            const exists = prev.find(u => u.id === userId);
            if (exists) {
                return [updatedUser, ...prev.filter(u => u.id !== userId)];
            }
            return [updatedUser, ...prev];
        });
    }, []);

    useEffect(() => {
        if (!socket) return;

        // User vào hàng chờ (chưa gửi tin nhắn)
        const handleUserWaiting = (data) => {
            const { userId, username, timestamp } = data?.data?.infor || {};
            if (!userId) return;
            upsertUser(userId, username, 'Đang chờ hỗ trợ...', timestamp, true);
        };

        // Nhận tin nhắn từ user
        const handleUserMessage = (data) => {
            const { userId, username, timestamp } = data?.data?.infor || {};
            const text = data?.message;
            if (!userId || !text) return;

            upsertUser(userId, username, text, timestamp, false);

            setMessages(prev => ({
                ...prev,
                [userId]: [...(prev[userId] || []), { sender: 'user', text, timestamp: timestamp || new Date().toISOString() }]
            }));
        };

        socket.on('new_user_waiting', handleUserWaiting);
        socket.on('receive_user_message', handleUserMessage);

        return () => {
            socket.off('new_user_waiting', handleUserWaiting);
            socket.off('receive_user_message', handleUserMessage);
        };
    }, [socket, upsertUser]);

    const handleSendMessage = useCallback((e) => {
        e?.preventDefault();
        const trimmed = inputText.trim();
        if (!trimmed || !activeUserId || !socket || isSending) return;

        const timestamp = new Date().toISOString();
        const messageData = { room: activeUserId, text: trimmed, timestamp };

        setIsSending(true);
        socket.emit('admin_message', messageData, () => {
            setIsSending(false);
        });

        // Nếu server không gọi ack callback, tự reset sau 3s
        setTimeout(() => setIsSending(false), 3000);

        setMessages(prev => ({
            ...prev,
            [activeUserId]: [...(prev[activeUserId] || []), { sender: 'admin', text: trimmed, timestamp }]
        }));

        setInputText('');
        inputRef.current?.focus();
    }, [inputText, activeUserId, socket, isSending]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const activeUser = users.find(u => u.id === activeUserId);
    const activeHistory = activeUserId ? (messages[activeUserId] || []) : [];

    return (
        <div className="sp-container">
            <header className="sp-header">
                <div className="sp-header-info">
                    <MessageCircle size={32} />
                    <div>
                        <h1>TRUNG TÂM HỖ TRỢ</h1>
                        <div className={`sp-status ${isConnected ? 'online' : 'offline'}`}>
                            <Zap size={14} />
                            <span>{isConnected ? 'LIVE - Đang kết nối' : 'OFFLINE - Mất kết nối'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="sp-main-layout">
                {/* Danh sách User */}
                <aside className="sp-sidebar">
                    <div className="sp-sidebar-title">
                        <Users size={14} /> ĐOẠN CHAT ({users.length})
                    </div>
                    <div className="sp-user-list">
                        {users.length === 0 ? (
                            <div className="sp-empty-users">Chưa có user liên hệ</div>
                        ) : (
                            users.map(user => (
                                <div
                                    key={user.id}
                                    className={`sp-user-item ${activeUserId === user.id ? 'active' : ''} ${user.isWaiting ? 'waiting' : ''}`}
                                    onClick={() => setActiveUserId(user.id)}
                                >
                                    <div className="sp-user-avatar">
                                        <User size={20} />
                                    </div>
                                    <div className="sp-user-info">
                                        <div className="sp-user-name">{user.name}</div>
                                        <div className="sp-user-last-msg">{user.lastMessage}</div>
                                    </div>
                                    <div className="sp-user-time">
                                        {new Date(user.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Khu vực Chat */}
                <main className="sp-chat-area">
                    {activeUserId ? (
                        <>
                            <div className="sp-chat-header">
                                <div className="sp-active-user">
                                    <div className="sp-active-avatar"><User size={24} /></div>
                                    <div className="sp-active-name">{activeUser?.name}</div>
                                </div>
                            </div>

                            <div className="sp-messages-window">
                                {activeHistory.map((msg, idx) => (
                                    <div key={idx} className={`sp-msg-wrapper ${msg.sender}`}>
                                        <div className="sp-msg-content">
                                            {msg.text}
                                            <div className="sp-msg-meta">
                                                <Clock size={10} />
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            <form className="sp-chat-input" onSubmit={handleSendMessage}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Nhập nội dung hỗ trợ... (Enter để gửi)"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isSending}
                                    autoFocus
                                />
                                <button type="submit" disabled={!inputText.trim() || isSending}>
                                    {isSending ? '...' : <Send size={20} />}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="sp-no-chat">
                            <MessageCircle size={64} opacity={0.2} />
                            <p>Chọn một user từ danh sách để bắt đầu hỗ trợ</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Support;