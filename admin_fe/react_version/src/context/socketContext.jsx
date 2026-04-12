import React, { createContext, useContext, useEffect, useState } from 'react';
import { manageToken, getInfor } from '../utils/manageToken';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsconnected] = useState(false);

    const dataUser = () => {
        const info = getInfor();
        return {
            room: info?.id,
            data: info
        };
    };

    useEffect(() => {
        let javaWsInstance = null;
        const token = manageToken.getToken();

        if (!token) return;

        const userData = dataUser();

        const connectJavaWS = () => {
            const javaWsHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                ? "ws://localhost:3636"
                : "wss://java-version-webbangame.onrender.com";

            const wsUrl = `${javaWsHost}/ws/webbangame?token=${token}`;
            const ws = new WebSocket(wsUrl);
            javaWsInstance = ws;

            ws.onopen = () => {
                setSocket(ws);
                // Gửi thông tin để server xác nhận kết nối
                ws.send(JSON.stringify({ event: 'xin chao minh thong', data: userData }));
                ws.send(JSON.stringify({ event: 'join_room', data: userData }));
                ws.send(JSON.stringify({ event: 'isConnected', data: userData }));
                console.log("Java WebSocket opened, waiting for confirmation...");
            };

            const handleMessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    // Xác nhận kết nối từ server Java
                    if (msg.event === 'server_confirm_connection') {
                        setIsconnected(true);
                        console.log("Server confirmed connection:", msg.message);
                    }
                    if (msg.event === 'receive_user_block') {
                        handleUserBlock(msg.data);
                    }
                } catch (e) {
                    console.error("Lỗi parse message Java:", e);
                }
            };

            ws.addEventListener('message', handleMessage);

            ws.onclose = () => {
                setIsconnected(false);
                ws.removeEventListener('message', handleMessage);
            };

            ws.onerror = (error) => {
                console.error("WebSocket Error:", error);
                setIsconnected(false);
                ws.removeEventListener('message', handleMessage);
            };
        };

        const handleUserBlock = (msg) => {
            alert(msg);
            manageToken.removeToken();
            window.location.href = '/auth';
        };

        // Kết nối thẳng tới Java hoàn toàn
        connectJavaWS();

        return () => {
            if (javaWsInstance) {
                javaWsInstance.close();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};