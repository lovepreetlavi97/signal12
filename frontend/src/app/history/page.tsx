'use client';

import React, { useEffect, useState } from 'react';
import { useSignalStore } from '@/store/useSignalStore';
import { LuxurySignalCard } from '@/components/LuxurySignalCard';
import { MarketOverviewBar } from '@/components/MarketOverviewBar';
import { Activity, LayoutDashboard, History, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getApiUrl, getSocketUrl } from '@/config';

export default function SignalHistory() {
  const { signals, loading, connect, setSignals } = useSignalStore();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/signals`);
        const data = await res.json();
        setSignals(data);
      } catch (err) { 
        console.error(err);
        setSignals([]); // End loading state
      }
    };
    fetchSignals();
    connect(getSocketUrl());
  }, [connect, setSignals]);

  const filteredSignals = activeFilter === 'ALL'
    ? signals
    : signals.filter(s => s.symbol.toUpperCase().includes(activeFilter));

  return (
    <div className="min-h-screen relative flex flex-col bg-[#0b0b0f]">
      <MarketOverviewBar 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <main className="flex-1 mt-20 lg:mt-28 p-4 lg:p-20 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-white/5 pb-12">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase font-outfit">Signal History</h1>
              <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">Total Synthesized Intelligence: {signals.length} Signals</p>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
              {['ALL', 'NIFTY', 'SENSEX'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`relative px-8 py-3 rounded-xl text-[10px] uppercase font-black tracking-[3px] transition-all duration-500 whitespace-nowrap overflow-hidden ${
                    activeFilter === filter ? 'text-black' : 'text-zinc-500 hover:text-white bg-white/[0.02] border border-white/5'
                  }`}
                >
                  <AnimatePresence>
                    {activeFilter === filter && (
                      <motion.div
                        layoutId="filter-pill-history"
                        className="absolute inset-0 bg-amber-500"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative z-10">{filter}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="skeleton h-[450px]" />
              ))
            ) : (
              filteredSignals.map((signal, idx) => (
                <LuxurySignalCard key={signal._id} signal={signal} index={idx} />
              ))
            )}
          </div>

          {!loading && filteredSignals.length === 0 && (
            <div className="py-24 text-center space-y-6">
              <Activity size={80} className="mx-auto text-zinc-800 animate-pulse" />
              <h2 className="text-3xl font-black text-zinc-700 uppercase tracking-tighter">No History Found</h2>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
