'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Shield, Globe as GlobeIcon, Zap, ArrowRight, Sun, Moon, RefreshCw, Key, Fingerprint, Lock, Layers, Waves, ScanEye, ShieldCheck, Radar, Infinity as InfinityIcon, Waypoints } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Globe from './Globe';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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


// --- Mockup Components ---

const MockupPrice = () => (
  <div className="relative w-full h-full p-6 flex flex-col justify-center gap-4">
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-2 text-white/40 text-sm font-medium uppercase tracking-widest line-through decoration-rose-500/50"
    >
      Обычный VPN: 299 ₽ / мес
    </motion.div>

    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
      className="w-full bg-emerald-500/10 border border-emerald-500/40 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent pointer-events-none" />
      <motion.div 
        animate={{ x: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent skew-x-12 w-1/2"
      />
      
      <div className="text-center relative z-10 space-y-2">
        <span className="text-[10px] text-emerald-400 uppercase tracking-[0.3em] font-black">WW.pro Premium</span>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl md:text-6xl font-black italic tracking-tighter text-white">99 ₽</span>
          <span className="text-white/50 font-bold uppercase tracking-widest text-xs">/ мес</span>
        </div>
      </div>

      <div className="mt-6 space-y-2 relative z-10 text-center">
         <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <InfinityIcon className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-bold text-white/80 uppercase tracking-wider">Безлимитный Трафик</span>
         </div>
         <div className="flex justify-center gap-2 flex-wrap">
           <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-[9px] font-bold text-white/80 uppercase tracking-wider">Скорость 10 Гбит/с</span>
           </div>
           <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <GlobeIcon className="w-3 h-3 text-purple-400" />
              <span className="text-[9px] font-bold text-white/80 uppercase tracking-wider">4 Топовые Локации</span>
           </div>
         </div>
      </div>
    </motion.div>
  </div>
);

const MockupSpeed = () => (
  <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-black flex items-center justify-center">
    <video 
      className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen scale-[1.05]"
      autoPlay 
      muted 
      loop 
      playsInline
      poster="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
    >
      {/* High tech abstract speed/data matrix loop */}
      <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-holographic-globe-48995-large.mp4" type="video/mp4" />
    </video>
    
    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80 pointer-events-none" />
    
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-blue-500/30 text-blue-400 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2 z-10 whitespace-nowrap"
    >
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      10 Gbps 4K UHD Flow
    </motion.div>
  </div>
);

const MockupYouTube = () => (
   <div className="relative w-full h-full flex items-center justify-center pt-2">
     <div className="w-32 md:w-40 h-[14rem] md:h-[18rem] bg-black border-4 md:border-8 border-zinc-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl flex flex-col items-center">
       {/* Fake Phone Notch */}
       <div className="absolute top-0 w-1/2 h-4 bg-zinc-900 rounded-b-xl z-20 flex justify-center items-center">
          <div className="w-8 h-1 bg-zinc-800 rounded-full" />
       </div>
       
       {/* Reel/Phone Screen Content */}
       <div className="w-full h-full relative object-cover">
          <video 
            className="absolute inset-0 w-full h-full object-cover scale-105"
            autoPlay 
            muted 
            loop 
            playsInline
            poster="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop"
          >
            {/* Action sequence of user scrolling/tapping smartphone */}
            <source src="https://assets.mixkit.co/videos/preview/mixkit-woman-using-a-cell-phone-on-the-street-4595-large.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
          
          <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-between items-center z-10">
             <div className="flex flex-col">
               <span className="text-white font-bold text-xs shadow-md">@premium_vlog</span>
               <span className="text-white/60 text-[8px]">4K Cinematic Walk...</span>
             </div>
          </div>
       </div>

       {/* Ad block badge floating */}
       <motion.div 
         initial={{ scale: 0, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ type: "spring", delay: 1 }}
         className="absolute -right-6 bottom-4 md:-right-8 bg-[#0a0a0a]/90 backdrop-blur-md border border-rose-500/50 text-rose-400 p-2 md:p-3 rounded-2xl shadow-[0_10px_30px_rgba(244,63,94,0.4)] flex items-center gap-2 transform -rotate-6 z-30"
       >
         <div className="w-6 h-6 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/30">
           <ScanEye className="w-3 h-3 text-rose-400" />
         </div>
         <span className="text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap">0 Рекомендуемой<br/>Рекламы</span>
       </motion.div>
     </div>
   </div>
);

const MockupStealth = () => (
  <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden flex items-center justify-center bg-[#0a0a0a]">
    <video 
      className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen scale-[1.05]"
      autoPlay 
      muted 
      loop 
      playsInline
    >
      {/* Abstract digital network grid loop */}
      <source src="https://assets.mixkit.co/videos/preview/mixkit-data-animation-with-a-network-of-connections-48991-large.mp4" type="video/mp4" />
    </video>

    {/* Center Overlay to blend the video */}
    <div className="absolute inset-0 bg-purple-950/20 mix-blend-multiply" />
    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] opacity-80" />

    {/* Ghosting Shield */}
    <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-2xl border border-purple-500/50 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.4)]">
      <Shield className="w-8 h-8 text-purple-400" />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute inset-0 rounded-2xl border border-purple-500/50"
      />
    </div>

    {/* Floating tag */}
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#020617] backdrop-blur-md border border-purple-500/40 text-purple-300 px-4 py-2 rounded-xl flex items-center gap-3 shadow-2xl z-20"
    >
      <div className="relative flex items-center justify-center">
        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        <div className="absolute w-4 h-4 bg-emerald-500/30 rounded-full animate-ping" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Stealth Mode Active</span>
    </motion.div>
  </div>
);

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

const ADVANTAGES_SLIDES = [
  {
    id: 'price',
    title: "Премиум доступ за копейки",
    description: "Самая низкая цена в индустрии за полноценный безлимит. 4 мощные локации включены в базовый тариф навсегда.",
    component: MockupPrice,
    accent: "emerald",
    stat: "4 Сервера"
  },
  {
    id: 'speed',
    title: "Квантовая скорость в 4K UHD",
    description: "Забудьте о буферизации. Смотрите фильмы и стримы в максимальном качестве благодаря портам 10 Гбит/с.",
    component: MockupSpeed,
    accent: "blue",
    stat: "10 Гбит/с"
  },
  {
    id: 'youtube',
    title: "YouTube уровня God Mode",
    description: "Смотрите YouTube без единой рекламной вставки. Полное отсутствие цензуры и задержек на любых устройствах.",
    component: MockupYouTube,
    accent: "rose",
    stat: "0 Рекламы"
  },
  {
    id: 'stealth',
    title: "Обход любых «Белых списков»",
    description: "Технология VLESS + Reality маскирует трафик под обычный веб-серфинг. Для провайдера вас просто не существует.",
    component: MockupStealth,
    accent: "purple",
    stat: "Stealth"
  }
];

