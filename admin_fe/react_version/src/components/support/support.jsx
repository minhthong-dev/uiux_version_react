import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../context/socketContext';
import { Send, User, MessageCircle, Clock, Zap, Users } from 'lucide-react';
import './support.css';

const Support = () => {
    const { socket, isConnected, supportUsers, supportMessages, setPendingCount, upsertSupportUser, addAdminMessage } = useSocket();
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
    }, [supportMessages, activeUserId]);

    // Reset pending count khi vào trang hoặc chat
    useEffect(() => {
        setPendingCount(0);
    }, [setPendingCount, activeUserId]);

    // Chú ý: Lắng nghe socket đã được chuyển lên SocketContext

    const activeUser = supportUsers.find(u => u.id === activeUserId);
    const activeHistory = activeUserId ? (supportMessages[activeUserId] || []) : [];

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

        addAdminMessage(activeUserId, trimmed, timestamp);
        upsertSupportUser(activeUserId, activeUser?.name, trimmed, timestamp, false);

        setInputText('');
        inputRef.current?.focus();
    }, [inputText, activeUserId, socket, isSending, addAdminMessage, upsertSupportUser, activeUser?.name]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

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
                        <Users size={14} /> ĐOẠN CHAT ({supportUsers.length})
                    </div>
                    <div className="sp-user-list">
                        {supportUsers.length === 0 ? (
                            <div className="sp-empty-users">Chưa có user liên hệ</div>
                        ) : (
                            supportUsers.map(user => (
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