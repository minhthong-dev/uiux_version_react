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
        const data = dataUser();
        if (!manageToken.getToken()) return;
        const newSocket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['polling', 'websocket'],
            withCredentials: true
        });
        newSocket.on("connect", () => {
            setIsconnected(true);
        });
        newSocket.on("disconnect", () => {
            setIsconnected(false);
        });
        newSocket.emit('join_room', dataUser());
        // console.log(dataUser());
        newSocket.emit('user_infor_connected', data);
        setSocket(newSocket);
        newSocket.on('receive_user_block', (data) => {
            console.log(data);
            alert(data);
            manageToken.removeToken();
            window.location.href = '/auth';
        })
        return () => newSocket.close();
    }, []);


    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};