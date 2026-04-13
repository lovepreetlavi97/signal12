'use client';

import React, { useState, useEffect } from 'react';
import { useSignalStore } from '@/store/useSignalStore';
import { PrimeLogo } from '@/components/PrimeLogo';
import {
   Send, Trash2, CheckCircle, RefreshCcw, LayoutDashboard,
   PlusCircle, Users, Activity, ShieldAlert, BadgeCheck, XCircle, Menu, X, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { MarketOverviewBar } from '@/components/MarketOverviewBar';
import { motion } from 'framer-motion';
import { getApiUrl } from '@/config';

export default function AdminDashboard() {
   const [tab, setTab] = useState('signals');
   const [users, setUsers] = useState<any[]>([]);
   const [packages, setPackages] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

   const [newSignal, setNewSignal] = useState({
      symbol: '', type: 'BUY', entry: '', sl: '', targets: '', market: 'NSE'
   });
   
   const [newPackage, setNewPackage] = useState({
      name: '', price: '', durationInDays: '30', features: '', badge: 'PREMIUM'
   });

   useEffect(() => {
      if (tab === 'users') fetchUsers();
      if (tab === 'packages') fetchPackages();
   }, [tab]);

   const fetchUsers = async () => {
      setLoading(true);
      try {
         const res = await axios.get(`${getApiUrl()}/admin/users`);
         setUsers(res.data);
      } catch (err) { console.error('Users fetch error'); }
      setLoading(false);
   };

   const fetchPackages = async () => {
      setLoading(true);
      try {
         const res = await axios.get(`${getApiUrl()}/admin/packages`);
         setPackages(res.data);
      } catch (err) { console.error('Packages fetch error'); }
      setLoading(false);
   };

   const createPackage = async () => {
      try {
         const payload = {
            ...newPackage,
            price: parseFloat(newPackage.price),
            durationInDays: parseInt(newPackage.durationInDays),
            features: newPackage.features.split(',').map(f => f.trim())
         };
         await axios.post(`${getApiUrl()}/admin/packages`, payload);
         setNewPackage({ name: '', price: '', durationInDays: '30', features: '', badge: 'PREMIUM' });
         fetchPackages();
      } catch (err) { console.error('Package creation failed'); }
   };

   const deletePackage = async (id: string) => {
      try {
         await axios.delete(`${getApiUrl()}/admin/packages/${id}`);
         fetchPackages();
      } catch (err) { console.error('Delete package error'); }
   };

   const createSignal = async () => {
      if (!newSignal.symbol || !newSignal.entry) return;
      try {
         const payload = {
            ...newSignal,
            entry: parseFloat(newSignal.entry),
            sl: parseFloat(newSignal.sl) || 0,
            targets: newSignal.targets.split('/').map(t => parseFloat(t.trim())),
            aiScore: 98,
            aiRationale: 'Strong market trend alignment detected.'
         };
         await axios.post(`${getApiUrl()}/signals`, payload);
         setNewSignal({ symbol: '', type: 'BUY', entry: '', sl: '', targets: '', market: 'NSE' });
      } catch (err) { console.error('Dispatch failed'); }
   };

   const deleteSignal = async (id: string) => {
      try {
         await axios.delete(`${getApiUrl()}/signals/${id}`);
      } catch (err) { console.error('Delete error'); }
   };

   const toggleTab = (t: string) => {
      setTab(t);
      setIsMobileMenuOpen(false);
   };

   return (
      <div className="min-h-screen bg-[#020202] text-white flex flex-col lg:flex-row">
         <MarketOverviewBar />

         <header className="lg:hidden fixed top-0 w-full h-28 bg-[#0b0b0f]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-[60]">
            <div className="flex items-center">
               <PrimeLogo size={100} />
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-400">
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
         </header>

         <aside className={`
          fixed lg:sticky top-0 lg:top-28 h-screen lg:h-[calc(100vh-112px)] w-full lg:w-80 border-r border-white/5 bg-[#080808] p-10 z-50 transition-all duration-500
          ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full lg:translate-y-0 opacity-0 lg:opacity-100'}
       `}>
            <div className="mb-12">
               <h2 className="text-[10px] font-black tracking-[4px] uppercase text-zinc-500 mb-2">Command Node</h2>
               <div className="h-0.5 w-10 bg-amber-500/50" />
            </div>

            <nav className="space-y-6">
               <NavItem label="Signals Feed" icon={<RefreshCcw size={20} />} active={tab === 'signals'} onClick={() => toggleTab('signals')} />
               <NavItem label="User Registry" icon={<Users size={20} />} active={tab === 'users'} onClick={() => toggleTab('users')} />
               <NavItem label="Institutional Plans" icon={<Crown size={20} />} active={tab === 'packages'} onClick={() => toggleTab('packages')} />
               <NavItem label="Risk Terminal" icon={<Activity size={20} />} active={tab === 'analytics'} onClick={() => toggleTab('analytics')} />
            </nav>
         </aside>

         <main className="flex-1 p-6 lg:p-16 pt-24 lg:pt-32">
            <div className="max-w-6xl mx-auto">

               {tab === 'signals' && (
                  <div className="space-y-12">
                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div>
                           <span className="text-[10px] font-black tracking-[4px] text-amber-500 uppercase block mb-2">Administrator Output</span>
                           <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase whitespace-nowrap">Broadcast <span className="gold-gradient italic">Node</span></h1>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4 premium-card p-8 space-y-8 bg-white/[0.02]">
                           <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-amber-500"><PlusCircle size={18} /> New Broadcast</h3>
                           <div className="space-y-6">
                              <div className="space-y-3">
                                 <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Symbol</label>
                                 <input value={newSignal.symbol} onChange={e => setNewSignal({ ...newSignal, symbol: e.target.value })} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-bold" placeholder="SENSEX 76400 PE" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <button onClick={() => setNewSignal({ ...newSignal, type: 'BUY' })} className={`p-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${newSignal.type === 'BUY' ? 'bg-green-500 text-black' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>BUY</button>
                                 <button onClick={() => setNewSignal({ ...newSignal, type: 'SELL' })} className={`p-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${newSignal.type === 'SELL' ? 'bg-red-500 text-black' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>SELL</button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <input value={newSignal.entry} onChange={e => setNewSignal({ ...newSignal, entry: e.target.value })} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-bold" placeholder="Entry Price" />
                                 <input value={newSignal.sl} onChange={e => setNewSignal({ ...newSignal, sl: e.target.value })} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-bold" placeholder="Stop Loss" />
                              </div>
                              <input value={newSignal.targets} onChange={e => setNewSignal({ ...newSignal, targets: e.target.value })} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-bold" placeholder="Targets (e.g. 420/450/480)" />
                              <button onClick={createSignal} className="w-full bg-amber-500 text-black p-5 rounded-xl font-black uppercase text-xs tracking-[2px] hover:bg-amber-400 transition-all flex items-center justify-center gap-3">
                                 DISPATCH SIGNAL <ChevronRight size={18} />
                              </button>
                           </div>
                        </div>

                        <div className="lg:col-span-8 space-y-4">
                           <h4 className="text-[10px] text-zinc-600 font-black uppercase tracking-[3px] mb-6">Recent Dispatches</h4>
                           {signals.map(s => (
                              <div key={s._id} className="premium-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/[0.01]">
                                 <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-xl ${s.type === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}><Activity size={24} /></div>
                                    <div>
                                       <p className="text-xl font-black tracking-tight text-white uppercase">{s.symbol}</p>
                                       <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{s.market} • {s.status}</p>
                                    </div>
                                 </div>
                                 <div className="flex gap-4">
                                    <button onClick={() => deleteSignal(s._id!)} className="p-3 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500/20"><Trash2 size={20} /></button>
                                    <button className="p-3 bg-white/5 text-zinc-400 rounded-lg border border-white/5 hover:text-white"><CheckCircle size={20} /></button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {tab === 'users' && (
                  <div className="space-y-12">
                     <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter">Authorized <span className="gold-gradient italic">Units</span></h1>
                     <div className="premium-card overflow-hidden bg-white/[0.01]">
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                              <thead className="border-b border-white/5 text-[10px] text-zinc-500 uppercase font-black">
                                 <tr>
                                    <th className="p-8">Subscriber</th>
                                    <th className="p-8">Tier</th>
                                    <th className="p-8">Registry</th>
                                    <th className="p-8 text-right">Clearance</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 font-bold">
                                 {users.map(u => (
                                    <tr key={u._id} className="hover:bg-white/[0.01] transition-colors">
                                       <td className="p-8">
                                          <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">{u.name[0]}</div>
                                             <div>
                                                <p className="text-white uppercase tracking-tight">{u.name}</p>
                                                <p className="text-[10px] text-zinc-500">{u.email}</p>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="p-8"><span className="text-[10px] px-3 py-1 bg-white/5 rounded-lg border border-white/10 uppercase tracking-widest">{u.subscription.plan}</span></td>
                                       <td className="p-8 text-[10px] uppercase text-zinc-400">{u.role}</td>
                                       <td className="p-8 text-right">
                                          <button className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><ShieldAlert size={20} /></button>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
               )}

               {tab === 'packages' && (
                  <div className="space-y-12">
                     <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter">Plan <span className="gold-gradient italic">Architect</span></h1>
                     
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4 premium-card p-8 space-y-8 bg-white/[0.02]">
                           <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-amber-500"><PlusCircle size={18} /> Define Package</h3>
                           <div className="space-y-5">
                              <input value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-bold" placeholder="Plan Name (e.g. VIP MAX)" />
                              <input value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-bold" placeholder="Price (INR)" />
                              <input value={newPackage.durationInDays} onChange={e => setNewPackage({...newPackage, durationInDays: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-bold" placeholder="Duration (Days)" />
                              <textarea value={newPackage.features} onChange={e => setNewPackage({...newPackage, features: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-bold h-32" placeholder="Features (comma separated)" />
                              <button onClick={createPackage} className="w-full bg-amber-500 text-black p-5 rounded-xl font-black uppercase text-xs tracking-[2px] transition-transform hover:scale-[1.02]">
                                 Activate Plan
                              </button>
                           </div>
                        </div>

                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                           {packages.map(p => (
                              <div key={p._id} className="premium-card p-8 bg-white/[0.01] border-white/5 flex flex-col justify-between">
                                 <div>
                                    <div className="flex justify-between items-start mb-6">
                                       <span className="text-[10px] font-black uppercase tracking-[3px] text-amber-500">{p.badge}</span>
                                       <button onClick={() => deletePackage(p._id)} className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                    <h4 className="text-2xl font-black uppercase tracking-tight mb-2">{p.name}</h4>
                                    <p className="text-3xl font-black mb-6">₹{p.price}<span className="text-xs text-zinc-500"> / {p.durationInDays}D</span></p>
                                    <div className="space-y-3 pb-8">
                                       {p.features?.map((f: string, i: number) => (
                                          <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                             <CheckCircle size={12} className="text-amber-500" /> {f}
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </main>
      </div>
   );
}

function NavItem({ label, icon, active, onClick }: { label: string, icon: any, active: boolean, onClick: () => void }) {
   return (
      <div
         onClick={onClick}
         className={`flex items-center gap-4 p-5 rounded-xl cursor-pointer transition-all border ${active
               ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
               : 'bg-transparent border-transparent text-zinc-600 hover:text-white hover:bg-white/5'
            }`}
      >
         {icon}
         <span className="text-xs font-black uppercase tracking-widest">{label}</span>
         {active && <div className="ml-auto w-1 h-4 bg-amber-500 rounded-full" />}
      </div>
   );
}
