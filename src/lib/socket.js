import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const SOCKET_BASE = API_URL.replace(/\/api\/v1\/?$/, '');

// Initialize a generic socket client
export const socket = io(SOCKET_BASE, {
    autoConnect: false, // We'll connect manually when we confirm auth
    withCredentials: true,
    transports: ['websocket', 'polling'],
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
