import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const BACKEND_URL = 'http://157.173.101.159:9206';

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastScan, setLastScan] = useState(null); // { uid, balance }
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([{ text: '⚡ Smart-Pay initialized', time: new Date() }]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const [topupResult, setTopupResult] = useState(null);
  const [payResult, setPayResult] = useState(null);

  const addLog = useCallback((text) => {
    setLogs(prev => {
      const newLogs = [{ text, time: new Date() }, ...prev].slice(0, 50);
      return newLogs;
    });
  }, []);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      addLog('✓ Connected to backend');
      socket.emit('request-products');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      addLog('✗ Disconnected from backend');
    });

    socket.on('card-scanned', (data) => {
      const { uid } = data;
      addLog(`🔍 Card detected: ${uid}`);
      setLastScan({ uid, balance: null });
      socket.emit('request-balance', { uid });
    });

    socket.on('balance-response', (data) => {
      if (data.success) {
        const balance = data.balance !== null ? data.balance : 0;
        setLastScan(prev => prev ? { ...prev, balance } : { uid: data.uid, balance });
        addLog(`📊 Balance: $${balance.toFixed(2)}`);
      }
    });

    socket.on('products-response', (data) => {
      if (data.success) {
        setProducts(data.products);
        addLog(`✓ Loaded ${data.products.length} products`);
      } else {
        addLog('✗ Failed to load products');
      }
    });

    socket.on('topup-success', (data) => {
      const { uid, amount, newBalance } = data;
      addLog(`✓ Top-up: +$${amount.toFixed(2)} | Balance: $${newBalance.toFixed(2)}`);
      setLastScan(prev => prev ? { ...prev, balance: newBalance } : null);
      setStats(prev => ({ total: prev.total + 1, success: prev.success + 1, failed: prev.failed }));
      setTopupResult({ success: true, amount, newBalance });
    });

    socket.on('payment-success', (data) => {
      const { uid, amount, newBalance } = data;
      addLog(`✓ Payment: -$${amount.toFixed(2)} | Balance: $${newBalance.toFixed(2)}`);
      setLastScan(prev => prev ? { ...prev, balance: newBalance } : null);
      setStats(prev => ({ total: prev.total + 1, success: prev.success + 1, failed: prev.failed }));
      setPayResult({ success: true, amount, newBalance });
    });

    socket.on('payment-declined', (data) => {
      const { reason, required, available } = data;
      addLog(`✗ Payment declined: ${reason}`);
      setStats(prev => ({ total: prev.total + 1, success: prev.success, failed: prev.failed + 1 }));
      setPayResult({ success: false, reason, required, available });
    });

    return () => {
      socket.disconnect();
    };
  }, [addLog]);

  const requestProducts = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('request-products');
    }
  }, []);

  const clearTopupResult = useCallback(() => setTopupResult(null), []);
  const clearPayResult = useCallback(() => setPayResult(null), []);

  return (
    <SocketContext.Provider value={{
      connected,
      lastScan,
      setLastScan,
      products,
      logs,
      stats,
      topupResult,
      payResult,
      addLog,
      requestProducts,
      clearTopupResult,
      clearPayResult,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
