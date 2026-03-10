import { useEffect } from 'react';
import { socket } from '../lib/socket';

/**
 * A generic hook to listen for specific Socket.IO events.
 * @param {string} eventName - The name of the event to listen to (e.g., 'notification')
 * @param {function} callback - Fired when the event is received
 */
export const useSocketEvents = (eventName, callback) => {
    useEffect(() => {
        // If not connected, connect
        if (!socket.connected) {
            socket.connect();
        }

        // Attach event listener
        socket.on(eventName, callback);

        // Cleanup listener on unmount
        return () => {
            socket.off(eventName, callback);
        };
    }, [eventName, callback]);
};
