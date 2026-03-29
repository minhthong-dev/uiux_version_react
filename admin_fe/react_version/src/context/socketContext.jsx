import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import SOCKET_URL from '../config/configSocketUrl';
import { manageToken } from '../utils/manageToken';
import { toast } from '../components/notification/toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsconnected] = useState(false);

    /* State toàn cục cho support chat */
    const [supportUsers, setSupportUsers] = useState(() => {
        const saved = sessionStorage.getItem('supportUsers');
        return saved ? JSON.parse(saved) : [];
    });
    const [supportMessages, setSupportMessages] = useState(() => {
        const saved = sessionStorage.getItem('supportMessages');
        return saved ? JSON.parse(saved) : {};
    });
    const [onlineUsers, setOnlineUsers] = useState([]); // danh sách user đang online từ socket
    const [pendingCount, setPendingCount] = useState(0);        // số tin nhắn chưa đọc

    const upsertSupportUser = useCallback((userId, name, lastMessage, timestamp, isWaiting = false) => {
        setSupportUsers(prev => {
            const updatedUser = {
                id: userId,
                name: name || `User #${userId.slice(-4)}`,
                lastMessage: lastMessage || '',
                timestamp: timestamp || new Date().toISOString(),
                isWaiting,
            };
            const exists = prev.find(u => u.id === userId);
            let newUsers;
            if (exists) {
                newUsers = [updatedUser, ...prev.filter(u => u.id !== userId)];
            } else {
                newUsers = [updatedUser, ...prev];
            }
            return newUsers;
        });
    }, []);

    const addAdminMessage = useCallback((userId, text, timestamp) => {
        setSupportMessages(prev => ({
            ...prev,
            [userId]: [...(prev[userId] || []), { sender: 'admin', text, timestamp: timestamp || new Date().toISOString() }]
        }));
    }, []);

    // Sync to sessionStorage
    useEffect(() => {
        sessionStorage.setItem('supportUsers', JSON.stringify(supportUsers));
    }, [supportUsers]);

    useEffect(() => {
        sessionStorage.setItem('supportMessages', JSON.stringify(supportMessages));
    }, [supportMessages]);

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['polling', 'websocket'],
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('connected', newSocket.id);
            setIsconnected(true);
        });

        newSocket.emit('iam_admin', manageToken.getToken());

        newSocket.on('admin_check', (data) => {
            console.log(data);
        });

        /* Lắng nghe user vào hàng chờ */
        newSocket.on('new_user_waiting', (data) => {
            const { userId, username, timestamp } = data?.data?.infor || {};
            if (!userId) return;
            upsertSupportUser(userId, username, 'Đang chờ hỗ trợ...', timestamp, true);
            setPendingCount(prev => prev + 1);
            toast.info(`🙋 ${username || 'Người dùng'} đang chờ hỗ trợ!`);
        });

        /* Lắng nghe danh sách user online */
        newSocket.on('receive_user_online_list', (payload) => {
            if (!payload) return;

            const rawUsers = Array.isArray(payload) ? payload : [payload];
            const onlineList = rawUsers
                .map(item => {
                    const userData = item?.data || item;
                    const id = userData?.userId || userData?.id || item?.room;
                    if (!id) return null;
                    return {
                        id,
                        userId: userData?.userId || userData?.id,
                        username: userData?.username || userData?.name || 'Unknown',
                        email: userData?.email || '',
                        role: userData?.role || 'user'
                    };
                })
                .filter(Boolean);

            setOnlineUsers(onlineList);

            // Cập nhật bổ sung supportUsers nếu cần, dễ tìm khi click
            onlineList.forEach(u => {
                upsertSupportUser(u.id, u.username, 'Đang online', new Date().toISOString(), false);
            });
        });

        /* Lắng nghe tin nhắn từ user */
        newSocket.on('receive_user_message', (data) => {
            const { userId, username, timestamp } = data?.data?.infor || {};
            const text = data?.message;
            if (!userId || !text) return;

            upsertSupportUser(userId, username, text, timestamp, false);
            setSupportMessages(prev => ({
                ...prev,
                [userId]: [...(prev[userId] || []), { sender: 'user', text, timestamp: timestamp || new Date().toISOString() }]
            }));
            setPendingCount(prev => prev + 1);
            toast.info(`💬 ${username || 'User'}: ${text.length > 40 ? text.slice(0, 40) + '...' : text}`);
        });

        newSocket.on('disconnect', () => {
            console.log('disconnected', newSocket.id);
            setIsconnected(false);
        });

        setSocket(newSocket);
        return () => newSocket.close();
    }, [upsertSupportUser]);


    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
            supportUsers, setSupportUsers,
            supportMessages, setSupportMessages,
            onlineUsers, setOnlineUsers,
            pendingCount, setPendingCount,
            upsertSupportUser,
            addAdminMessage,
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export default { SocketProvider, useSocket };