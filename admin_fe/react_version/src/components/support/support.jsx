import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../context/socketContext';
import { Send, User, MessageCircle, Clock, Zap, Users, Loader2, History } from 'lucide-react';
import './support.css';
import { getHistoryChatListAdmin, getHistoryChat } from '../../api/chatApi';

const Support = () => {
    const { socket, isConnected, supportUsers, supportMessages, setPendingCount, upsertSupportUser, addAdminMessage } = useSocket();
    const [activeUserId, setActiveUserId] = useState(null);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [chatUsers, setChatUsers] = useState([]); // Danh sách user từ API
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [chatHistory, setChatHistory] = useState([]); // Lịch sử chat của user đang active
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    // Load danh sách user đã từng chat
    useEffect(() => {
        const loadChatUsers = async () => {
            try {
                setIsLoadingUsers(true);
                const response = await getHistoryChatListAdmin();
                console.log('Danh sách user đã từng chat:', response);
                if (response && response.data) {
                    setChatUsers(response);
                }
            } catch (error) {
                console.error('Lỗi khi tải danh sách user:', error);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        loadChatUsers();
    }, []);

    // Load lịch sử chat khi chọn user
    useEffect(() => {
        const loadChatHistory = async () => {
            if (!activeUserId) {
                setChatHistory([]);
                return;
            }

            try {
                setIsLoadingHistory(true);
                const response = await getHistoryChat(activeUserId);
                if (response && response.messages) {
                    // Chuyển đổi format dữ liệu lịch sử
                    const formattedHistory = response.messages.map(chat => ({
                        sender: chat.sender === 'user' ? 'user' : 'admin',
                        text: chat.content,
                        timestamp: chat.timestamp
                    }));
                    setChatHistory(formattedHistory);
                }
            } catch (error) {
                console.error('Lỗi khi tải lịch sử chat:', error);
                setChatHistory([]);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        loadChatHistory();
    }, [activeUserId]);

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

    // Kết hợp lịch sử chat và realtime messages
    const combinedMessages = [...chatHistory, ...activeHistory];

    // Tạo danh sách user kết hợp (realtime + history)
    const allUsers = [
        ...supportUsers.map(user => ({ ...user, isRealtime: true })),
        ...chatUsers
            .filter(historyUser => !supportUsers.some(rtUser => rtUser.id === historyUser._id))
            .map(historyUser => ({
                id: historyUser._id,
                name: historyUser.username,
                email: historyUser.email,
                lastMessage: 'Xem lịch sử chat',
                timestamp: new Date().toISOString(),
                isWaiting: false,
                isRealtime: false
            }))
    ];

    const handleSendMessage = useCallback((e) => {
        e?.preventDefault();
        const trimmed = inputText.trim();
        if (!trimmed || !activeUserId || !socket || isSending) return;

        // Kiểm tra xem user có đang online không
        const selectedUser = allUsers.find(u => u.id === activeUserId);
        if (!selectedUser?.isRealtime) {
            // User không online, có thể hiển thị thông báo hoặc xử lý khác
            alert('User hiện không online. Tin nhắn sẽ không được gửi realtime.');
            return;
        }

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

    const selectedUser = allUsers.find(u => u.id === activeUserId);

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
                        <Users size={14} /> ĐOẠN CHAT ({allUsers.length})
                    </div>
                    <div className="sp-user-list">
                        {isLoadingUsers ? (
                            <div className="sp-loading-users">
                                <Loader2 size={20} className="sp-loading-icon" />
                                <span>Đang tải danh sách...</span>
                            </div>
                        ) : allUsers.length === 0 ? (
                            <div className="sp-empty-users">Chưa có user liên hệ</div>
                        ) : (
                            allUsers.map(user => (
                                <div
                                    key={user.id}
                                    className={`sp-user-item ${activeUserId === user.id ? 'active' : ''} ${user.isWaiting ? 'waiting' : ''} ${user.isRealtime ? 'realtime' : 'history'}`}
                                    onClick={() => setActiveUserId(user.id)}
                                >
                                    <div className="sp-user-avatar">
                                        <User size={20} />
                                        {user.isRealtime && <div className="sp-online-indicator"></div>}
                                    </div>
                                    <div className="sp-user-info">
                                        <div className="sp-user-name">
                                            {user.name}
                                            {!user.isRealtime && <History size={12} style={{ marginLeft: 4, opacity: 0.6 }} />}
                                        </div>
                                        <div className="sp-user-last-msg">{user.lastMessage}</div>
                                        {user.email && <div className="sp-user-email">{user.email}</div>}
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
                                    <div className="sp-active-avatar">
                                        <User size={24} />
                                        {selectedUser?.isRealtime && <div className="sp-online-indicator"></div>}
                                    </div>
                                    <div className="sp-active-name">
                                        {selectedUser?.name || 'Unknown User'}
                                        {!selectedUser?.isRealtime && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}> (Offline)</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="sp-messages-window">
                                {isLoadingHistory ? (
                                    <div className="sp-loading-history">
                                        <Loader2 size={24} className="sp-loading-icon" />
                                        <p>Đang tải lịch sử chat...</p>
                                    </div>
                                ) : combinedMessages.length === 0 ? (
                                    <div className="sp-empty-chat">
                                        <MessageCircle size={40} />
                                        <p>Chưa có tin nhắn nào</p>
                                    </div>
                                ) : (
                                    combinedMessages.map((msg, idx) => (
                                        <div key={idx} className={`sp-msg-wrapper ${msg.sender}`}>
                                            <div className="sp-msg-content">
                                                {msg.text}
                                                <div className="sp-msg-meta">
                                                    <Clock size={10} />
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form className="sp-chat-input" onSubmit={handleSendMessage}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={selectedUser?.isRealtime ? "Nhập nội dung hỗ trợ... (Enter để gửi)" : "User không online - chỉ xem lịch sử"}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isSending || !selectedUser?.isRealtime}
                                    autoFocus
                                />
                                <button type="submit" disabled={!inputText.trim() || isSending || !selectedUser?.isRealtime}>
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