import { useEffect } from 'react';
import { socket } from '../lib/socket';

/**
 * A generic hook to listen for specific Socket.IO events.
 * @param {string} eventName - The name of the event to listen to (e.g., 'notification')
 * @param {function} callback - Fired when the event is received
 */
export const useSocketEvents = (events, callback) => {
  useEffect(() => {
    // If not connected, connect
    if (!socket.connected) {
      socket.connect();
    }

    const eventMap = typeof events === 'string' ? { [events]: callback } : events;

    // Attach all event listeners
    Object.entries(eventMap).forEach(([eventName, handler]) => {
      if (typeof handler === 'function') {
        socket.on(eventName, handler);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      Object.entries(eventMap).forEach(([eventName, handler]) => {
        if (typeof handler === 'function') {
          socket.off(eventName, handler);
        }
      });
    };
  }, [events, callback]);
};
