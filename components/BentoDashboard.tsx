'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Users, MessageSquare, ArrowUpRight, Lock, Globe, CreditCard } from 'lucide-react';

export default function BentoDashboard({ isConnected, onConnect }: { isConnected: boolean, onConnect: () => void }) {
  return (
    <div className="grid grid-cols-6 grid-rows-6 gap-4 w-full h-full max-w-[900px] p-4">
      
      {/* Main Connection Widget */}
      <motion.div 
        className="col-span-4 row-span-3 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group"
        whileHover={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
              {isConnected ? 'Защита активна' : 'Система готова'}
            </span>
          </div>
          <h3 className="text-3xl font-bold tracking-tight">
            {isConnected ? 'WW.pro работает' : 'Нажмите для старта'}
          </h3>
        </div>

        <div className="flex justify-center items-center relative z-10">
          <motion.button
            onClick={onConnect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl
              ${isConnected 
                ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/20' 
                : 'bg-zinc-800 text-zinc-400 hover:text-emerald-500 border border-zinc-700'}
            `}
          >
            <Shield className={`w-12 h-12 transition-transform duration-500 ${isConnected ? 'rotate-0' : 'rotate-12'}`} />
          </motion.button>
          
          {/* Subtle background effect instead of the "stupid circle" */}
          <div className={`absolute inset-0 flex items-center justify-center -z-10 transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 font-medium relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-zinc-600 uppercase text-[8px] tracking-widest mb-1">Трафик</span>
              <span className="text-zinc-300 font-mono">∞ Unlimited</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-600 uppercase text-[8px] tracking-widest mb-1">Протокол</span>
              <span className="text-zinc-300 font-mono">VLESS + Reality</span>
            </div>
          </div>
          <div className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700 text-zinc-400">
            v2.4.0
          </div>
        </div>
      </motion.div>

      {/* Subscription Widget */}
      <motion.div 
        className="col-span-2 row-span-2 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-5 flex flex-col justify-between group cursor-pointer"
        whileHover={{ borderColor: 'rgba(245, 158, 11, 0.3)', y: -2 }}
      >
        <div className="flex items-center justify-between">
          <CreditCard className="w-5 h-5 text-amber-500" />
          <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 transition-colors" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Подписка</div>
          <div className="text-lg font-bold">99 ₽ <span className="text-xs text-zinc-500 font-normal">/мес</span></div>
          <div className="text-[10px] text-emerald-500 font-bold mt-1">Активна до 12.04</div>
        </div>
      </motion.div>

      {/* White Lists Widget */}
      <motion.div 
        className="col-span-2 row-span-4 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 flex flex-col group cursor-pointer"
        whileHover={{ borderColor: 'rgba(16, 185, 129, 0.3)', y: -2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="bg-emerald-500/20 text-emerald-500 text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">БС Активны</span>
        </div>
        
        <h4 className="font-bold text-sm mb-4">Белые списки</h4>
        
        <div className="space-y-4 mt-auto">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
              <span className="text-zinc-500">Доступно</span>
              <span className="text-zinc-200">41.23 GB</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
          <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
            Купить GB
          </button>
        </div>
      </motion.div>

      {/* Support Widget */}
      <motion.div 
        className="col-span-4 row-span-3 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-6 flex flex-col group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center relative">
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-900" />
            </div>
            <div>
              <div className="text-xs font-bold">Поддержка</div>
              <div className="text-[8px] text-zinc-500 uppercase tracking-widest">Онлайн</div>
            </div>
          </div>
          <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowUpRight className="w-4 h-4 text-zinc-600" />
          </button>
        </div>
        
        <div className="bg-zinc-800/50 rounded-2xl p-4 text-[11px] text-zinc-400 leading-relaxed mb-4">
          Здравствуйте! Чтобы мы могли максимально быстро помочь вам, пожалуйста, подробно опишите проблему...
        </div>
        
        <div className="mt-auto flex gap-2">
          <div className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2 text-[10px] text-zinc-500">
            Напишите сообщение...
          </div>
          <button className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-zinc-950">
            <Zap className="w-4 h-4 fill-current" />
          </button>
        </div>
      </motion.div>

      {/* Referrals Widget */}
      <motion.div 
        className="col-span-2 row-span-1 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[1.5rem] px-5 flex items-center justify-between group cursor-pointer"
        whileHover={{ borderColor: 'rgba(16, 185, 129, 0.3)', x: 4 }}
      >
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Рефералы</span>
        </div>
        <span className="text-sm font-mono font-bold">22</span>
      </motion.div>

    </div>
  );
}
