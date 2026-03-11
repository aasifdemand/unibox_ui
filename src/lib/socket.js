import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const defaultBaseUrl = API_URL.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8080';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || defaultBaseUrl;

// Initialize a generic socket client
// Make sure this doesn't auto-connect initially if we don't have a token,
// though in a dashboard app we usually have cookies available.
export const socket = io(SOCKET_URL, {
    autoConnect: false, // We'll connect manually when we confirm auth
    withCredentials: true,
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
