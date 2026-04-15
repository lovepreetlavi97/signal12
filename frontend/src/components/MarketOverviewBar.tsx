import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, LayoutDashboard, TrendingUp as SignalIcon, Shield, Crown, Globe, Cpu } from 'lucide-react';
import { PrimeLogo } from './PrimeLogo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MarketTick = ({ symbol, value, change, isUp }: any) => (
  <div className="flex items-center gap-4 lg:gap-6 px-4 lg:px-8 last:border-none group cursor-pointer hover:bg-white/[0.02] transition-all duration-300 h-full shrink-0">
    <div className="flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-0.5">
         <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[2px] group-hover:text-amber-500/50 transition-colors whitespace-nowrap">{symbol}</span>
         <div className={`w-1 h-1 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'} opacity-40 group-hover:opacity-100 animate-pulse`} />
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-mono font-black tracking-tight text-white">{value}</span>
        <span className={`text-[10px] font-black ${isUp ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-0.5`}>
          {isUp ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
          {change}%
        </span>
      </div>
    </div>
  </div>
);

export const MarketOverviewBar = ({ onMenuToggle, isMobileMenuOpen }: { onMenuToggle?: () => void, isMobileMenuOpen?: boolean }) => {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 right-0 h-20 lg:h-28 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/10 z-[70] flex items-center overflow-visible">
      
      {/* 🏛️ INSTITUTIONAL BRANDING (Left) */}
      <div className="flex h-full items-center px-4 lg:px-6 gap-4 lg:gap-8 shrink-0">
         <Link href="/" className="flex items-center transition-all bg-transparent border-none mix-blend-screen overflow-visible">
            <PrimeLogo className="w-20 lg:w-28 h-20 lg:h-28" />
         </Link>
      </div>

      {/* 📊 GLOBAL DATA STREAM (Center) */}
      <div className="flex items-center h-full flex-1 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center h-full px-2 lg:px-6">
           <MarketTick symbol="NIFTY 50" value="22,514.20" change="0.42" isUp />
           <MarketTick symbol="SENSEX" value="74,248.10" change="0.12" isUp />
           <MarketTick symbol="USD INR" value="83.42" change="0.05" isUp={false} />
           <MarketTick symbol="INDIA VIX" value="12.42" change="1.25" isUp={false} />
        </div>
      </div>

      {/* 👤 USER PROFILE (Right) */}
      <div className="ml-auto lg:px-10 px-4 flex items-center gap-3 lg:gap-8 bg-gradient-to-l from-[#020617] via-[#020617] to-transparent h-full shrink-0">
          
          <div className="hidden lg:flex items-center gap-6 pr-6 border-r border-white/5">
             <Link href="/" className={`text-[10px] font-black uppercase tracking-[3px] transition-colors ${pathname === '/' ? 'text-amber-500' : 'text-zinc-500 hover:text-white'}`}>Terminal</Link>
             <Link href="/history" className={`text-[10px] font-black uppercase tracking-[3px] transition-colors ${pathname === '/history' ? 'text-amber-500' : 'text-zinc-500 hover:text-white'}`}>History</Link>
             <Link href="/plans" className={`text-[10px] font-black uppercase tracking-[3px] transition-colors ${pathname === '/plans' ? 'text-amber-500' : 'text-zinc-500 hover:text-white'}`}>Plans</Link>
          </div>

          <Link href="/profile" className="flex items-center gap-4 group cursor-pointer lg:flex hidden">
             <div className="flex flex-col text-right">
                <div className="flex items-center gap-2 justify-end">
                   <span className="text-[11px] font-black text-white uppercase tracking-tight">Prime Member</span>
                   <Crown size={12} className="text-amber-500 fill-amber-500/20" />
                </div>
                <div className="flex items-center gap-2 justify-end">
                   <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest">Premium Access</span>
                </div>
             </div>
             
             <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-white/5 border border-white/10 flex items-center justify-center group-hover:border-amber-500/50 transition-all duration-300">
                   <Shield size={20} className="text-amber-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#020617] shadow-[0_0_10px_#10b981]" />
             </div>
          </Link>
          
          <button 
            onClick={onMenuToggle}
            className="bg-white/5 hover:bg-white/10 transition-colors h-10 w-10 rounded-xl border border-white/10 flex items-center justify-center lg:hidden text-zinc-400 hover:text-white"
          >
             {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
      </div>
    </div>
  );
};

import { Menu, X } from 'lucide-react';

function HeaderLink({ href, active, icon, label }: any) {
  return (
    <Link href={href} className={`flex items-center gap-3 transition-all group relative ${active ? 'text-amber-500' : 'text-zinc-500 hover:text-white'}`}>
       <div className={`p-2 rounded-xl transition-all ${active ? 'bg-amber-500/10' : 'bg-transparent group-hover:bg-white/5'}`}>
          {icon}
       </div>
       <span className="text-[10px] font-black uppercase tracking-[3px] group-hover:tracking-[4px] transition-all whitespace-nowrap">{label}</span>
       {active && (
         <motion.div 
            layoutId="header-nav-indicator" 
            className="absolute -bottom-[29px] left-0 right-0 h-[3px] bg-amber-500 shadow-[0_0_20px_#f59e0b] rounded-t-full" 
         />
       )}
    </Link>
  );
}
