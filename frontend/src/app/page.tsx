'use client';

import React, { useEffect, useState } from 'react';
import { useSignalStore } from '@/store/useSignalStore';
import { LuxurySignalCard } from '@/components/LuxurySignalCard';
import { MarketOverviewBar } from '@/components/MarketOverviewBar';
import { LayoutDashboard, Shield, Crown, Activity, Sparkles, TrendingUp, Search, Bell, Menu, X, History, RefreshCcw, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimeLogo } from '@/components/PrimeLogo';
import Link from 'next/link';
import { API_URL, SOCKET_URL } from '@/config';

export default function Home() {
  const { signals, loading, connect, setSignals, socket } = useSignalStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        console.log('Fetching initial signals from:', API_URL);
        const res = await fetch(`${API_URL}/signals`);
        const data = await res.json();
        setSignals(data);
      } catch (err) { 
        console.error('Initial fetch failed:', err);
        setSignals([]);
      }
    };

    fetchSignals();
    connect(SOCKET_URL);

    // Fallback polling
    const interval = setInterval(fetchSignals, 10000);
    return () => clearInterval(interval);
  }, [connect, setSignals]);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => setConnectionStatus('online'));
      socket.on('disconnect', () => setConnectionStatus('offline'));
      socket.on('connect_error', () => setConnectionStatus('error'));
    }
  }, [socket]);

  const latestSignal = signals[0];

  return (
    <div className="min-h-screen relative flex flex-col bg-[#0b0b0f]">

      <MarketOverviewBar 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isMobileMenuOpen={isMobileMenuOpen} 
      />

      {/* 📱 Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 top-20 bg-[#0b0b0f]/95 backdrop-blur-2xl z-[65] p-8 flex flex-col gap-6"
          >
            <MobileNavItem icon={<LayoutDashboard size={24} />} label="Terminal" active onClick={() => setIsMobileMenuOpen(false)} />
            <Link href="/history" className="contents">
               <MobileNavItem icon={<History size={24} />} label="History" onClick={() => setIsMobileMenuOpen(false)} />
            </Link>
            <MobileNavItem icon={<Shield size={24} />} label="Security" onClick={() => setIsMobileMenuOpen(false)} />
            <Link href="/plans" className="contents">
               <MobileNavItem icon={<Crown size={24} />} label="Elite Plans" onClick={() => setIsMobileMenuOpen(false)} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 mt-20 lg:mt-28 p-4 lg:p-20 relative flex flex-col items-center justify-center min-h-[calc(100vh-112px)]">
        
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/20 rounded-full blur-[160px]" />
        </div>

        <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
          <div className="w-full">
            {loading ? (
              <div className="skeleton h-[550px] w-full max-w-2xl mx-auto" />
            ) : latestSignal ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto transform lg:scale-110 transition-transform"
              >
                <LuxurySignalCard signal={latestSignal} index={0} />
              </motion.div>
            ) : (
              <div className="py-24 text-center space-y-6">
                <Activity size={80} className="mx-auto text-amber-500/20 animate-pulse" />
                <h2 className="text-3xl font-black text-zinc-700 font-outfit uppercase tracking-tighter">Awaiting Signal...</h2>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, active }: any) {
  return (
    <div className={`p-4 rounded-2xl transition-all cursor-pointer group ${active ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'text-zinc-600 hover:text-white hover:bg-white/5'
      }`}>
      {icon}
    </div >
  );
}

function MobileNavItem({ icon, label, active, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-6 p-6 rounded-2xl border transition-all ${active ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/[0.02] border-white/5 text-zinc-400'
        }`}
    >
      {icon}
      <span className="text-lg font-black uppercase tracking-widest">{label}</span>
    </div >
  );
}
