/**
 * DYNAMIC CONFIGURATION SYSTEM
 * Ensures the app works on localhost, 127.0.0.1, and local network IPs (192.168.x.x)
 */

export const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // The backend always runs on port 4000 in this setup
        return `http://${hostname}:4000`;
    }
    return 'http://localhost:4000';
};

export const API_URL = getBaseUrl();
export const SOCKET_URL = getBaseUrl();

export const SOCKET_CONFIG = {
    path: '/socket.io',
    transports: ['websocket', 'polling'], // Allow fallback for mobile browsers
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
};
