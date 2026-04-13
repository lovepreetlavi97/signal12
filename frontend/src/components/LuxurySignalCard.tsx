'use client';

import React from 'react';
import {
   TrendingUp, TrendingDown, Clock, ShieldCheck,
   Activity, Target as TargetIcon, ShieldAlert,
   ArrowUpRight, ArrowDownRight, Zap, Info, ChevronRight,
   BarChart2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { Signal } from '@/../shared/types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

export const LuxurySignalCard: React.FC<{ signal: Signal; index: number }> = ({ signal, index }) => {
   const isTGT = signal.status === 'TARGET_HIT';
   const isSL = signal.status === 'SL_HIT';
   const isActive = signal.status === 'ACTIVE';

   // Dynamic status text & theme
   const statusConfig = {
      ACTIVE: { label: 'Waiting for Entry', color: 'text-amber-500', dot: 'bg-amber-500' },
      TARGET_HIT: { label: 'Signal Target Hit', color: 'text-emerald-500', dot: 'bg-emerald-500' },
      SL_HIT: { label: 'Stop Loss Hit', color: 'text-rose-500', dot: 'bg-rose-500' },
      CANCELLED: { label: 'Signal Cancelled', color: 'text-zinc-500', dot: 'bg-zinc-500' },
      CLOSED: { label: 'Position Closed', color: 'text-blue-500', dot: 'bg-blue-500' },
   };

   const currentStatus = statusConfig[signal.status] || statusConfig.ACTIVE;

   // 🧠 SMART PARSING (SYMBOL -> INDEX | EXPIRY | STRIKE TYPE)
   const isPE = signal.symbol.toUpperCase().includes('PE') || signal.symbol.toUpperCase().includes('PUT');
   const isCE = signal.symbol.toUpperCase().includes('CE') || signal.symbol.toUpperCase().includes('CALL');

   const words = signal.symbol.split(' ');
   const instrument = words[0] || 'NIFTY';
   const strike = signal.symbol.match(/\d{5,}/)?.[0] || '76400';
   const expiry = signal.symbol.match(/\d+(st|nd|rd|th)?\s[A-Za-z]{3}/)?.[0] || '16 APR';

   // Progress Logic
   const currentPrice = signal.currentPrice || signal.entry;
   const targetReached = currentPrice >= signal.targets[0];
   const progressPercent = Math.min(100, Math.max(0, ((currentPrice - signal.entry) / (signal.targets[0] - signal.entry)) * 100));

   return (
      <motion.div
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
         className="relative group w-full"
      >
         <div className={`
        relative flex flex-col rounded-[24px] lg:rounded-[32px] p-1 border backdrop-blur-3xl transition-all duration-700 overflow-hidden
        ${isTGT ? 'bg-emerald-500/5 border-emerald-500/20' : isSL ? 'bg-rose-500/5 border-rose-500/20' : 'bg-[#020617]/90 border-white/10'}
        hover:border-amber-500/40 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(245,158,11,0.1)]
      `}>

            {/* 🪄 GLASS CARD INNER */}
            <div className="flex-1 p-5 lg:p-7 flex flex-col gap-6 lg:gap-8 relative z-10">

               {/* 🔝 HEADER: THE STRIKE FIX */}
               <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 lg:gap-4 text-zinc-500 text-[9px] lg:text-[10px] font-black tracking-[3px] lg:tracking-[4px] uppercase">
                        <span>{instrument}</span>
                        <span className="opacity-20">|</span>
                        <span>{expiry}</span>
                     </div>
                     <div className="flex items-center gap-3 lg:gap-4">
                        <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                           <span className="text-amber-500 group-hover:text-amber-400 transition-colors duration-500">{strike}</span>
                        </h2>
                        {isCE ? (
                           <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-emerald-500 text-black text-[9px] lg:text-[10px] font-black rounded-lg tracking-widest shadow-[0_0_20px_#10b98166]">CE</span>
                        ) : (
                           <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-rose-500 text-white text-[9px] lg:text-[10px] font-black rounded-lg tracking-widest shadow-[0_0_20px_#f43f5e66]">PE</span>
                        )}
                     </div>
                  </div>

                  <div className="text-right">
                     <p className="text-2xl lg:text-3xl font-black text-white tracking-tighter leading-none mb-1">₹{currentPrice.toFixed(2)}</p>
                     <div className={`flex items-center justify-end gap-1 text-[10px] lg:text-[11px] font-black ${targetReached ? 'text-emerald-500' : 'text-zinc-500'}`}>
                        <Activity size={10} />
                        <span>+2.4%</span>
                     </div>
                  </div>
               </div>

               {/* ⚡ SIGNAL SECTION: HERO AREA */}
               <div className="space-y-6 pt-4 border-t border-white/5 relative">
                  <div className="space-y-2">
                     <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-black text-zinc-500 tracking-[3px] lg:tracking-[5px] uppercase">
                        <Zap size={12} className="text-amber-500" fill="currentColor" /> Strategic Entry
                     </div>
                     <h1 className="text-2xl lg:text-4xl font-black text-white tracking-tighter uppercase">
                        BUY ABOVE <span className="gold-gradient italic">₹{signal.entry.toFixed(0)}</span>
                     </h1>
                  </div>

                  <div className="grid grid-cols-2 gap-6 lg:gap-10">
                     <div className="space-y-1">
                        <p className="text-[9px] lg:text-[10px] text-zinc-500 font-black tracking-[2px] lg:tracking-[3px] uppercase flex items-center gap-2">
                           <AlertTriangle size={10} className="text-rose-500" /> SL
                        </p>
                        <p className="text-xl lg:text-2xl font-black text-rose-500 tracking-tight leading-none">₹{signal.sl.toFixed(0)}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] lg:text-[10px] text-zinc-500 font-black tracking-[2px] lg:tracking-[3px] uppercase">Targets</p>
                        <div className="flex items-center gap-2 lg:gap-3">
                           <span className={`text-xl lg:text-2xl font-black tracking-tight leading-none ${currentPrice >= signal.targets[0] ? 'text-emerald-400' : 'text-zinc-200'}`}>₹{signal.targets[0]}</span>
                           <ArrowRight size={12} className="text-zinc-700" />
                           <span className="text-lg lg:text-xl font-bold text-zinc-600 tracking-tight italic">++</span>
                        </div>
                     </div>
                  </div>

                  {/* 📊 PROGRESS TRACKER */}
                  <div className="space-y-3">
                     <div className="flex justify-between items-end">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Performance Protocol</span>
                        <span className="text-[11px] font-black text-amber-500 tracking-tighter">{progressPercent.toFixed(0)}% Secured</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: `${progressPercent}%` }}
                           transition={{ duration: 1, ease: 'easeOut' }}
                           className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-white shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        />
                     </div>
                  </div>
               </div>

               {/* 🔘 ACTION BUTTONS */}
               <div className="grid grid-cols-2 gap-3 lg:gap-4 mt-auto">
                  <button className="group relative h-12 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-[1px] transform active:scale-95 transition-all outline-none">
                     <div className="h-full w-full rounded-xl lg:rounded-2xl bg-[#020617] group-hover:bg-transparent transition-colors duration-300 flex items-center justify-center p-2 lg:p-4">
                        <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[2px] lg:tracking-[3px] text-white whitespace-nowrap">Long Position</span>
                     </div>
                  </button>

                  <button className="h-12 lg:h-14 rounded-xl lg:rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center gap-2 transform active:scale-95 transition-all hover:bg-white/[0.08]">
                     <BarChart2 size={14} className="text-zinc-500" />
                     <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[2px] lg:tracking-[3px] text-zinc-400 whitespace-nowrap">Chart Flow</span>
                  </button>
               </div>

               {/* 🕒 FOOTER & STATUS */}
               <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-2.5 h-2.5 rounded-full ${currentStatus.dot} animate-pulse shadow-[0_0_10px_currentColor]`} />
                     <span className={`text-[10px] font-black uppercase tracking-widest ${currentStatus.color}`}>{currentStatus.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase">
                     <Clock size={12} />
                     <span>{formatDistanceToNow(new Date(signal.createdAt))} ago</span>
                  </div>
               </div>

            </div>

            {/* 🌌 AMBIENT OVERLAYS */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
         </div>
      </motion.div>
   );
};
////new