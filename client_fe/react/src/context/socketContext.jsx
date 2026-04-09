import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import SOCKET_URL from '../config/configSocketUrl';
import { manageToken, getInfor } from '../utils/manageToken';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsconnected] = useState(false);

    const dataUser = () => {
        try {
            const info = getInfor();
            if (!info) return null;
            return {
                room: info.id,
                data: info
            };
        } catch (error) {
            console.error("Lỗi lấy thông tin user:", error);
            return null;
        }
    };

    useEffect(() => {
        let socketInstance = null;
        let ioSocket = null;

        const handleUserBlock = (msg) => {
            console.log("Người dùng bị block:", msg);
            alert(msg);
            manageToken.removeToken();
            window.location.href = '/auth';
        };

        const connectJavaWS = (token, data) => {
            console.log("Đang thử kết nối Java WebSocket...");
            let ws;
            try {
                ws = new WebSocket(`ws://localhost:3000/ws/webbangame?token=${token}`);
            } catch (error) {
                console.error("Lỗi khi tạo WebSocket (đã skip):", error);
                return;
            }

            if (!ws) return;

            ws.onopen = () => {
                setIsconnected(true);
                setSocket(ws);
                console.log("WebSocket Java đã kết nối");
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ event: 'join_room', data: data }));
                }
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.event === 'receive_user_block') {
                        handleUserBlock(msg.data);
                    }
                } catch (e) {
                    console.error("Lỗi parse message WebSocket:", e);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket Java error (đã skip):", error);
            };

            ws.onclose = () => {
                setIsconnected(false);
                console.log("WebSocket Java đã đóng");
            };
            socketInstance = ws;
        };

        try {
            const token = manageToken.getToken();
            if (!token) return;

            const data = dataUser();
            if (!data) return;

            ioSocket = io(SOCKET_URL, {
                token: token,
                transports: ['websocket'],
                reconnectionAttempts: 1,
                timeout: 3000
            });

            ioSocket.on("connect", () => {
                setIsconnected(true);
                setSocket(ioSocket);
                ioSocket.emit('isBlock', data)
                ioSocket.emit('join_room', data);
                console.log("Socket.io đã kết nối");
            });

            ioSocket.on("connect_error", (err) => {
                console.error("Lỗi kết nối Socket.IO, đang thử Java WS (đã skip):", err);
                ioSocket.close();
                connectJavaWS(token, data);
            });

            ioSocket.on('receive_user_block', (data) => {
                console.log("data: ", data)
                console.log("receive_user_block: ", getInfor());
                if (data.id === dataUser().data.id || data.userId === getInfor().id) {
                    handleUserBlock(data.message);
                }
            });

        } catch (error) {
            console.error("Lỗi khởi tạo socket (đã skip):", error);
        }

        return () => {
            if (socketInstance && socketInstance.close) socketInstance.close();
            if (ioSocket) ioSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};