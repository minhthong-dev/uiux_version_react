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
        return {
            room: getInfor().id,
            data: getInfor()
        }
    }
    useEffect(() => {
    let socketInstance = null;
    const token = manageToken.getToken();
    if (!token) return;

    const data = dataUser();


    const connectJavaWS = () => {
        console.log("Đang thử kết nối Java WebSocket...");
        const wsUrl = `ws://localhost:3636/ws/webbamegame?token=${token}`;
        let ws;
        try {
             ws = new WebSocket(`ws://localhost:3636/ws/webbangame?token=${token}`);
             console.log("WebSocket Java đã được tạo:", ws);
            } catch (error) {
            console.error("Lỗi khi tạo WebSocket:", error);
        }

        ws.onopen = () => {
            setIsconnected(true);
            setSocket(ws);
            console.log("WebSocket Java đã kết nối:", ws);
            ws.send(JSON.stringify({ event: 'join_room', data: data }));
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.event === 'receive_user_block') {
                handleUserBlock(msg.data);
            }
        };

        ws.onclose = () => setIsconnected(false);
        socketInstance = ws;
    };

   
    const handleUserBlock = (msg) => {
        console.log("Người dùng bị block:", msg);
        alert(msg);
        manageToken.removeToken();
        window.location.href = '/auth';
    };

   
    const ioSocket = io(SOCKET_URL, {
        token: token, 
        transports: ['websocket'],
        reconnectionAttempts: 2, 
        timeout: 5000 
    });

    ioSocket.on("connect", () => {
    
        setIsconnected(true);
        setSocket(ioSocket);
        ioSocket.emit('join_room', data);
    });
    ioSocket.on("connect_error", (err) => {
        ioSocket.close(); 
        console.error("Lỗi kết nối Socket.IO:", err);
        connectJavaWS(); 
    });

    ioSocket.on('receive_user_block', (data) => handleUserBlock(data));

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