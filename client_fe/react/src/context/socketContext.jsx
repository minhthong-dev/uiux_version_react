import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import SOCKET_URL from '../config/configSocketUrl';

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