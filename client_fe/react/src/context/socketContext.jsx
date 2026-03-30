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
        const info = getInfor();
        return {
            room: info?.id,
            data: info
        };
    };

    useEffect(() => {
        let javaWsInstance = null;
        let ioSocketInstance = null;
        const token = manageToken.getToken();
        
        if (!token) return;

        const userData = dataUser();

        const connectJavaWS = () => {
            const javaWsHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                ? "ws://localhost:3636"
                : "wss://java-version-webbangame.onrender.com";
            
            const wsUrl = `${javaWsHost}/ws/webbangame?token=${token}`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                javaWsInstance = ws;
                setSocket(ws);
                setIsconnected(true);
                ws.send(JSON.stringify({ event: 'xin chao minh thong', data: userData }));
                ws.send(JSON.stringify({ event: 'join_room', data: userData }));
                console.log("Connected to Java WebSocket server");
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.event === 'receive_user_block') {
                        handleUserBlock(msg.data);
                    }
                } catch (e) {
                    console.error(e);
                }
            };

            ws.onclose = () => {
                setIsconnected(false);
            };

            ws.onerror = () => {
                setIsconnected(false);
            };
        };

        const handleUserBlock = (msg) => {
            alert(msg);
            manageToken.removeToken();
            window.location.href = '/auth';
        };

        const ioSocket = io(SOCKET_URL, {
            token: token,
            transports: ['websocket'],
            reconnectionAttempts: 1,
            timeout: 5000
        });

        ioSocket.on("connect", () => {
            ioSocketInstance = ioSocket;
            setSocket(ioSocket);
            setIsconnected(true);
            ioSocket.emit('join_room', userData);
        });

        ioSocket.on("connect_error", () => {
            ioSocket.close();
            if (!javaWsInstance) {
                connectJavaWS();
            }
        });

        ioSocket.on('receive_user_block', (data) => handleUserBlock(data));

        return () => {
            if (ioSocketInstance) ioSocketInstance.disconnect();
            if (javaWsInstance) javaWsInstance.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};