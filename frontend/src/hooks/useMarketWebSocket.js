import { useEffect, useState, useRef } from 'react';

export function useMarketWebSocket(url) {
  const [marketData, setMarketData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => setIsConnected(true);
    wsRef.current.onclose = () => setIsConnected(false);
    
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'SNAPSHOT') {
        setMarketData(message.data);
      } else if (message.type === 'PRICE_UPDATE') {
        const updated = message.data;
        setMarketData((prev) => ({
          ...prev,
          [updated.symbol]: updated,
        }));
      }
    };

    return () => {
      wsRef.current?.close();
    };
  }, [url]);

  return { marketData, isConnected };
}