const FEATURE_INFO = [
  'Полный безлимит без ограничений. Порты 10 Гбит/с обеспечивают высокую скорость и моментальный доступ к контенту в UHD качестве.',
  'Технология Xray (VLESS + Reality) маскирует ваш трафик под обычный веб-серфинг. Провайдер не увидит VPN — для него это обычный визит на сайт.',
  'Белые списки — когда всё заблокировано. Наш VPN обходит эти жесткие фильтры, открывая доступ к любому контенту по всему миру.'
];

const STORAGE_THEME_KEY = 'wwpro-theme';
const LEFT_RAIL_CLASS = "w-full max-w-[35rem] xl:max-w-[37rem] [@media(max-height:940px)]:lg:max-w-[32rem] [@media(max-height:860px)]:lg:max-w-[29rem]";

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
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [globeFocusToken, setGlobeFocusToken] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const effectiveTheme = isThemeReady ? globeTheme : 'dark';
  const isLight = effectiveTheme === 'light';

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (showAdvantages) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % ADVANTAGES_SLIDES.length);
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [showAdvantages]);

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

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedTheme = window.localStorage.getItem(STORAGE_THEME_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setGlobeTheme(savedTheme);
      }
      setIsThemeReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
    if (isThemeReady) {
      window.localStorage.setItem(STORAGE_THEME_KEY, globeTheme);
    }
  }, [effectiveTheme, globeTheme, isThemeReady]);

  const isAnyPingTesting = Object.values(pings).some((ping) => ping === 'testing');

  return (
    <div className={cn(
      "relative min-h-[100svh] overflow-x-hidden transition-colors duration-300 lg:h-[100svh] [@media(max-height:860px)]:lg:h-auto"
    )}>
      {/* Full Screen Globe Background */}
      <Globe 
        selectedCountryId={selectedServer.id}
        selectedLocation={selectedServer.coords} 
        serverInfo={selectedServerInfo}
        theme={effectiveTheme}
        focusToken={globeFocusToken}
      />

      {/* UI Overlay */}
      <div className="relative z-10 mx-auto grid min-h-[100svh] w-full max-w-[1600px] grid-rows-[minmax(0,1fr)_auto] px-3 pb-3 pt-3 md:px-4 md:pb-4 md:pt-4 lg:h-full lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_minmax(2.8rem,auto)] lg:px-6 lg:pb-3 lg:pt-4 xl:px-8 xl:pb-4 xl:pt-5 [@media(max-height:940px)]:lg:grid-rows-[minmax(0,1fr)_minmax(2.45rem,auto)] [@media(max-height:940px)]:lg:pt-3 [@media(max-height:860px)]:lg:h-auto [@media(max-height:860px)]:lg:min-h-[100svh] [@media(max-height:860px)]:lg:grid-rows-[auto_auto] pointer-events-none">
        <div className="grid min-h-0 gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(22.75rem,25.5rem)] lg:items-stretch lg:gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(23rem,26rem)] xl:gap-8 [@media(max-height:940px)]:lg:gap-5 [@media(max-height:860px)]:lg:h-auto">
        {/* Left Side: Info & Server List */}
        <div className="pointer-events-none flex min-h-0 flex-col gap-4 lg:h-full lg:max-w-[44rem] lg:justify-between xl:max-w-[46rem]">
          <div className="pointer-events-none flex flex-col gap-4 lg:gap-5 [@media(max-height:940px)]:lg:gap-4 [@media(max-height:860px)]:lg:gap-3">
            <div className={cn("relative", LEFT_RAIL_CLASS)}>
              {isLight ? (
                <div className="pointer-events-none absolute -left-8 -top-8 h-[22rem] w-[34rem] rounded-[3rem] bg-[radial-gradient(circle_at_top_left,rgba(250,253,255,0.76)_0%,rgba(237,245,251,0.44)_38%,rgba(255,255,255,0)_78%)] blur-[72px]" />
              ) : null}
              {/* Header/Logo */}
              <header className="pointer-events-none flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Shield className="text-zinc-950 w-6 h-6" />
                  </div>
                  <span className={cn(
                    "text-2xl font-bold tracking-tighter font-mono transition-colors",
                    isLight ? "text-[var(--text-1)]" : "text-white"
                  )}>WW.pro</span>
                </div>
                <div
                  className={cn(
                    "pointer-events-auto inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur-xl transition-all",
                    isLight
                      ? "border-[var(--border-default)] bg-[rgba(236,244,250,0.72)] shadow-[0_18px_44px_var(--shadow-color),inset_0_1px_0_rgba(255,255,255,0.56)]"
                      : "border-white/10 bg-black/30"
                  )}
                >
                  {[
                    { id: 'dark', icon: Moon, label: 'Тёмная тема' },
                    { id: 'light', icon: Sun, label: 'Светлая тема' },
                  ].map((option) => {
                    const active = effectiveTheme === option.id;
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.id}
                        onClick={() => setGlobeTheme(option.id as 'dark' | 'light')}
                        aria-label={option.label}
                        className={cn(
                          "relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-all outline-none focus:outline-none focus-visible:outline-none",
                          active
                            ? isLight
                              ? "bg-[var(--surface-4)] text-[var(--accent-text)] shadow-[0_10px_24px_rgba(34,58,84,0.12),0_0_0_1px_rgba(255,255,255,0.46)]"
                              : "bg-white text-zinc-950 shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
                            : isLight
                              ? "text-[var(--text-2)] hover:bg-[var(--surface-3)] hover:text-[var(--text-1)]"
                              : "text-white/45 hover:bg-white/8 hover:text-white/80"
                        )}
                        title={option.label}
                        type="button"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
              </header>

              {/* Main Headline */}
              <div className="relative mt-4 w-full space-y-3 lg:mt-5 lg:space-y-4 [@media(max-height:940px)]:lg:mt-4 [@media(max-height:940px)]:lg:space-y-3 [@media(max-height:860px)]:lg:mt-3 [@media(max-height:860px)]:lg:space-y-2">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "max-w-[8.1ch] text-[clamp(3rem,10vw,5rem)] font-bold tracking-tight leading-[0.84] md:text-[clamp(4rem,9vw,6.2rem)] lg:text-[clamp(4.15rem,6vw,6.75rem)] [@media(max-height:940px)]:lg:text-[clamp(3rem,4.65vw,5rem)] [@media(max-height:860px)]:lg:text-[clamp(2.55rem,4vw,4.25rem)] transition-colors",
                    isLight ? "text-[var(--text-1)] drop-shadow-[0_10px_24px_rgba(255,255,255,0.12)]" : "text-white drop-shadow-2xl"
                  )}
                >
                  Лучший <span className={cn("italic", isLight ? "text-[var(--accent-text)]" : "text-emerald-500")}>VPN</span> сервис
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    "w-full text-sm leading-relaxed md:text-base lg:text-[clamp(0.95rem,1vw,1.12rem)] [@media(max-height:940px)]:lg:text-[0.98rem] [@media(max-height:860px)]:lg:text-[0.9rem] transition-colors",
                    isLight
                      ? "rounded-[1.4rem] border border-[rgba(255,255,255,0.46)] bg-[rgba(239,246,251,0.62)] px-4 py-3 text-[var(--text-2)] shadow-[0_14px_30px_rgba(30,58,88,0.08),inset_0_1px_0_rgba(255,255,255,0.56)] backdrop-blur-md"
                      : "text-zinc-300 drop-shadow-md"
                  )}
                >
                  Максимальная скорость и безопасность в один клик. Выбирайте лучшие локации по всему миру.
                </motion.p>
              </div>
            </div>

            {/* Server List — Liquid Glass */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={cn("pointer-events-auto relative", LEFT_RAIL_CLASS)}
            >
            {/* Glass container */}
            <div
              className="relative overflow-hidden rounded-[2.5rem] group transition-all duration-1000"
              style={{
                background: isLight
                  ? 'linear-gradient(180deg, rgba(244,249,253,0.76) 0%, rgba(233,241,248,0.72) 100%)'
                  : 'rgba(5, 5, 5, 0.4)',
                boxShadow: isLight
                  ? '0 28px 72px var(--shadow-color), inset 0 1px 0 rgba(255,255,255,0.54)'
                  : '0 20px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)',
                backdropFilter: 'blur(34px) saturate(1.25)',
                WebkitBackdropFilter: 'blur(34px) saturate(1.25)',
              }}
            >
              {/* Premium Quantum Liquid Fill — "Aurora Silk" Edition */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[1200ms] pointer-events-none">
                <div className={cn(
                  "absolute inset-0",
                  isLight
                    ? "bg-[linear-gradient(140deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0)_38%,rgba(121,165,201,0.16)_100%)]"
                    : "bg-gradient-to-tr from-emerald-500/[0.03] via-transparent to-blue-500/[0.03]"
                )} />
                {isLight ? (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,248,233,0.24)_0%,transparent_44%)]" />
                ) : (
                  <>
                    <motion.div 
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                      className="absolute -top-full -left-full w-[300%] h-[300%] blur-[150px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04)_0%,transparent_50%)]"
                    />
                    <motion.div 
                      animate={{ 
                        rotate: [360, 0],
                        scale: [1.1, 1, 1.1],
                      }}
                      transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                      className="absolute -bottom-full -right-full w-[300%] h-[300%] blur-[150px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04)_0%,transparent_50%)]"
                    />
                    <div className="absolute inset-0 group-hover:animate-[spin_10s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent,white/[0.01],transparent)]" />
                  </>
                )}
              </div>
              
              {/* Soft Volume Glow & Refined Border */}
              <div className={cn(
                "absolute inset-0 rounded-[2.5rem] pointer-events-none transition-all duration-1000",
                isLight
                  ? "border border-[var(--border-default)] group-hover:border-[var(--accent-border)] shadow-[inset_0_1px_0_rgba(255,255,255,0.46)]"
                  : "border border-white/[0.04] group-hover:border-emerald-500/10 shadow-[inset_0_0_100px_rgba(16,185,129,0.03)]"
              )} />
              {isLight ? (
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />
              ) : null}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-[1200ms] pointer-events-none",
                isLight
                  ? "bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.22)_0%,transparent_52%)]"
                  : "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,250,0.05)_0%,transparent_60%)]"
              )} />

              {/* Header */}
              <div className="relative flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 [@media(max-height:940px)]:lg:px-4 [@media(max-height:940px)]:lg:py-3 [@media(max-height:860px)]:lg:py-2.5">
                <span className={cn(
                  "text-[10px] uppercase font-black tracking-[0.3em] transition-colors",
                  isLight ? "text-[var(--text-2)]" : "text-white/40"
                )}>
                  Доступные локации
                </span>
                <button
                  onClick={() => SERVERS.forEach((server) => simulatePing(server.id))}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 active:scale-90",
                    isLight ? "hover:bg-[var(--surface-3)]" : "hover:bg-white/10"
                  )}
                  title="Проверить пинг"
                >
                  <RefreshCw className={cn(
                    "w-3.5 h-3.5 transition-colors",
                    isLight ? "text-[var(--text-2)] hover:text-[var(--text-1)]" : "text-white/40 hover:text-white/70",
                    isAnyPingTesting && 'refresh-spin'
                  )} />
                </button>
              </div>

              {/* Server rows */}
              <div className="relative px-2.5 pb-2.5 pt-1.5 sm:px-3 sm:pb-3 sm:pt-2 [@media(max-height:940px)]:lg:px-2.5 [@media(max-height:940px)]:lg:pb-2.5 [@media(max-height:940px)]:lg:pt-1.5 [@media(max-height:860px)]:lg:pb-2 [@media(max-height:860px)]:lg:pt-1">
                {SERVERS.map((server, index) => {
                  const currentPing = pings[server.id];
                  const isSelected = selectedServer.id === server.id;
                  const isTesting = currentPing === 'testing';

                  const pingColor = () => {
                    if (typeof currentPing !== 'number') return isLight ? 'text-[var(--text-3)]' : 'text-white/25';
                    if (currentPing < 50) return 'text-emerald-400';
                    if (currentPing < 100) return 'text-yellow-400';
                    return 'text-rose-400';
                  };

                  const dotColor = () => {
                    if (typeof currentPing !== 'number') return isLight ? 'bg-[var(--text-3)]' : 'bg-white/20';
                    if (currentPing < 50) return 'bg-emerald-400';
                    if (currentPing < 100) return 'bg-yellow-400';
                    return 'bg-rose-400';
                  };

                  return (
                    <div key={server.id}>
                      {/* Divider */}
                      {index > 0 && !isSelected && SERVERS[index - 1].id !== selectedServer.id && (
                        <div className={cn(
                          "mx-4 sm:mx-5 h-px [@media(max-height:860px)]:lg:mx-4",
                          isLight ? "bg-[var(--border-soft)]" : "bg-white/[0.045]"
                        )} />
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
                        className={cn(
                          "relative flex items-center gap-3 sm:gap-4 rounded-[1.55rem] sm:rounded-[1.9rem] px-4 py-4 sm:px-6 sm:py-5 [@media(max-height:940px)]:lg:gap-3 [@media(max-height:940px)]:lg:px-4 [@media(max-height:940px)]:lg:py-3 [@media(max-height:860px)]:lg:px-3.5 [@media(max-height:860px)]:lg:py-2.5 cursor-pointer select-none bg-transparent outline-none transition-all duration-300 focus:outline-none focus-visible:outline-none",
                          isSelected
                            ? isLight
                              ? 'bg-[linear-gradient(135deg,rgba(248,251,255,0.88)_0%,rgba(235,243,250,0.82)_100%)] shadow-[0_14px_30px_var(--shadow-color),inset_0_1px_0_rgba(255,255,255,0.72)]'
                              : 'bg-white/[0.07] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04),0_16px_40px_rgba(4,10,24,0.18)]'
                            : isLight
                              ? 'hover:bg-[rgba(244,249,253,0.62)] active:scale-[0.995]'
                              : 'hover:bg-white/[0.025] active:scale-[0.995]'
                        )}
                      >
                        {/* Selected outline */}
                        {isSelected && (
                          <motion.div
                            layoutId="server-outline"
                            className="pointer-events-none absolute inset-0 rounded-[1.55rem] sm:rounded-[1.9rem] border"
                            style={{
                              borderColor: isLight ? 'var(--accent-ui)' : 'rgba(110, 231, 183, 0.34)',
                              boxShadow: isLight
                                ? 'inset 0 1px 0 rgba(255,255,255,0.78), 0 0 0 1px rgba(45,156,219,0.22), 0 12px 24px rgba(45,156,219,0.1)'
                                : 'inset 0 0 0 1px rgba(255,255,255,0.03), 0 0 0 1px rgba(110,231,183,0.14), 0 12px 30px rgba(16,185,129,0.10), 0 0 22px rgba(129,140,248,0.08)',
                            }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          />
                        )}

                        {/* Flag — bare, no container */}
                        <span className="text-[1.35rem] sm:text-[1.5rem] [@media(max-height:940px)]:lg:text-[1.3rem] [@media(max-height:860px)]:lg:text-[1.2rem] leading-none shrink-0">{server.flag}</span>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <span className={cn(
                            "block text-[14px] sm:text-[15px] [@media(max-height:940px)]:lg:text-[14px] [@media(max-height:860px)]:lg:text-[13px] tracking-tight leading-tight transition-colors",
                            isSelected
                              ? isLight ? 'font-bold text-[var(--text-1)]' : 'font-bold text-white'
                              : isLight ? 'font-medium text-[var(--text-2)]' : 'font-medium text-white/60'
                          )}>
                            {server.country}
                          </span>
                          <span className={cn(
                            "block mt-0.5 text-[10px] sm:text-[11px] [@media(max-height:940px)]:lg:text-[10px] [@media(max-height:860px)]:lg:text-[9px] font-medium tracking-wide transition-colors",
                            isLight ? "text-[var(--text-3)]" : "text-white/20"
                          )}>
                            {server.city.toUpperCase()}
                          </span>
                        </div>

                        {/* Ping */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className={`text-[0.8rem] sm:text-[0.82rem] [@media(max-height:940px)]:lg:text-[0.78rem] [@media(max-height:860px)]:lg:text-[0.74rem] font-medium tabular-nums tracking-tight ${pingColor()} transition-colors duration-300`}>
                            {isTesting ? (
                              <motion.span
                                animate={{ opacity: [0.3, 0.8, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className={cn(
                                  isLight ? "text-[var(--text-3)]" : "text-white/30"
                                )}
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
          </div>


          {/* Interactive Advantages CTA - Compact & Minimalist */}
          <div className={cn("pointer-events-auto pt-3.5 lg:pb-1 [@media(max-height:940px)]:lg:pt-2 [@media(max-height:860px)]:lg:pt-1.5", LEFT_RAIL_CLASS)}>
            <div 
              onClick={() => {
                if (isTelling) return;
                setIsTelling(true);
                setTimeout(() => {
                  setShowAdvantages(true);
                  setIsTelling(false);
                }, 1000);
              }}
              className="group flex w-full cursor-pointer flex-col items-start"
            >
              {/* Micro-label */}
              <div className="flex items-center gap-2 mb-1 text-center">
                <div className={`w-1 h-1 rounded-full ${isTelling ? (isLight ? 'bg-[var(--accent-ui)] animate-pulse' : 'bg-emerald-500 animate-pulse') : isLight ? 'bg-[var(--text-3)] group-hover:bg-[var(--accent-ui)]' : 'bg-white/20 group-hover:bg-emerald-500/50'} transition-colors`} />
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-[0.4em] transition-colors duration-500",
                  isLight ? "text-[var(--text-3)] group-hover:text-[var(--accent-text)]" : "text-white/20 group-hover:text-emerald-500/60"
                )}>
                  {isTelling ? 'Подготовка...' : 'О ПРЕИМУЩЕСТВАХ'}
                </span>
                <div className={cn(
                  "w-4 h-px group-hover:w-8 transition-all duration-500",
                  isLight ? "bg-[var(--border-default)] group-hover:bg-[var(--accent-ui-soft)]" : "bg-white/5 group-hover:bg-emerald-500/30"
                )} />
              </div>
              
              <div className="flex items-center gap-3">
                <h3 className={cn(
                  "text-lg md:text-xl font-black italic tracking-tighter transition-all duration-500 [@media(max-height:940px)]:lg:text-[1.05rem] [@media(max-height:860px)]:lg:text-[0.95rem]",
                  isLight ? "text-[var(--text-2)] group-hover:text-[var(--text-1)]" : "text-white/50 group-hover:text-white"
                )}>
                  <span className="mr-2">{isTelling ? 'Сейчас все' : 'Почему выбирают'}</span>
                  <span className={cn(
                    "transition-colors duration-500",
                    isLight ? "text-[var(--accent-text)] group-hover:text-[var(--accent-ui-strong)]" : "text-emerald-500/60 group-hover:text-emerald-400"
                  )}>{isTelling ? 'расскажем' : 'нас?'}</span>
                </h3>
              </div>

              {/* Sophisticated Underline Progress */}
              <div className={cn(
                "mt-2 relative w-full h-[1px] overflow-hidden",
                isLight ? "bg-[var(--border-soft)]" : "bg-white/[0.03]"
              )}>
                <motion.div 
                  initial={false}
                  animate={isTelling ? { x: ['-100%', '0%'] } : { x: '-100%' }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r from-transparent to-transparent",
                    isLight ? "via-[var(--accent-ui-soft)]" : "via-emerald-500/50"
                  )}
                />
                <div className={cn(
                  "absolute inset-0 w-0 group-hover:w-full transition-all duration-700 ease-out",
                  isLight ? "bg-[var(--border-default)]" : "bg-white/10"
                )} />
              </div>
            </div>
          </div>
        </div>

          {/* Right Side: Auth Section with Interactive Glow */}
          <div className="group relative flex w-full self-stretch pointer-events-none lg:h-full lg:max-w-[25rem] lg:min-h-0 lg:justify-self-end xl:max-w-[26rem] [@media(max-height:940px)]:lg:max-w-[24rem] [@media(max-height:860px)]:lg:max-w-[22.75rem]">
            {/* Background Kinetic Glow */}
            <div className={cn(
              "absolute -inset-4 blur-[100px] rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000",
              isLight ? "bg-[radial-gradient(circle_at_top,rgba(176,207,231,0.16)_0%,transparent_70%)]" : "bg-emerald-500/10"
            )} />
            
            <div className={cn(
              "pointer-events-auto relative flex min-h-[36rem] w-full flex-col overflow-hidden rounded-[2.5rem] p-5 backdrop-blur-3xl md:p-8 lg:h-full lg:min-h-[calc(100svh-7.6rem)] lg:flex-1 xl:min-h-[calc(100svh-8rem)] [@media(max-height:940px)]:lg:min-h-[calc(100svh-6.7rem)] [@media(max-height:940px)]:lg:p-6 [@media(max-height:860px)]:lg:h-auto [@media(max-height:860px)]:lg:min-h-[31rem] [@media(max-height:860px)]:lg:p-5 transition-colors",
              isLight
                ? "border border-[var(--border-default)] bg-[linear-gradient(180deg,rgba(244,249,253,0.8)_0%,rgba(232,240,247,0.72)_100%)] shadow-[0_30px_80px_var(--shadow-color),inset_0_1px_0_rgba(255,255,255,0.54)]"
                : "border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
            )}>
              {isLight ? (
                <>
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/65 to-transparent opacity-65" />
                  <div className="pointer-events-none absolute inset-y-10 right-0 w-px bg-gradient-to-b from-transparent via-[var(--accent-ui-soft)] to-transparent opacity-45" />
                </>
              ) : null}
              {/* Inner Glass Glow */}
              <div className={cn(
                "absolute -top-24 -right-24 w-48 h-48 blur-[60px] rounded-full",
                isLight ? "bg-[radial-gradient(circle_at_center,rgba(176,207,231,0.18)_0%,rgba(176,207,231,0)_72%)]" : "bg-emerald-500/10"
              )} />
              
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
                          <h2 className={cn(
                            "text-2xl font-bold tracking-tight leading-tight",
                            isLight ? "text-[var(--text-1)]" : "text-white"
                          )}>Привет, {user.displayName?.split(' ')[0] || 'Пользователь'}</h2>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             <p className={cn(
                               "text-xs font-medium tracking-wide",
                               isLight ? "text-[var(--text-3)]" : "text-white/40"
                             )}>{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "relative overflow-hidden bg-gradient-to-br border rounded-2xl p-4",
                        isLight
                          ? "from-[rgba(182,216,238,0.46)] to-[rgba(255,255,255,0)] border-[rgba(45,156,219,0.16)] bg-[linear-gradient(180deg,rgba(231,242,250,0.9)_0%,rgba(243,248,252,0.72)_100%)]"
                          : "from-emerald-500/[0.08] to-transparent border-emerald-500/20"
                      )}>
                        <div className="absolute top-0 right-0 p-3">
                          <Zap className={cn("w-8 h-8 -rotate-12", isLight ? "text-[rgba(127,183,217,0.12)]" : "text-emerald-500/10")} />
                        </div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                          <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em]", isLight ? "text-[var(--accent-text)]" : "text-emerald-400")}>Статус</span>
                          <span className={cn(
                            "text-[8px] font-black px-2 py-0.5 rounded-full border",
                            isLight ? "bg-[rgba(45,156,219,0.12)] text-[var(--accent-text)] border-[rgba(45,156,219,0.16)]" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          )}>БЕЗЛИМИТ</span>
                        </div>
                        <p className={cn(
                          "text-xs leading-relaxed relative z-10 font-medium tracking-tight",
                          isLight ? "text-[var(--text-2)]" : "text-white/70"
                        )}>
                          Раскройте потенциал сети с вашим Platinum тарифом.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-auto relative z-10">
                      <button className={cn(
                        "w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border group",
                        isLight
                          ? "bg-[var(--surface-2)] hover:bg-[var(--surface-4)] text-[var(--text-1)] border-[var(--border-default)]"
                          : "bg-white/[0.05] hover:bg-white/[0.08] text-white border-white/10"
                      )}>
                        <span className="text-sm">Настройки</span>
                        <ArrowRight className={cn(
                          "w-4 h-4 group-hover:translate-x-1 transition-all",
                          isLight ? "text-[var(--text-3)] group-hover:text-[var(--text-1)]" : "text-white/40 group-hover:text-white"
                        )} />
                      </button>
                      <button 
                        onClick={handleLogout}
                        className={cn(
                          "w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border",
                          isLight
                            ? "bg-rose-500/8 hover:bg-rose-500/14 text-rose-700 border-rose-500/18"
                            : "bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 border-rose-500/10"
                        )}
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
                    <div className={cn(
                      "flex p-1 rounded-xl mb-6 border relative [@media(max-height:940px)]:lg:mb-5 [@media(max-height:860px)]:lg:mb-4",
                      isLight ? "bg-[rgba(171,189,204,0.42)] border-[var(--border-default)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]" : "bg-white/[0.03] border-white/5"
                    )}>
                      <button 
                        onClick={() => setAuthMode('login')}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative z-10 outline-none focus:outline-none focus-visible:outline-none",
                          authMode === 'login'
                            ? isLight ? 'text-white' : 'text-zinc-950'
                            : isLight ? 'text-[var(--text-3)] hover:text-[var(--text-1)]' : 'text-white/40 hover:text-white/60'
                        )}
                      >
                        Вход
                        {authMode === 'login' && (
                          <motion.div 
                            layoutId="auth-switch-bg"
                            className={cn(
                              "absolute inset-0 rounded-lg -z-10",
                              isLight
                                ? "bg-[#173149] shadow-[0_12px_22px_rgba(23,49,73,0.18),0_0_0_1px_rgba(45,156,219,0.18)]"
                                : "bg-white shadow-[0_10px_20px_rgba(255,255,255,0.2)]"
                            )}
                          />
                        )}
                      </button>
                      <button 
                        onClick={() => setAuthMode('register')}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative z-10 outline-none focus:outline-none focus-visible:outline-none",
                          authMode === 'register'
                            ? isLight ? 'text-white' : 'text-zinc-950'
                            : isLight ? 'text-[var(--text-3)] hover:text-[var(--text-1)]' : 'text-white/40 hover:text-white/60'
                        )}
                      >
                        Регистрация
                        {authMode === 'register' && (
                          <motion.div 
                            layoutId="auth-switch-bg"
                            className={cn(
                              "absolute inset-0 rounded-lg -z-10",
                              isLight
                                ? "bg-[#173149] shadow-[0_12px_22px_rgba(23,49,73,0.18),0_0_0_1px_rgba(45,156,219,0.18)]"
                                : "bg-white shadow-[0_10px_20px_rgba(255,255,255,0.2)]"
                            )}
                          />
                        )}
                      </button>
                    </div>

                    <div className="mb-6">
                      <h2 className={cn(
                        "text-3xl font-bold tracking-tighter mb-1 italic leading-none [@media(max-height:940px)]:lg:text-[2.35rem] [@media(max-height:860px)]:lg:text-[2rem]",
                        isLight ? "text-[var(--text-1)]" : "text-white"
                      )}>
                        {authMode === 'login' ? 'С возвращением' : 'Присоединяйтесь'}
                      </h2>
                      <p className={cn(
                        "text-xs font-medium leading-relaxed max-w-[220px] [@media(max-height:940px)]:lg:text-[11px] [@media(max-height:860px)]:lg:max-w-[12rem] [@media(max-height:860px)]:lg:text-[10px]",
                        isLight ? "text-[var(--text-2)]" : "text-white/30"
                      )}>
                        {authMode === 'login' ? 'Ваш зашифрованный доступ к свободному интернету.' : 'Безопасный и анонимный серфинг в один клик.'}
                      </p>
                    </div>

                    <form className="space-y-4 [@media(max-height:940px)]:lg:space-y-3.5 [@media(max-height:860px)]:lg:space-y-3" onSubmit={(e) => e.preventDefault()}>
                      <div className="space-y-1.5 group/input">
                        <label className={cn(
                          isLight
                            ? "ml-2 text-[8px] uppercase tracking-[0.3em] font-black group-focus-within/input:text-[var(--accent-text)] transition-colors"
                            : "ml-2 text-[8px] uppercase tracking-[0.3em] font-black group-focus-within/input:text-emerald-500/50 transition-colors",
                          isLight ? "text-[var(--text-3)]" : "text-white/20"
                        )}>Электронная почта</label>
                        <div className="relative">
                          <input 
                            type="email" 
                            placeholder="vlad@example.com"
                            className={cn(
                              "w-full rounded-xl border px-4 py-3.5 text-xs font-medium transition-all focus:outline-none [@media(max-height:940px)]:lg:py-3 [@media(max-height:860px)]:lg:py-2.5",
                              isLight
                                ? "border-[var(--border-default)] bg-[rgba(227,236,244,0.82)] text-[var(--text-1)] placeholder:text-[var(--text-3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] focus:border-[var(--accent-ui)] focus:bg-[rgba(241,246,250,0.92)]"
                                : "border-white/10 bg-white/[0.03] text-white placeholder:text-white/10 focus:border-emerald-500/50 focus:bg-emerald-500/[0.02]"
                            )}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 group/input">
                        <label className={cn(
                          isLight
                            ? "ml-2 text-[8px] uppercase tracking-[0.3em] font-black group-focus-within/input:text-[var(--accent-text)] transition-colors"
                            : "ml-2 text-[8px] uppercase tracking-[0.3em] font-black group-focus-within/input:text-emerald-500/50 transition-colors",
                          isLight ? "text-[var(--text-3)]" : "text-white/20"
                        )}>Пароль доступа</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            className={cn(
                              "w-full rounded-xl border px-4 py-3.5 text-xs font-medium transition-all focus:outline-none [@media(max-height:940px)]:lg:py-3 [@media(max-height:860px)]:lg:py-2.5",
                              isLight
                                ? "border-[var(--border-default)] bg-[rgba(227,236,244,0.82)] text-[var(--text-1)] placeholder:text-[var(--text-3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] focus:border-[var(--accent-ui)] focus:bg-[rgba(241,246,250,0.92)]"
                                : "border-white/10 bg-white/[0.03] text-white placeholder:text-white/10 focus:border-emerald-500/50 focus:bg-emerald-500/[0.02]"
                            )}
                          />
                        </div>
                      </div>
                      
                      <button className={cn(
                        "w-full font-black text-[11px] uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-3 group mt-4 relative overflow-hidden active:scale-95 [@media(max-height:940px)]:lg:py-3.5 [@media(max-height:860px)]:lg:mt-3 [@media(max-height:860px)]:lg:py-3",
                        isLight
                          ? "bg-[#173149] text-[#f6fbff] shadow-[0_22px_40px_rgba(23,49,73,0.22),0_0_0_1px_rgba(45,156,219,0.14)]"
                          : "bg-white text-zinc-950 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                      )}>
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-zinc-950/5 to-transparent skew-x-12" />
                        
                        <span>{authMode === 'login' ? 'Авторизация' : 'Создать аккаунт'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </form>

                    <div className="relative my-6 px-4 [@media(max-height:940px)]:lg:my-5 [@media(max-height:860px)]:lg:my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className={cn(
                          "w-full border-t",
                          isLight ? "border-[var(--border-default)]" : "border-white/[0.06]"
                        )}></div>
                      </div>
                      <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em] font-bold">
                        <span className={cn(
                          "px-4",
                          isLight ? "bg-transparent text-[var(--text-3)]" : "bg-[#0b0b0b]/0 text-white/20"
                        )}>Или через</span>
                      </div>
                    </div>

                    <div className="relative h-12 sm:h-[56px] [@media(max-height:860px)]:lg:h-[50px]">
                      <AnimatePresence mode="wait">
                        {hoveredFeature !== null ? (
                          <motion.div
                            key="tooltip"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              "absolute inset-0 w-full rounded-xl p-3 sm:p-4 flex items-center justify-center text-center border",
                              isLight ? "bg-[var(--surface-4)] border-[var(--border-default)]" : "bg-white/[0.03] border-white/10"
                            )}
                          >
                            <p className={cn(
                              "text-[9px] sm:text-[10px] leading-relaxed font-medium tracking-tight",
                              isLight ? "text-[var(--text-2)]" : "text-white/50"
                            )}>
                              {FEATURE_INFO[hoveredFeature]}
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="buttons"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-2 gap-3 h-full"
                          >
                            <button 
                              onClick={handleGoogleLogin}
                              disabled={loading}
                              className={cn(
                                "flex items-center justify-center gap-2 h-full rounded-xl transition-all group disabled:opacity-50 border",
                                isLight
                                  ? "bg-[rgba(228,237,244,0.8)] hover:bg-[rgba(241,246,250,0.96)] border-[var(--border-default)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                                  : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10"
                              )}
                            >
                              <svg className={cn(
                                "w-4 h-4 transition-colors",
                                isLight ? "text-[var(--text-3)] group-hover:text-[var(--text-1)]" : "text-white/60 group-hover:text-white"
                              )} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest transition-colors",
                                isLight ? "text-[var(--text-2)] group-hover:text-[var(--text-1)]" : "text-white/40 group-hover:text-white/80"
                              )}>{loading ? '...' : 'Google'}</span>
                            </button>
                            <button 
                              onClick={handleTelegramLogin}
                              className={cn(
                                "flex items-center justify-center gap-2 h-full rounded-xl transition-all group border",
                                isLight
                                  ? "bg-[rgba(228,237,244,0.8)] hover:bg-[rgba(241,246,250,0.96)] border-[var(--border-default)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                                  : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10"
                              )}
                            >
                              <svg className={cn(
                                "w-4 h-4 transition-colors",
                                isLight ? "text-[var(--text-3)] group-hover:text-[#24A1DE]" : "text-white/60 group-hover:text-[#24A1DE]"
                              )} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.24.37-.49 1.02-.73 4-1.74 6.67-2.88 8-3.43 3.8-1.57 4.59-1.84 5.1-.14.11.27.1.55.07.82z" />
                              </svg>
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest transition-colors",
                                isLight ? "text-[var(--text-2)] group-hover:text-[var(--text-1)]" : "text-white/40 group-hover:text-white/80"
                              )}>Telegram</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Unique Features List - Bottom Fixed */}
              <div className="mt-auto pt-4 relative [@media(max-height:940px)]:lg:pt-4 [@media(max-height:860px)]:lg:pt-3">
                <div className="space-y-3 [@media(max-height:860px)]:lg:space-y-2.5">
                  {[
                    { icon: InfinityIcon, text: 'Безлимитный квантовый трафик', color: isLight ? 'text-[var(--accent-text)]' : 'text-emerald-400/80', glow: isLight ? 'shadow-none' : 'shadow-[0_0_15px_rgba(52,211,153,0.1)]' },
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
                      className={cn(
                        "flex items-center gap-4 text-xs font-semibold group/feat cursor-help [@media(max-height:860px)]:lg:gap-3",
                        isLight ? "text-[var(--text-3)]" : "text-white/30"
                      )}
                    >
                      <item.icon 
                        className={`w-4 h-4 [@media(max-height:860px)]:lg:w-3.5 [@media(max-height:860px)]:lg:h-3.5 ${item.color} group-hover/feat:opacity-100 transition-all group-hover/feat:scale-110 ${hoveredFeature === i ? item.glow : ''}`} 
                        strokeWidth={1.2} 
                      />
                      <span className={cn(
                        "transition-all uppercase tracking-[0.2em] text-[8px] font-bold [@media(max-height:860px)]:lg:text-[7px]",
                        hoveredFeature === i
                          ? isLight ? "text-[var(--text-1)] translate-x-1" : "text-white/80 translate-x-1"
                          : isLight ? "group-hover/feat:text-[var(--text-1)]" : "group-hover/feat:text-white/60"
                      )}>
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none hidden w-full items-center justify-center lg:flex [@media(max-height:720px)]:hidden">
          <div className="relative flex max-w-[34rem] flex-col items-center gap-1 px-6 [@media(max-height:940px)]:max-w-[30rem] [@media(max-height:940px)]:gap-0.5">
            {isLight ? (
              <div className="pointer-events-none absolute inset-x-0 -top-5 -bottom-5 rounded-[2.4rem] bg-[radial-gradient(circle_at_center,rgba(248,252,255,0.72)_0%,rgba(239,246,251,0.38)_48%,rgba(255,255,255,0)_100%)] blur-2xl" />
            ) : null}
            {/* Status Line */}
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center gap-2 opacity-55",
                isLight && "opacity-75"
              )}
            >
              <div className={cn(
                "w-1 h-1 rounded-full",
                isLight ? "bg-[var(--accent-ui)] shadow-[0_0_6px_rgba(45,156,219,0.24)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              )} />
              <span className={cn(
                "text-[8px] uppercase font-black tracking-[0.28em] [@media(max-height:940px)]:lg:text-[7px]",
                isLight ? "text-[var(--text-2)]" : "text-white"
              )}>
                Активен: {selectedServer.country}
              </span>
            </motion.div>

            {/* Typewriter Text */}
            <div className="flex min-h-[20px] items-center justify-center [@media(max-height:940px)]:min-h-[18px]">
              <motion.p 
                key={selectedServer.id}
                className={cn(
                  "text-[0.95rem] font-bold leading-tight tracking-tight text-center md:text-[1.05rem] [@media(max-height:940px)]:lg:text-[0.88rem]",
                  isLight ? "text-[var(--text-1)]" : "text-white drop-shadow-lg"
                )}
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
              className="relative w-full max-w-5xl h-[70vh] md:h-[60vh] bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-[0_32px_128px_rgba(0,0,0,0.8)]"
            >
              {/* Animated Accent Background */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={ADVANTAGES_SLIDES[currentSlide].id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 opacity-20 pointer-events-none ${
                    ADVANTAGES_SLIDES[currentSlide].accent === 'emerald' ? 'from-emerald-600/40' :
                    ADVANTAGES_SLIDES[currentSlide].accent === 'blue' ? 'from-blue-600/40' :
                    ADVANTAGES_SLIDES[currentSlide].accent === 'rose' ? 'from-rose-600/40' : 'from-purple-600/40'
                  } to-transparent`}
                />
              </AnimatePresence>

              {/* Progress Bars (Top) */}
              <div className="absolute top-0 left-0 right-0 p-8 z-20 flex gap-2">
                {ADVANTAGES_SLIDES.map((_, i) => (
                  <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    {i === currentSlide ? (
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 6, ease: "linear" }}
                        className={`h-full origin-left ${
                          ADVANTAGES_SLIDES[i].accent === 'emerald' ? 'bg-emerald-500' :
                          ADVANTAGES_SLIDES[i].accent === 'blue' ? 'bg-blue-500' :
                          ADVANTAGES_SLIDES[i].accent === 'rose' ? 'bg-rose-500' : 'bg-purple-500'
                        }`}
                      />
                    ) : i < currentSlide ? (
                      <div className={`h-full rounded-full opacity-50 ${
                        ADVANTAGES_SLIDES[i].accent === 'emerald' ? 'bg-emerald-500' :
                        ADVANTAGES_SLIDES[i].accent === 'blue' ? 'bg-blue-500' :
                        ADVANTAGES_SLIDES[i].accent === 'rose' ? 'bg-rose-500' : 'bg-purple-500'
                      }`} />
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <div className="absolute top-12 right-8 z-30">
                <button 
                  onClick={() => setShowAdvantages(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Slide Content */}
              <div className="flex-1 relative flex items-center px-8 md:px-20 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={ADVANTAGES_SLIDES[currentSlide].id}
                    initial={{ x: 50, opacity: 0, filter: 'blur(10px)' }}
                    animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ x: -50, opacity: 0, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="grid md:grid-cols-[1fr_auto] gap-12 items-center w-full"
                  >
                    {/* Text Side */}
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${
                          ADVANTAGES_SLIDES[currentSlide].accent === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          ADVANTAGES_SLIDES[currentSlide].accent === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                          ADVANTAGES_SLIDES[currentSlide].accent === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                        }`}>
                          {ADVANTAGES_SLIDES[currentSlide].stat}
                        </div>
                        <span className="text-[10px] font-bold text-white/30 tracking-[0.4em] uppercase">Tech Showcase</span>
                      </motion.div>

                      <motion.h3 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-6xl font-black italic tracking-tighter text-white leading-[0.9] uppercase"
                      >
                        {ADVANTAGES_SLIDES[currentSlide].title}
                      </motion.h3>

                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/40 text-sm md:text-lg max-w-xl font-medium leading-relaxed"
                      >
                        {ADVANTAGES_SLIDES[currentSlide].description}
                      </motion.p>
                    </div>

                    {/* Visual/Icon Side */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                      className="hidden md:flex items-center justify-center p-12 relative"
                    >
                      {/* Floating Decorative Rings */}
                      <div className={`absolute inset-0 rounded-full border border-dashed transition-colors duration-1000 animate-[spin_20s_linear_infinite] ${
                        ADVANTAGES_SLIDES[currentSlide].accent === 'emerald' ? 'border-emerald-500/20' :
                        ADVANTAGES_SLIDES[currentSlide].accent === 'blue' ? 'border-blue-500/20' :
                        ADVANTAGES_SLIDES[currentSlide].accent === 'rose' ? 'border-rose-500/20' : 'border-purple-500/20'
                      }`} />
                      
                      <div className={`w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] bg-gradient-to-br flex items-center justify-center shadow-2xl relative z-10 ${
                         ADVANTAGES_SLIDES[currentSlide].accent === 'emerald' ? 'from-emerald-500/10 to-emerald-950/30 border border-emerald-500/30' :
                         ADVANTAGES_SLIDES[currentSlide].accent === 'blue' ? 'from-blue-500/10 to-blue-950/30 border border-blue-500/30' :
                         ADVANTAGES_SLIDES[currentSlide].accent === 'rose' ? 'from-rose-500/10 to-rose-950/30 border border-rose-500/30' : 'from-purple-500/10 to-purple-950/30 border border-purple-500/30'
                      }`}>
                         {/* Dynamic Render Component */}
                         {(() => {
                            const ActiveComponent = ADVANTAGES_SLIDES[currentSlide].component;
                            return <ActiveComponent />;
                         })()}
                         
                         {/* Inner Glow */}
                         <div className={`absolute inset-0 blur-[60px] opacity-20 pointer-events-none rounded-[2.5rem] ${
                            ADVANTAGES_SLIDES[currentSlide].accent === 'emerald' ? 'bg-emerald-500' :
                            ADVANTAGES_SLIDES[currentSlide].accent === 'blue' ? 'bg-blue-500' :
                            ADVANTAGES_SLIDES[currentSlide].accent === 'rose' ? 'bg-rose-500' : 'bg-purple-500'
                         }`} />
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Manual Control Dots */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-30">
                {ADVANTAGES_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
