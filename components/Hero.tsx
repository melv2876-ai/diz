'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Shield, Globe as GlobeIcon, Zap, ArrowRight, Sun, Moon, RefreshCw, Key, Fingerprint, Lock, Layers, Waves, ScanEye, ShieldCheck, Radar, Infinity as InfinityIcon, Waypoints } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Globe from './Globe';
import { useRouter } from 'next/navigation';

interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

interface ServerData {
  id: string;
  country: string;
  city: string;
  coords: [number, number];
  basePing: number;
  flag: string;
  description: string;
}


const SERVERS: ServerData[] = [
  { 
    id: 'de', 
    country: 'Германия', 
    city: 'Франкфурт', 
    coords: [50.1109, 8.6821], 
    basePing: 35, flag: '🇩🇪',
    description: 'Лучший сервер по скорости и стабильности'
  },
  { 
    id: 'am', 
    country: 'Армения', 
    city: 'Ереван', 
    coords: [40.1772, 44.5035], 
    basePing: 55, flag: '🇦🇲',
    description: 'Полное отсутствие рекламы в YouTube'
  },
  { 
    id: 'fi', 
    country: 'Финляндия', 
    city: 'Хельсинки', 
    coords: [60.1699, 24.9384], 
    basePing: 42, flag: '🇫🇮',
    description: 'Быстрый и без рекламы в YouTube'
  },
  { 
    id: 'us', 
    country: 'США', 
    city: 'Нью-Йорк', 
    coords: [40.7128, -74.0060], 
    basePing: 110, flag: '🇺🇸',
    description: 'Отлично подходит для ИИ и регистраций'
  },
];

const getPingVariation = () => Math.floor(Math.random() * 10) - 5;
const getPingProbeDelay = () => 800 + Math.random() * 1000;

