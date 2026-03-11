'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Globe as GlobeIcon, Zap, Server, ArrowRight, CheckCircle2, Signal, Activity, MapPin } from 'lucide-react';
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
}

const SERVERS: ServerData[] = [
  { id: 'de', country: 'Германия', city: 'Франкфурт', coords: [50.1109, 8.6821], basePing: 35, flag: '🇩🇪' },
  { id: 'am', country: 'Армения', city: 'Ереван', coords: [40.1772, 44.5035], basePing: 55, flag: '🇦🇲' },
  { id: 'fi', country: 'Финляндия', city: 'Хельсинки', coords: [60.1699, 24.9384], basePing: 42, flag: '🇫🇮' },
  { id: 'us', country: 'США', city: 'Нью-Йорк', coords: [40.7128, -74.0060], basePing: 110, flag: '🇺🇸' },
];

export default function Hero() {
  const router = useRouter();
  const [selectedServer, setSelectedServer] = useState<ServerData>(SERVERS[0]);
  const [pings, setPings] = useState<Record<string, number | 'testing'>>({});
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(false);

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
// ...
    setPings(prev => ({ ...prev, [serverId]: 'testing' }));
    
    setTimeout(() => {
      const base = SERVERS.find(s => s.id === serverId)?.basePing || 50;
      const variation = Math.floor(Math.random() * 10) - 5;
      setPings(prev => ({ ...prev, [serverId]: base + variation }));
    }, 800 + Math.random() * 1000);
  };

  useEffect(() => {
    // Initial ping simulation for all
    SERVERS.forEach(s => simulatePing(s.id));
  }, []);

  return (
    <div className="relative h-screen bg-[#050505] overflow-hidden">
      {/* Full Screen Globe Background */}
      <Globe 
        selectedCountryId={selectedServer.id}
        selectedLocation={selectedServer.coords} 
        serverInfo={{ city: selectedServer.city, country: selectedServer.country, flag: selectedServer.flag }}
      />

      {/* UI Overlay */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row p-3 md:p-4 gap-4 max-w-[1600px] mx-auto pointer-events-none">
        {/* Left Side: Info & Server List */}
        <div className="flex-1 flex flex-col gap-4 pointer-events-auto">
          {/* Header/Logo */}
          <header className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="text-zinc-950 w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tighter font-mono">WW.pro</span>
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

          {/* Server List */}
          <div className="flex flex-col gap-2 max-w-md">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-bold flex items-center gap-2">
                <Signal className="w-3 h-3" /> Список серверов
              </h4>
              <button 
                onClick={() => SERVERS.forEach(s => simulatePing(s.id))}
                className="text-[10px] uppercase tracking-widest text-emerald-500 hover:text-emerald-400 font-bold transition-colors"
              >
                Обновить пинг
              </button>
            </div>
            
            <div className="grid gap-2">
              {SERVERS.map((server) => (
                <motion.div
                  key={server.id}
                  onClick={() => setSelectedServer(server)}
                  whileHover={{ x: 4 }}
                  className={`
                    relative cursor-pointer p-2 md:p-3 rounded-xl border transition-all duration-300 flex items-center justify-between backdrop-blur-xl
                    ${selectedServer.id === server.id 
                      ? 'bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl drop-shadow-lg">
                      {server.flag}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white/90">{server.country}</div>
                      <div className="text-[8px] text-white/50">{server.city}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-sm font-mono font-bold ${
                        typeof pings[server.id] === 'number' 
                          ? (pings[server.id] as number) < 50 ? 'text-emerald-400' : (pings[server.id] as number) < 100 ? 'text-yellow-400' : 'text-red-400'
                          : 'text-white/30'
                      }`}>
                        {pings[server.id] === 'testing' ? (
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            ...
                          </motion.span>
                        ) : (
                          `${pings[server.id] || '--'} ms`
                        )}
                      </div>
                      <div className="text-[10px] uppercase tracking-tighter text-white/30 font-bold">Latency</div>
                    </div>
                    {selectedServer.id === server.id && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]"
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

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

        {/* Center: Active Info Overlay */}
        <div className="flex-[1.5] relative flex items-end justify-center pb-4 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedServer.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex items-center gap-4 min-w-[260px] pointer-events-auto"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-2xl drop-shadow-lg">
                {selectedServer.flag}
              </div>
              <div>
                <div className="text-[8px] uppercase tracking-[0.2em] text-emerald-400 font-bold mb-0.5">Активный узел</div>
                <div className="text-xl font-bold leading-none mb-0.5 text-white">{selectedServer.city}</div>
                <div className="text-white/60 text-xs font-medium">{selectedServer.country}</div>
              </div>
              <div className="ml-auto pl-3 border-l border-white/10">
                <div className="text-xl font-mono font-bold text-emerald-400">
                  {typeof pings[selectedServer.id] === 'number' ? pings[selectedServer.id] : '--'}
                  <span className="text-[10px] ml-0.5 opacity-50">ms</span>
                </div>
                <div className="text-[8px] uppercase tracking-widest text-white/40 font-bold">Стабильно</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Auth Section */}
        <div className="w-full lg:w-[340px] xl:w-[380px] bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/10 p-4 md:p-6 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
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
      </div>
    </div>
  );
}

