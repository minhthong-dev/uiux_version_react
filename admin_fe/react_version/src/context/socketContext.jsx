import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import SOCKET_URL from '../config/configSocketUrl';
import { manageToken } from '../utils/manageToken';
const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsconnected] = useState(false);

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['polling', 'websocket'],
            withCredentials: true
        });
        newSocket.on("connect", () => {
            console.log("connected", newSocket.id);
            setIsconnected(true);
        });
        newSocket.emit("iam_admin", manageToken.getToken());
        newSocket.on("admin_check", (data) => {
            console.log(data);
        })
        newSocket.on("disconnect", () => {
            console.log("disconnected", newSocket.id);
            setIsconnected(false);
        });
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);


    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};