export default function Hero() {
  const router = useRouter();
  const pingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [selectedServer, setSelectedServer] = useState<ServerData>(SERVERS[0]);
  const [pings, setPings] = useState<Record<string, number | 'testing'>>({});
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [showAdvantages, setShowAdvantages] = useState(false);
  const [isTelling, setIsTelling] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [globeTheme, setGlobeTheme] = useState<'dark' | 'light'>('dark');
  const [globeFocusToken, setGlobeFocusToken] = useState(0);

  const selectedServerInfo = useMemo(
    () => ({
      city: selectedServer.city,
      country: selectedServer.country,
      flag: selectedServer.flag,
    }),
    [selectedServer.city, selectedServer.country, selectedServer.flag]
  );

  const focusServer = (server: ServerData) => {
    setSelectedServer(server);
    setGlobeFocusToken((current) => current + 1);
  };

  const handleServerProbe = (server: ServerData) => {
    focusServer(server);
    simulatePing(server.id);
  };


  const handleGoogleLogin = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = {
      uid: 'mock-123',
      email: 'vlad@example.com',
      displayName: 'Vlad Mel',
      photoURL: 'https://picsum.photos/seed/vlad/200'
    };
    setUser(mockUser);
    setLoading(false);
    router.push('/dashboard');
  };

  const handleTelegramLogin = () => {
    alert('Telegram Login: В демо-режиме эта функция имитирует вход.');
    const mockUser = {
      uid: 'mock-tg-123',
      email: 'tg_user@telegram.org',
      displayName: 'Telegram User',
      photoURL: null
    };
    setUser(mockUser);
    router.push('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

  const simulatePing = (serverId: string) => {
    const existingTimeout = pingTimeoutsRef.current[serverId];
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    setPings(prev => ({ ...prev, [serverId]: 'testing' }));
    
    pingTimeoutsRef.current[serverId] = setTimeout(() => {
      const base = SERVERS.find(s => s.id === serverId)?.basePing || 50;
      const variation = getPingVariation();
      setPings(prev => ({ ...prev, [serverId]: base + variation }));
      delete pingTimeoutsRef.current[serverId];
    }, getPingProbeDelay());
  };

  useEffect(() => {
    // Initial ping simulation for all
    SERVERS.forEach(s => simulatePing(s.id));

    return () => {
      Object.values(pingTimeoutsRef.current).forEach(clearTimeout);
      pingTimeoutsRef.current = {};
    };
  }, []);

  const isAnyPingTesting = Object.values(pings).some((ping) => ping === 'testing');

  return (
    <div className="relative h-screen bg-[#050505] overflow-hidden">
      {/* Full Screen Globe Background */}
      <Globe 
        selectedCountryId={selectedServer.id}
        selectedLocation={selectedServer.coords} 
        serverInfo={selectedServerInfo}
        theme={globeTheme}
        focusToken={globeFocusToken}
      />

      {/* UI Overlay */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row p-3 md:p-4 gap-4 max-w-[1600px] mx-auto pointer-events-none">
        {/* Left Side: Info & Server List */}
        <div className="flex-1 flex flex-col gap-4 pointer-events-auto">
          {/* Header/Logo */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Shield className="text-zinc-950 w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tighter font-mono">WW.pro</span>
            </div>
            <button
              onClick={() => setGlobeTheme(globeTheme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              title={globeTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {globeTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-white/70" />
              ) : (
                <Moon className="w-5 h-5 text-white/70" />
              )}
            </button>
          </header>

          {/* Main Headline */}
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.9] drop-shadow-2xl"
            >
              Лучший <span className="text-emerald-500 italic">VPN</span> сервис
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-300 max-w-md text-sm drop-shadow-md"
            >
              Максимальная скорость и безопасность в один клик. Выбирайте лучшие локации по всему миру.
            </motion.p>
          </div>

          {/* Server List — Liquid Glass */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-[28rem]"
          >
            {/* Glass container */}
            <div className="relative overflow-hidden rounded-[2rem] group transition-all duration-700"
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                boxShadow: '0 8px 64px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(40px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
              }}
            >
              {/* Rich Liquid Color Fill on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none bg-gradient-to-br from-indigo-600/20 via-blue-500/10 to-indigo-800/20 backdrop-blur-3xl" />
              
              {/* Subtle Inner Glow to define the volume */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none border border-white/5 rounded-[2rem] shadow-[inset_0_0_40px_rgba(99,102,241,0.1)]" />

              {/* Header */}
              <div className="relative flex items-center justify-between px-5 py-4">
                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">
                  Доступные локации
                </span>
                <button
                  onClick={() => SERVERS.forEach((server) => simulatePing(server.id))}
                  className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:bg-white/10 active:scale-90"
                  title="Проверить пинг"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-white/40 hover:text-white/70 transition-colors ${isAnyPingTesting ? 'refresh-spin' : ''}`} />
                </button>
              </div>

              {/* Server rows */}
              <div className="relative">
                {SERVERS.map((server, index) => {
                  const currentPing = pings[server.id];
                  const isSelected = selectedServer.id === server.id;
                  const isTesting = currentPing === 'testing';

                  const pingColor = () => {
                    if (typeof currentPing !== 'number') return 'text-white/25';
                    if (currentPing < 50) return 'text-emerald-400';
                    if (currentPing < 100) return 'text-yellow-400';
                    return 'text-rose-400';
                  };

                  const dotColor = () => {
                    if (typeof currentPing !== 'number') return 'bg-white/20';
                    if (currentPing < 50) return 'bg-emerald-400';
                    if (currentPing < 100) return 'bg-yellow-400';
                    return 'bg-rose-400';
                  };

                  return (
                    <div key={server.id}>
                      {/* Divider */}
                      {index > 0 && !isSelected && !SERVERS[index-1].id.includes(selectedServer.id) && (
                        <div className="mx-6 h-px bg-white/[0.04]" />
                      )}

                      <motion.div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleServerProbe(server)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleServerProbe(server);
                          }
                        }}
                        whileHover={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)' }}
                        className={`relative flex items-center gap-4 px-6 py-4.5 cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                            : 'hover:bg-white/[0.02] active:scale-[0.995]'
                        }`}
                      >
                        {/* Selected indicator - Dynamic pill */}
                        {isSelected && (
                          <motion.div
                            layoutId="server-indicator"
                            className="absolute left-2 w-1 h-6 rounded-full bg-emerald-400"
                            style={{ boxShadow: '0 0 12px rgba(52,211,153,0.6)' }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          />
                        )}

                        {/* Flag — bare, no container */}
                        <span className="text-[1.5rem] leading-none shrink-0">{server.flag}</span>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <span className={`block text-[15px] tracking-tight leading-tight ${
                            isSelected ? 'font-bold text-white' : 'font-medium text-white/60'
                          }`}>
                            {server.country}
                          </span>
                          <span className="block mt-0.5 text-[11px] text-white/20 font-medium tracking-wide">
                            {server.city.toUpperCase()}
                          </span>
                        </div>

                        {/* Ping */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className={`text-[0.82rem] font-medium tabular-nums tracking-tight ${pingColor()} transition-colors duration-300`}>
                            {isTesting ? (
                              <motion.span
                                animate={{ opacity: [0.3, 0.8, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="text-white/30"
                              >
                                —
                              </motion.span>
                            ) : (
                              typeof currentPing === 'number' ? `${currentPing} ms` : '—'
                            )}
                          </span>

                          {/* Status dot */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleServerProbe(server);
                            }}
                            className="relative flex items-center justify-center w-5 h-5"
                            title={`Проверить ${server.country}`}
                          >
                            {isTesting && (
                              <span className={`absolute inset-0 rounded-full ${dotColor()} opacity-30 ping-btn-ripple`} />
                            )}
                            <motion.span
                              animate={isTesting ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] } : { scale: 1, opacity: 1 }}
                              transition={isTesting ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' } : { duration: 0.2 }}
                              className={`block w-[6px] h-[6px] rounded-full ${dotColor()} transition-colors duration-300`}
                              style={typeof currentPing === 'number' ? { boxShadow: `0 0 6px currentColor` } : {}}
                            />
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>


          {/* Interactive Advantages CTA */}
          <div className="mt-auto w-full max-w-md pointer-events-auto">
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-semibold tracking-tight text-white/60 mb-3"
            >
              Почему выбирают именно нас?
            </motion.p>

            <motion.div
              onClick={() => {
                if (isTelling) return;
                setIsTelling(true);
                setTimeout(() => {
                  setShowAdvantages(true);
                  setIsTelling(false);
                }, 800);
              }}
              className="relative cursor-pointer group/action inline-block"
            >
              <div className="relative h-10 rounded-full border border-white/10 px-6 flex items-center overflow-hidden transition-all duration-500 group-hover/action:border-white/20 group-hover/action:bg-white/[0.03]">
                
                {/* Bottom layer: Replacement text (always present, revealed by wipe) */}
                <span className="absolute inset-0 flex items-center px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 z-10 whitespace-nowrap">
                  Сейчас расскажем →
                </span>

                {/* Top layer: Original text with wipe-away mask */}
                <span 
                  className="absolute inset-0 flex items-center px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 z-20 whitespace-nowrap bg-[#0a0a0a] transition-[clip-path] duration-700 ease-in-out group-hover/action:[clip-path:inset(0_100%_0_0)] [clip-path:inset(0_0_0_0)]"
                >
                  Оценить преимущества
                </span>

                {/* Loading bar on click */}
                {isTelling && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8 }}
                    className="absolute bottom-0 left-0 w-full h-px bg-emerald-500 origin-left z-30"
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="hidden lg:block flex-[1.35] pointer-events-none" aria-hidden="true" />

          {/* Right Side: Auth Section with Interactive Glow */}
          <div className="w-full lg:w-[360px] xl:w-[400px] relative group pointer-events-auto">
            {/* Background Kinetic Glow */}
            <div className="absolute -inset-4 bg-emerald-500/10 blur-[100px] rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative h-full bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-5 md:p-8 flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.4)] overflow-hidden">
              {/* Inner Glass Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full" />
              
              <AnimatePresence mode="wait">
                {user ? (
                  <motion.div 
                    key="user-profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full relative z-10"
                  >
                    <div className="mb-8">
                      <div className="flex items-center gap-5 mb-6">
                        {user.photoURL ? (
                          <div className="relative">
                            <Image src={user.photoURL} alt={user.displayName || ''} width={72} height={72} className="w-[72px] h-[72px] rounded-3xl border-2 border-emerald-500/30 object-cover shadow-lg" />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#0a0a0a] flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-[72px] h-[72px] rounded-3xl bg-emerald-500/10 flex items-center justify-center text-3xl font-bold text-emerald-500 border border-emerald-500/20 shadow-inner">
                            {user.displayName?.[0] || user.email?.[0] || '?'}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">Привет, {user.displayName?.split(' ')[0] || 'Пользователь'}</h2>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             <p className="text-white/40 text-xs font-medium tracking-wide">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/[0.08] to-transparent border border-emerald-500/20 rounded-2xl p-4">
                        <div className="absolute top-0 right-0 p-3">
                          <Zap className="w-8 h-8 text-emerald-500/10 -rotate-12" />
                        </div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Статус</span>
                          <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">БЕЗЛИМИТ</span>
                        </div>
                        <p className="text-white/70 text-xs leading-relaxed relative z-10 font-medium tracking-tight">
                          Раскройте потенциал сети с вашим Platinum тарифом.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-auto relative z-10">
                      <button className="w-full bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10 group">
                        <span className="text-sm">Настройки</span>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 group-hover:text-white transition-all" />
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-rose-500/10"
                      >
                        <span className="text-sm">Выйти</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="auth-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col h-full relative z-10"
                  >
                    <div className="flex p-1 bg-white/[0.03] rounded-xl mb-6 border border-white/5 relative">
                      <button 
                        onClick={() => setAuthMode('login')}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${authMode === 'login' ? 'text-zinc-950' : 'text-white/40 hover:text-white/60'}`}
                      >
                        Вход
                        {authMode === 'login' && (
                          <motion.div 
                            layoutId="auth-switch-bg"
                            className="absolute inset-0 bg-white rounded-lg -z-10 shadow-[0_10px_20px_rgba(255,255,255,0.2)]"
                          />
                        )}
                      </button>
                      <button 
                        onClick={() => setAuthMode('register')}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${authMode === 'register' ? 'text-zinc-950' : 'text-white/40 hover:text-white/60'}`}
                      >
                        Регистрация
                        {authMode === 'register' && (
                          <motion.div 
                            layoutId="auth-switch-bg"
                            className="absolute inset-0 bg-white rounded-lg -z-10 shadow-[0_10px_20_rgba(255,255,255,0.2)]"
                          />
                        )}
                      </button>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-3xl font-bold tracking-tighter mb-1 text-white italic leading-none">
                        {authMode === 'login' ? 'С возвращением' : 'Присоединяйтесь'}
                      </h2>
                      <p className="text-white/30 text-xs font-medium leading-relaxed max-w-[220px]">
                        {authMode === 'login' ? 'Ваш зашифрованный доступ к свободному интернету.' : 'Безопасный и анонимный серфинг в один клик.'}
                      </p>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                      <div className="space-y-1.5 group/input">
                        <label className="text-[8px] uppercase tracking-[0.3em] font-black text-white/20 ml-2 group-focus-within/input:text-emerald-500/50 transition-colors">Электронная почта</label>
                        <div className="relative">
                          <input 
                            type="email" 
                            placeholder="vlad@example.com"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.02] transition-all placeholder:text-white/10 text-xs font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 group/input">
                        <label className="text-[8px] uppercase tracking-[0.3em] font-black text-white/20 ml-2 group-focus-within/input:text-emerald-500/50 transition-colors">Пароль доступа</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.02] transition-all placeholder:text-white/10 text-xs font-medium"
                          />
                        </div>
                      </div>
                      
                      <button className="w-full bg-white text-zinc-950 font-black text-[11px] uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-3 group mt-4 shadow-[0_20px_40px_rgba(255,255,255,0.1)] relative overflow-hidden active:scale-95">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-zinc-950/5 to-transparent skew-x-12" />
                        
                        <span>{authMode === 'login' ? 'Авторизация' : 'Создать аккаунт'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>

                    <div className="relative my-6 px-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/[0.06]"></div>
                      </div>
                      <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em] font-bold">
                        <span className="bg-[#0b0b0b]/0 px-4 text-white/20">Или через</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 py-3 rounded-xl transition-all group disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors">{loading ? '...' : 'Google'}</span>
                      </button>
                      <button 
                        onClick={handleTelegramLogin}
                        className="flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 py-3 rounded-xl transition-all group"
                      >
                        <svg className="w-4 h-4 text-white/60 group-hover:text-[#24A1DE] transition-colors" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.24.37-.49 1.02-.73 4-1.74 6.67-2.88 8-3.43 3.8-1.57 4.59-1.84 5.1-.14.11.27.1.55.07.82z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors">Telegram</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Unique Features List - Bottom Fixed */}
              <div className="mt-auto pt-4 relative">
                {/* Floating Info Panel */}
                <AnimatePresence>
                  {hoveredFeature !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute bottom-full left-0 right-0 mb-4 z-30"
                    >
                      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
                        {/* Accent line based on feature color */}
                        <div className={`absolute top-0 left-0 w-1 h-full opacity-50 ${
                          hoveredFeature === 0 ? 'bg-emerald-500' : 
                          hoveredFeature === 1 ? 'bg-blue-500' : 'bg-purple-500'
                        }`} />
                        
                        <p className="text-[10px] leading-relaxed text-white/60 font-medium tracking-tight">
                          {hoveredFeature === 0 && (
                            <>Полный безлимит без ограничений. Порты <span className="text-emerald-400">10 Гбит/с</span> обеспечивают высокую скорость и моментальный доступ к контенту в UHD качестве.</>
                          )}
                          {hoveredFeature === 1 && (
                            <>Технология <span className="text-blue-400">Xray (VLESS + Reality)</span> маскирует ваш трафик под обычный веб-серфинг. Провайдер не увидит VPN — для него это обычный визит на сайт.</>
                          )}
                          {hoveredFeature === 2 && (
                            <>Белые списки — это когда весь интернет заблокирован и доступно только ограниченное количество сайтов. Наш VPN позволяет обходить эти ограничения с помощью новейших технологий и протоколов.</>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {[
                    { icon: InfinityIcon, text: 'Безлимитный квантовый трафик', color: 'text-emerald-400/80', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.1)]' },
                    { icon: Fingerprint, text: 'Шифрование военного уровня', color: 'text-blue-400/80', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.1)]' },
                    { icon: Waypoints, text: 'Обход Белых списков', color: 'text-purple-400/80', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.1)]' }
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      onHoverStart={() => setHoveredFeature(i)}
                      onHoverEnd={() => setHoveredFeature(null)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="flex items-center gap-4 text-xs text-white/30 font-semibold group/feat cursor-help"
                    >
                      <item.icon 
                        className={`w-4 h-4 ${item.color} group-hover/feat:opacity-100 transition-all group-hover/feat:scale-110 ${hoveredFeature === i ? item.glow : ''}`} 
                        strokeWidth={1.2} 
                      />
                      <span className={`transition-all uppercase tracking-[0.2em] text-[8px] font-bold ${hoveredFeature === i ? 'text-white/80 translate-x-1' : 'group-hover/feat:text-white/60'}`}>
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        {/* Minimalist Typewriter Description */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden lg:block w-full max-w-2xl px-8">
          <div className="flex flex-col items-center gap-2">
            {/* Status Line */}
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 opacity-50"
            >
              <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] uppercase font-black tracking-[0.3em] text-white">
                Активен: {selectedServer.country}
              </span>
            </motion.div>

            {/* Typewriter Text */}
            <div className="h-8 flex items-center justify-center">
              <motion.p 
                key={selectedServer.id}
                className="text-lg md:text-xl font-bold text-white tracking-tight text-center drop-shadow-lg"
              >
                {selectedServer.description.split('').map((char, index) => (
                  <motion.span
                    key={`${selectedServer.id}-${index}`}
                    initial={{ opacity: 0, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.03,
                      ease: "easeOut"
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Advantages Modal / Overlay */}
      <AnimatePresence>
        {showAdvantages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            {/* Backdrop */}
            <motion.div 
              initial={{ backdropFilter: 'blur(0px)' }}
              animate={{ backdropFilter: 'blur(40px)' }}
              exit={{ backdropFilter: 'blur(0px)' }}
              onClick={() => setShowAdvantages(false)}
              className="absolute inset-0 bg-zinc-950/60 transition-all"
            />

            {/* Modal Content container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl h-[80vh] bg-white/[0.02] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-[0_32px_128px_rgba(0,0,0,0.8)]"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between p-8 border-b border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/30 mb-1">Оцени преимущества</span>
                  <h3 className="text-3xl font-bold tracking-tighter text-white uppercase italic">Почему выбирают нас</h3>
                </div>
                <button 
                  onClick={() => setShowAdvantages(false)}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body (Empty for now as requested) */}
              <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h4 className="text-xl font-bold text-white/80">Готовим контент...</h4>
                  <p className="text-white/30 max-w-xs mx-auto">Скоро здесь появится детальное описание наших технологий защиты и скорости.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
