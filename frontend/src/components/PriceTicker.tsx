'use client';

import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PriceData {
  price: number;
  timestamp: string;
  change: {
    value: number;
    percentage: number;
  };
}

interface InstrumentPrice {
  [key: string]: PriceData | null;
}

const PriceTicker: React.FC = () => {
  const [prices, setPrices] = useState<InstrumentPrice>({
    'NIFTY 50': null,
    'NIFTY BANK': null,
    'SENSEX': null,
    'INDIA VIX': null,
    'USD-INR': null
  });
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const socket: Socket = io('http://localhost:4001', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to price server');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from price server');
      setConnectionStatus('disconnected');
    });

    socket.on('price_update', (data: { instrument: string; price: number; timestamp: string; change: PriceData['change'] }) => {
      setPrices(prev => ({
        ...prev,
        [data.instrument]: {
          price: data.price,
          timestamp: data.timestamp,
          change: data.change
        }
      }));
    });

    // Fetch initial prices
    const fetchInitialPrices = async () => {
      try {
        const response = await fetch('http://localhost:4001/api/v1/market/prices');
        const data = await response.json();
        if (data.success) {
          setPrices(data.data.prices);
        }
      } catch (error) {
        console.error('Failed to fetch initial prices:', error);
      }
    };

    fetchInitialPrices();

    return () => {
      socket.disconnect();
    };
  }, []);

  const formatPrice = (price: number | null): string => {
    if (price === null) return '--';
    return price.toFixed(2);
  };

  const getChangeColor = (change: PriceData['change'] | null): string => {
    if (!change) return 'text-zinc-500';
    if (change.value > 0) return 'text-green-400';
    if (change.value < 0) return 'text-red-400';
    return 'text-zinc-500';
  };

  const instruments = [
    { name: 'NIFTY 50', short: 'NIFTY' },
    { name: 'NIFTY BANK', short: 'BANK' },
    { name: 'SENSEX', short: 'SENSEX' },
    { name: 'INDIA VIX', short: 'VIX' },
    { name: 'USD-INR', short: 'USD/INR' }
  ];

  return (
    <div className="bg-black/50 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Activity size={16} className="text-amber-500" />
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Live Markets</span>
            </div>
            
            <div className="flex items-center space-x-6">
              {instruments.map((instrument) => {
                const priceData = prices[instrument.name];
                const changeColor = getChangeColor(priceData?.change || null);
                const isPositive = priceData?.change?.value && priceData.change.value > 0;
                const isNegative = priceData?.change?.value && priceData.change.value < 0;

                return (
                  <div key={instrument.name} className="flex items-center space-x-2">
                    <span className="text-xs text-zinc-400 font-medium min-w-[60px]">
                      {instrument.short}
                    </span>
                    <span className="text-sm text-white font-mono font-semibold min-w-[50px] text-right">
                      {formatPrice(priceData?.price || null)}
                    </span>
                    {priceData?.change && (
                      <div className="flex items-center space-x-1">
                        {isPositive && <TrendingUp size={12} className="text-green-400" />}
                        {isNegative && <TrendingDown size={12} className="text-red-400" />}
                        <span className={`text-xs font-medium ${changeColor} min-w-[35px] text-right`}>
                          {isPositive && '+'}
                          {priceData.change.percentage.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-zinc-500 capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTicker;
