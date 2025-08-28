import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (url, options = {}) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const connect = useCallback(() => {
    // If socket already exists and is connected, return it
    if (socketRef.current && socketRef.current.connected) {
      return socketRef.current;
    }

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Create new socket connection
    socketRef.current = io(url, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      ...options
    });

    // Event listeners
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error);
      setIsConnected(false);
    });

    return socketRef.current;
  }, [url, options]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setConnectionError(null);
    }
  }, []);

  useEffect(() => {
    const socketInstance = connect();

    return () => {
      // socket manage reconnection
      // The socket will automatically handle cleanup when component unmounts
    };
  }, [connect]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    connect,
    disconnect
  };
};