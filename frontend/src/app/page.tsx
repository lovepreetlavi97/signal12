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
            <MobileNavItem icon={<Crown size={24} />} label="VIP Member" onClick={() => setIsMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 mt-20 lg:mt-28 p-4 lg:p-20 relative flex flex-col items-center lg:justify-center min-h-0">
        
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/20 rounded-full blur-[160px]" />
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="w-full max-w-4xl relative z-10 flex flex-col items-center gap-12">
          
          <div className="text-center space-y-4">
             {/* 📟 INTELLIGENCE STREAM HEADER */}
             <div className="flex flex-col items-center gap-4 lg:gap-6 mb-8">
               <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 px-6 py-2 rounded-full backdrop-blur-md">
                  <div className="relative">
                     <div className={`w-2 h-2 rounded-full ${
                       connectionStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 
                       connectionStatus === 'error' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 
                       'bg-amber-500 animate-pulse'
                     }`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-zinc-400">
                     Neural Data: <span className={
                       connectionStatus === 'online' ? 'text-emerald-500' : 
                       connectionStatus === 'error' ? 'text-rose-500' : 
                       'text-amber-500'
                     }>{connectionStatus}</span>
                  </span>
                  <div className="h-4 w-px bg-white/10 mx-2" />
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-zinc-500">
                     Verified: {signals.length}
                  </span>
               </div>
             </div>
             <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase font-outfit leading-none">Latest Suggestion</h1>
          </div>

          <div className="w-full">
            {loading ? (
              <div className="skeleton h-[550px] w-full max-w-2xl mx-auto" />
            ) : latestSignal ? (
              <div className="max-w-2xl mx-auto transform lg:scale-110 transition-transform">
                <LuxurySignalCard signal={latestSignal} index={0} />
              </div>
            ) : (
              <div className="py-24 text-center space-y-6 lg:space-y-8">
                <div className="relative inline-block">
                  <Activity size={80} className="mx-auto text-amber-500/20 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldAlert size={32} className="text-amber-500/40" />
                  </div>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-zinc-700 font-outfit uppercase tracking-tighter">No Active Signals</h2>
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl max-w-md mx-auto space-y-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest leading-relaxed">
                       Node: {API_URL}<br/>
                       Status: Awaiting connection...
                    </p>
                    <div className="text-amber-500/50 text-[9px] font-black uppercase tracking-widest">
                       Signals Received: {signals.length}
                    </div>
                  </div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all"
                  >
                    <RefreshCcw size={12} /> Force Node Sync
                  </button>
                </div>
              </div>
            )}
          </div>


          <div className="flex flex-col items-center gap-6">
             <Link href="/history">
                <button className="px-12 py-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 hover:bg-white/[0.06] transition-all group flex items-center gap-4 text-zinc-400 hover:text-white">
                   <History size={18} className="group-hover:rotate-[-45deg] transition-transform" />
                   <span className="text-xs font-black uppercase tracking-[3px]">Access Signal Archives</span>
                </button>
             </Link>
             <p className="text-[10px] text-zinc-700 uppercase font-bold tracking-[2px]">Synthesized via Verified Global Data Flow</p>
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
