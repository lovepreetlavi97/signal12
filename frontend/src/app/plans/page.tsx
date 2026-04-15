'use client';

import React, { useEffect, useState } from 'react';
import { MarketOverviewBar } from '@/components/MarketOverviewBar';
import { Crown, CheckCircle, Zap, ShieldCheck, ArrowRight, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { getApiUrl } from '@/config';
import Link from 'next/link';

export default function PlansPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await axios.get(`${getApiUrl()}/subscriptions/packages`);
                setPackages(res.data);
            } catch (err) {
                console.error('Failed to fetch packages');
            }
            setLoading(false);
        };
        fetchPackages();
    }, []);

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-amber-500/30">
            <MarketOverviewBar 
                onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                isMobileMenuOpen={isMobileMenuOpen} 
            />

            <main className="max-w-7xl mx-auto pt-40 pb-24 px-6 relative">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="premium-card h-[600px] bg-white/[0.02] animate-pulse rounded-3xl" />
                        ))
                    ) : (
                        packages.map((pkg, idx) => (
                            <motion.div
                                key={pkg._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative flex flex-col premium-card p-10 bg-white/[0.01] border-white/5 hover:border-amber-500/20 hover:bg-white/[0.02] transition-all duration-500 rounded-[2.5rem] overflow-hidden"
                            >
                                {/* Hover Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="mb-12 relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                                            {idx === 0 ? <Zap size={24} /> : idx === 1 ? <Crown size={24} /> : <ShieldCheck size={24} />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[3px] text-zinc-600 group-hover:text-amber-500 transition-colors">
                                            {pkg.badge || 'Professional'}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-tight mb-4">{pkg.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black tracking-tighter">₹{pkg.price}</span>
                                        <span className="text-zinc-600 text-sm font-bold uppercase tracking-widest italic">/ {pkg.durationInDays} Days</span>
                                    </div>
                                </div>

                                <div className="space-y-5 mb-14 flex-1 relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[4px] text-zinc-700 mb-6">Cleared Features</p>
                                    {pkg.features?.map((feature: string, i: number) => (
                                        <div key={i} className="flex items-center gap-4 text-sm font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors capitalize">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500/40" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full py-6 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-all duration-500 flex items-center justify-center gap-3 relative z-10 overflow-hidden group/btn">
                                    <span className="text-xs font-black uppercase tracking-[4px] relative z-10">Initialize Activation</span>
                                    <ArrowRight size={18} className="relative z-10 group-hover/btn:translate-x-2 transition-transform" />
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
