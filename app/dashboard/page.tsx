'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Zap, Users, MessageSquare, ArrowUpRight, 
  Lock, Globe, CreditCard, Settings, 
  LogOut, Bell, Plus, RefreshCw, Activity, 
  Wifi, ShieldCheck, Cpu, HardDrive, ChevronRight,
  Download, Smartphone, Calendar, Package, CheckCircle2,
  Clock, Wallet
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Components ---

const PlanCard = ({ 
  months, 
  price, 
  popular = false, 
  onSelect 
}: { 
  months: number; 
  price: string; 
  popular?: boolean;
  onSelect: () => void;
}) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`relative p-8 rounded-[2rem] border transition-all cursor-pointer flex flex-col h-full ${
      popular 
        ? 'bg-emerald-500 border-emerald-400 text-zinc-950' 
        : 'bg-zinc-900/50 border-white/5 text-white hover:border-emerald-500/50'
    }`}
    onClick={onSelect}
  >
    {popular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-zinc-950 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-xl">
        Most Popular
      </div>
    )}
    <div className="flex justify-between items-start mb-6">
      <div className="flex flex-col">
        <span className={`text-2xl font-black ${popular ? 'text-zinc-950' : 'text-white'}`}>
          {months} {months === 1 ? 'Month' : 'Months'}
        </span>
        <span className={`text-[10px] uppercase tracking-widest font-bold opacity-60`}>
          VPN Subscription
        </span>
      </div>
      <Package className={`w-6 h-6 ${popular ? 'text-zinc-950' : 'text-emerald-500'}`} />
    </div>
    
    <div className="mt-auto">
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-3xl font-black">{price}</span>
        <span className="text-xs opacity-60 font-bold">/ total</span>
      </div>
      
      <ul className="space-y-3 mb-8">
        {['High Speed', 'Unlimited Devices', '24/7 Support'].map((feat, i) => (
          <li key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" /> {feat}
          </li>
        ))}
      </ul>

      <button className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
        popular 
          ? 'bg-zinc-950 text-white hover:bg-zinc-900' 
          : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
      }`}>
        Select Plan
      </button>
    </div>
  </motion.div>
);

const SubscriptionBadge = ({ active }: { active: boolean }) => (
  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
    active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
  }`}>
    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
    {active ? 'Active' : 'No Subscription'}
  </div>
);

// --- Main Page ---

