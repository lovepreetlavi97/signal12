'use client';

import React, { useEffect, useState } from 'react';
import { MarketOverviewBar } from '@/components/MarketOverviewBar';
import { Shield, Mail, Phone, Calendar, Crown, ArrowLeft, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getApiUrl } from '@/config';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getApiUrl()}/profile/me`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center">
      <Activity size={40} className="text-amber-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      <MarketOverviewBar />
      
      <main className="max-w-2xl mx-auto pt-32 px-6">
         <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-16">
           <ArrowLeft size={18} />
           <span className="text-sm font-bold uppercase tracking-widest">Back to Terminal</span>
         </Link>

         <div className="space-y-12">
            <div>
               <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Account Information</h1>
               <p className="text-zinc-500 text-sm">Review your registry data and subscription status.</p>
            </div>

            <div className="space-y-8 border-t border-white/10 pt-12">
               <InfoRow label="User Identity" value={user?.name || 'Elite Trader'} />
               <InfoRow label="Email Address" value={user?.email || 'N/A'} />
               <InfoRow label="Phone Number" value={user?.phone || 'N/A'} />
               <InfoRow label="Current Plan" value={user?.subscription?.plan || 'VIP'} />
               <InfoRow 
                  label="Plan Expiry" 
                  value={user?.subscription?.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : '31.12.2026'} 
               />
            </div>
         </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4">
       <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">{label}</span>
       <span className="text-xl font-bold text-white tracking-tight">{value}</span>
    </div>
  );
}
