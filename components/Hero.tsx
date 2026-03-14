'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Shield, Globe as GlobeIcon, Zap, ArrowRight, Sun, Moon, RefreshCw } from 'lucide-react';
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
            <div className="relative overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.06) 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(40px) saturate(1.6)',
                WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
              }}
            >
              {/* Top highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Header */}
              <div className="relative flex items-center justify-between px-5 py-4">
                <span className="text-[13px] font-semibold tracking-[-0.01em] text-white/70">
                  Серверы
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
                      {index > 0 && (
                        <div className="mx-5 h-px bg-white/[0.06]" />
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
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-white/[0.07]'
                            : 'hover:bg-white/[0.04] active:bg-white/[0.06]'
                        }`}
                      >
                        {/* Selected indicator */}
                        {isSelected && (
                          <motion.div
                            layoutId="server-indicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400"
                            style={{ boxShadow: '0 0 8px rgba(52,211,153,0.5)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}

                        {/* Flag — bare, no container */}
                        <span className="text-[1.5rem] leading-none shrink-0">{server.flag}</span>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <span className={`block text-[0.9rem] tracking-[-0.02em] leading-tight ${
                            isSelected ? 'font-semibold text-white' : 'font-medium text-white/80'
                          }`}>
                            {server.country}
                          </span>
                          <span className="block mt-0.5 text-[0.72rem] text-white/30 tracking-wide">
                            {server.city}
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

              {/* Bottom padding */}
              <div className="h-1.5" />
            </div>
          </motion.div>


          {/* Pricing Button */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-2xl p-4 flex items-center justify-between group transition-all shadow-[0_20px_40px_rgba(16,185,129,0.2)] mt-auto max-w-md"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col items-start relative z-10">
              <span className="text-[8px] uppercase font-bold tracking-[0.2em] opacity-70">Премиум доступ</span>
              <span className="text-lg font-bold tracking-tight">Посмотреть тарифы</span>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
          </motion.button>
        </div>

        <div className="hidden lg:block flex-[1.35] pointer-events-none" aria-hidden="true" />

        {/* Right Side: Auth Section */}
        <div className="w-full lg:w-[340px] xl:w-[380px] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-6 flex flex-col shadow-[0_12px_28px_rgba(0,0,0,0.32)] pointer-events-auto">
          {user ? (
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt={user.displayName || ''} width={64} height={64} className="w-16 h-16 rounded-2xl border-2 border-emerald-500/30" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-500">
                      {user.displayName?.[0] || user.email?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Привет, {user.displayName?.split(' ')[0] || 'Пользователь'}</h2>
                    <p className="text-white/50 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Статус подписки</span>
                    <span className="bg-emerald-500 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full">FREE</span>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    У вас активен бесплатный тариф. Перейдите на Premium для доступа к серверам с низкой задержкой.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/10">
                  Настройки аккаунта
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-red-500/10"
                >
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
                <button 
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${authMode === 'login' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                >
                  Вход
                </button>
                <button 
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${authMode === 'register' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                >
                  Регистрация
                </button>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
                  {authMode === 'login' ? 'С возвращением' : 'Регистрация'}
                </h2>
                <p className="text-white/50 text-sm">
                  {authMode === 'login' ? 'Войдите в свой аккаунт WW.pro' : 'Начните безопасный серфинг прямо сейчас.'}
                </p>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="vlad@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-white/20 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 ml-1">Пароль</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-white/20 text-sm"
                  />
                </div>
                
                <button className="w-full bg-white text-zinc-950 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group mt-4 shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                  {authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="bg-[#050505] px-4 text-white/30">Или через</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-2xl transition-all group disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-xs font-bold text-white/70">{loading ? '...' : 'Google'}</span>
                </button>
                <button 
                  onClick={handleTelegramLogin}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-2xl transition-all group"
                >
                  <svg className="w-5 h-5 text-[#24A1DE]" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.24.37-.49 1.02-.73 4-1.74 6.67-2.88 8-3.43 3.8-1.57 4.59-1.84 5.1-.14.11.27.1.55.07.82z" />
                  </svg>
                  <span className="text-xs font-bold text-white/70">Telegram</span>
                </button>
              </div>
            </>
          )}

          {/* Features List */}
          <div className="mt-auto pt-8 space-y-3">
            {[
              { icon: Zap, text: 'Безлимитный трафик' },
              { icon: Shield, text: 'Шифрование военного уровня' },
              { icon: GlobeIcon, text: 'Более 50 стран' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-white/40 font-medium">
                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <item.icon className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                {item.text}
              </div>
            ))}
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
    </div>
  );
}