export default function DashboardPage() {
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const handlePurchase = () => {
    setTransactionId(Math.random().toString(36).substring(7).toUpperCase());
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasSubscription(true);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-hidden flex">
      
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505]/90 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-emerald-500 rounded-full opacity-20"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-b-2 border-emerald-500 rounded-full opacity-40"
              />
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 animate-pulse">Processing</span>
                  <span className="text-[8px] font-mono text-zinc-600 mt-1">SECURE_TRANSACTION_ID: {transactionId}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-12 w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5 }}
                className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar Rail */}
      <nav className="w-20 border-r border-white/5 flex flex-col items-center py-8 gap-10 z-50 bg-[#050505]">
        <motion.div 
          whileHover={{ rotate: 90 }}
          className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-pointer"
          onClick={() => router.push('/')}
        >
          <Shield className="text-zinc-950 w-6 h-6" />
        </motion.div>
        
        <div className="flex flex-col gap-6">
          {[Globe, CreditCard, Users, MessageSquare, Settings].map((Icon, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1, color: '#fff' }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-600 transition-colors"
            >
              <Icon className="w-5 h-5" />
            </motion.button>
          ))}
        </div>

        <button 
          onClick={() => router.push('/')}
          className="mt-auto w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-700 hover:text-red-500 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-40">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600">Workspace</span>
              <h1 className="text-xl font-bold tracking-tight">Control Center</h1>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest text-zinc-600">Server</span>
                <span className="text-xs font-mono text-emerald-500">DE-FRA-01</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest text-zinc-600">Ping</span>
                <span className="text-xs font-mono text-zinc-400">32ms</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-white/5">
              <div className="text-right">
                <div className="text-xs font-bold">Vlad Mel</div>
                <div className={`text-[9px] uppercase tracking-widest font-bold ${hasSubscription ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {hasSubscription ? 'Pro Member' : 'Free Tier'}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center font-bold text-sm transition-colors ${hasSubscription ? 'text-emerald-500' : 'text-amber-500'}`}>
                VM
              </div>
            </div>
            <button className="relative group">
              <Bell className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#050505]" />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            
            <AnimatePresence mode="wait">
              {!hasSubscription ? (
                <motion.div 
                  key="no-sub"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-12 gap-6"
                >
                  <div className="col-span-12 mb-4">
                    <h2 className="text-3xl font-black tracking-tighter">Choose Your Plan</h2>
                    <p className="text-zinc-500 text-sm">Select a subscription to unlock premium VPN features.</p>
                  </div>
                  
                  <div className="col-span-12 lg:col-span-4">
                    <PlanCard months={1} price="99 ₽" onSelect={handlePurchase} />
                  </div>
                  <div className="col-span-12 lg:col-span-4">
                    <PlanCard months={6} price="499 ₽" popular onSelect={handlePurchase} />
                  </div>
                  <div className="col-span-12 lg:col-span-4">
                    <PlanCard months={12} price="899 ₽" onSelect={handlePurchase} />
                  </div>

                  <div className="col-span-12 mt-10">
                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-10 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                          <Wallet className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Quick Payment</h3>
                          <p className="text-zinc-500 text-xs">Secure checkout via Telegram Pay or Card.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-12 w-20 bg-white/5 rounded-xl border border-white/5" />
                        <div className="h-12 w-20 bg-white/5 rounded-xl border border-white/5" />
                        <div className="h-12 w-20 bg-white/5 rounded-xl border border-white/5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="has-sub"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-12 gap-6"
                >
                  {/* Left Column: Profile & Stats */}
                  <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Profile Overview */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Shield className="w-64 h-64" />
                      </div>
                      
                      <div className="relative z-10">
                        <SubscriptionBadge active={true} />
                        
                        <div className="mt-8 flex items-end justify-between">
                          <div>
                            <h2 className="text-4xl font-black tracking-tighter mb-2">Premium Access</h2>
                            <p className="text-zinc-500 text-sm flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Valid until April 12, 2026
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 block mb-1">Status</span>
                            <span className="text-2xl font-mono font-bold text-emerald-500">ACTIVE</span>
                          </div>
                        </div>

                        <div className="mt-12 grid grid-cols-3 gap-6">
                          {[
                            { label: 'Devices', value: '5 / 5', icon: Smartphone },
                            { label: 'Speed', value: 'Unlimited', icon: Zap },
                            { label: 'Region', value: 'Global', icon: Globe }
                          ].map((stat, i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/5">
                              <stat.icon className="w-5 h-5 text-emerald-500 mb-4" />
                              <div className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold mb-1">{stat.label}</div>
                              <div className="text-lg font-bold">{stat.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* White Lists / Data Usage */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-10">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">White Lists Balance</h3>
                            <p className="text-zinc-500 text-xs">Emergency backup network traffic.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setHasSubscription(false)} // Demo toggle
                          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                          Buy More GB
                        </button>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Available Data</span>
                              <span className="text-4xl font-black tracking-tighter">41.23 <span className="text-lg opacity-40">GB</span></span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Used this month</span>
                              <span className="text-lg font-bold">8.77 GB</span>
                            </div>
                          </div>
                          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '82%' }}
                              className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold mb-2">Auto-Renewal</div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold">Enabled</span>
                              <div className="w-10 h-5 bg-emerald-500 rounded-full p-1 flex justify-end">
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </div>
                            </div>
                          </div>
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold mb-2">Payment Method</div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold">•••• 4242</span>
                              <CreditCard className="w-4 h-4 text-zinc-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Secondary Modules */}
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Time Remaining */}
                    <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-zinc-950 relative overflow-hidden">
                      <div className="relative z-10">
                        <Clock className="w-8 h-8 mb-6 opacity-60" />
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Time Remaining</div>
                        <div className="text-5xl font-black tracking-tighter mb-2">24 Days</div>
                        <p className="text-xs font-bold opacity-60">Your subscription will renew automatically on April 12.</p>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Calendar className="w-48 h-48" />
                      </div>
                    </div>

                    {/* Support & Community */}
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center group cursor-pointer"
                      >
                        <MessageSquare className="w-6 h-6 text-zinc-600 group-hover:text-emerald-500 transition-colors mb-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Support</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center group cursor-pointer"
                      >
                        <Users className="w-6 h-6 text-zinc-600 group-hover:text-amber-500 transition-colors mb-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Referrals</span>
                      </motion.div>
                    </div>

                    {/* Download Apps */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between group cursor-pointer overflow-hidden relative">
                      <div className="relative z-10">
                        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Mobile & Desktop</div>
                        <h4 className="text-white text-xl font-bold">Download Apps</h4>
                      </div>
                      <Download className="w-8 h-8 text-zinc-500 relative z-10 group-hover:translate-y-1 transition-transform group-hover:text-emerald-500" />
                      <div className="absolute right-[-10%] bottom-[-20%] opacity-5">
                        <Smartphone className="w-32 h-32 text-white" />
                      </div>
                    </div>

                    {/* Quick Help */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Quick Help</h4>
                      <div className="space-y-4">
                        {['How to setup VLESS?', 'Payment issues', 'White Lists guide'].map((q, i) => (
                          <div key={i} className="flex items-center justify-between text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer group">
                            <span>{q}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* System Log */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 flex-1 min-h-[200px] flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">System Log</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="flex-1 font-mono text-[9px] text-zinc-600 space-y-2 overflow-hidden">
                        <div className="flex gap-2">
                          <span className="text-emerald-500/50">[15:58:49]</span>
                          <span>AUTH_SUCCESS: vladmel1711@gmail.com</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-emerald-500/50">[15:58:50]</span>
                          <span>NODE_CONNECTED: DE-FRA-01 (185.23.11.4)</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-emerald-500/50">[15:58:52]</span>
                          <span>ENCRYPTION_ACTIVE: AES-256-GCM</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-emerald-500/50">[15:59:01]</span>
                          <span>WHITELIST_SYNC: 41.23 GB REMAINING</span>
                        </div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                          className="w-1 h-3 bg-emerald-500/30 mt-1"
                        />
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
