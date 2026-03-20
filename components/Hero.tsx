'use client';

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Eye, EyeOff, Mail, Moon, RefreshCw, Sun, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Globe from './Globe';
import { Logo } from './Logo';
import { resolveFlagMeta } from '@/lib/flags';
import { cn } from '@/lib/utils';

/* ───────────── types ───────────── */

type ThemeName = 'dark' | 'milky';
type AccentName = 'emerald' | 'orange' | 'blue' | 'pink';

interface ServerData {
  id: string;
  country: string;
  city: string;
  coords: [number, number];
  basePing: number;
  flagCode: string;
  description: string;
}

/* ───────────── storage keys ───────────── */

const STORAGE_THEME_KEY = 'wwpro-theme';
const STORAGE_ACCENT_KEY = 'wwpro-accent';

/* ───────────── design tokens (aligned with ASIC) ───────────── */

const ACCENTS = {
  emerald: {
    color: 'bg-emerald-500',
    text: 'text-emerald-500',
    textLight: 'text-emerald-400',
    bgSoft: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    button: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    blur1: 'bg-emerald-500/20',
    glowCard: 'to-emerald-500/10',
    rgb: '110, 231, 183',
    cssDark: {
      border: 'rgba(110, 231, 183, 0.24)',
      ui: '#6ee7b7',
      uiStrong: '#34d399',
      uiSoft: 'rgba(110, 231, 183, 0.24)',
      glow: 'rgba(110, 231, 183, 0.34)',
      text: '#6ee7b7',
    },
    cssLight: {
      border: 'rgba(16, 185, 129, 0.22)',
      ui: '#10b981',
      uiStrong: '#047857',
      uiSoft: 'rgba(16, 185, 129, 0.14)',
      glow: 'rgba(16, 185, 129, 0.2)',
      text: '#047857',
    },
  },
  orange: {
    color: 'bg-orange-500',
    text: 'text-orange-500',
    textLight: 'text-orange-400',
    bgSoft: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    button: 'bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    blur1: 'bg-orange-500/20',
    glowCard: 'to-orange-500/10',
    rgb: '251, 146, 60',
    cssDark: {
      border: 'rgba(251, 146, 60, 0.22)',
      ui: '#fb923c',
      uiStrong: '#f97316',
      uiSoft: 'rgba(251, 146, 60, 0.22)',
      glow: 'rgba(251, 146, 60, 0.3)',
      text: '#fdba74',
    },
    cssLight: {
      border: 'rgba(249, 115, 22, 0.22)',
      ui: '#f97316',
      uiStrong: '#c2410c',
      uiSoft: 'rgba(249, 115, 22, 0.14)',
      glow: 'rgba(249, 115, 22, 0.2)',
      text: '#c2410c',
    },
  },
  blue: {
    color: 'bg-blue-500',
    text: 'text-blue-500',
    textLight: 'text-blue-400',
    bgSoft: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    button: 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    blur1: 'bg-blue-500/20',
    glowCard: 'to-blue-500/10',
    rgb: '59, 130, 246',
    cssDark: {
      border: 'rgba(59, 130, 246, 0.24)',
      ui: '#60a5fa',
      uiStrong: '#3b82f6',
      uiSoft: 'rgba(59, 130, 246, 0.22)',
      glow: 'rgba(59, 130, 246, 0.3)',
      text: '#93c5fd',
    },
    cssLight: {
      border: 'rgba(45, 156, 219, 0.28)',
      ui: '#2d9cdb',
      uiStrong: '#1b6c99',
      uiSoft: 'rgba(45, 156, 219, 0.18)',
      glow: 'rgba(45, 156, 219, 0.24)',
      text: '#164c6f',
    },
  },
  pink: {
    color: 'bg-pink-500',
    text: 'text-pink-500',
    textLight: 'text-pink-400',
    bgSoft: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    button: 'bg-pink-500 hover:bg-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]',
    blur1: 'bg-pink-500/20',
    glowCard: 'to-pink-500/10',
    rgb: '236, 72, 153',
    cssDark: {
      border: 'rgba(236, 72, 153, 0.22)',
      ui: '#f472b6',
      uiStrong: '#ec4899',
      uiSoft: 'rgba(236, 72, 153, 0.2)',
      glow: 'rgba(236, 72, 153, 0.28)',
      text: '#f9a8d4',
    },
    cssLight: {
      border: 'rgba(236, 72, 153, 0.22)',
      ui: '#ec4899',
      uiStrong: '#be185d',
      uiSoft: 'rgba(236, 72, 153, 0.14)',
      glow: 'rgba(236, 72, 153, 0.18)',
      text: '#be185d',
    },
  },
} as const;

const THEMES = {
  dark: {
    bg: 'bg-[#050505]',
    textStrong: 'text-white',
    text: 'text-zinc-200',
    textMuted: 'text-zinc-400',
    textSubtle: 'text-zinc-500',
    border: 'border-white/[0.06]',
    borderHover: 'hover:border-white/[0.12]',
    card: 'bg-white/[0.02]',
    cardHover: 'hover:bg-white/[0.04]',
    cardSolid: 'bg-[#0a0a0a]',
    input: 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 focus:border-white/[0.16]',
    veil: 'from-[#050505]/90 via-[#050505]/50 to-transparent',
    divider: 'bg-white/[0.06]',
  },
  milky: {
    bg: 'bg-[#faf8f5]',
    textStrong: 'text-zinc-950',
    text: 'text-zinc-700',
    textMuted: 'text-zinc-600',
    textSubtle: 'text-zinc-500',
    border: 'border-zinc-200',
    borderHover: 'hover:border-zinc-300',
    card: 'bg-white/90',
    cardHover: 'hover:bg-white',
    cardSolid: 'bg-white',
    input: 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 shadow-sm',
    veil: 'from-[#faf8f5]/30 via-[#faf8f5]/10 to-transparent',
    divider: 'bg-zinc-200',
  },
} as const;

/* ───────────── servers ───────────── */

const SERVERS: ServerData[] = [
  {
    id: 'de',
    country: 'Германия',
    city: 'Франкфурт',
    coords: [50.1109, 8.6821],
    basePing: 35,
    flagCode: 'de',
    description: 'Самый оптимальный маршрут. Минимальная задержка, максимальная стабильность и качество трафика. Идеален для работы, звонков и повседневного использования.',
  },
  {
    id: 'am',
    country: 'Армения',
    city: 'Ереван',
    coords: [40.1772, 44.5035],
    basePing: 55,
    flagCode: 'am',
    description: 'Сбалансированный маршрут с полным отсутствием рекламы в YouTube. Пинг чуть выше, но качество соединения стабильно высокое.',
  },
  {
    id: 'fi',
    country: 'Финляндия',
    city: 'Хельсинки',
    coords: [60.1699, 24.9384],
    basePing: 42,
    flagCode: 'fi',
    description: 'Быстрый северный маршрут без рекламы в YouTube. Отличный вариант для повседневного серфинга, стриминга и комфортной работы.',
  },
  {
    id: 'us',
    country: 'США',
    city: 'Нью-Йорк',
    coords: [40.7128, -74.006],
    basePing: 110,
    flagCode: 'us',
    description: 'Для регистрации в глобальных сервисах и доступа к зарубежным платформам. Полноценный выход в американский интернет.',
  },
];

const getPingVariation = () => Math.floor(Math.random() * 10) - 5;
const getPingProbeDelay = () => 700 + Math.random() * 1000;

/* ───────────── Hero ───────────── */

export default function Hero() {
  const navigate = useNavigate();
  const pingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pingKickoffFrameRef = useRef<number | null>(null);

  const [theme, setTheme] = useState<ThemeName>('dark');
  const [accent, setAccent] = useState<AccentName>('emerald');
  const [isReady, setIsReady] = useState(false);
  const [selectedServer, setSelectedServer] = useState<ServerData>(SERVERS[0]);
  const [pings, setPings] = useState<Record<string, number | 'testing'>>({});
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [globeFocusToken, setGlobeFocusToken] = useState(0);

  /* form fields */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [formError, setFormError] = useState('');

  const t = THEMES[theme];
  const a = ACCENTS[accent];
  const globeTheme = theme === 'milky' ? 'light' : 'dark';

  const selectedServerInfo = useMemo(
    () => ({
      city: selectedServer.city,
      country: selectedServer.country,
      flagCode: selectedServer.flagCode,
    }),
    [selectedServer.city, selectedServer.country, selectedServer.flagCode],
  );

  const selectedPing = pings[selectedServer.id];
  const isAnyPingTesting = useMemo(
    () => Object.values(pings).some((v) => v === 'testing'),
    [pings],
  );
  const selectedServerFlagClassName = useMemo(
    () =>
      resolveFlagMeta({
        code: selectedServer.flagCode,
        countryName: selectedServer.country,
      }).className,
    [selectedServer.country, selectedServer.flagCode],
  );

  /* ── lifecycle ── */

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedTheme = window.localStorage.getItem(STORAGE_THEME_KEY);
      const savedAccent = window.localStorage.getItem(STORAGE_ACCENT_KEY);
      if (savedTheme === 'dark') setTheme('dark');
      if (savedTheme === 'light') setTheme('milky');
      if (savedAccent === 'emerald' || savedAccent === 'orange' || savedAccent === 'blue' || savedAccent === 'pink') {
        setAccent(savedAccent);
      }
      setIsReady(true);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = globeTheme;
    const vars = globeTheme === 'dark' ? a.cssDark : a.cssLight;
    document.documentElement.style.setProperty('--accent-border', vars.border);
    document.documentElement.style.setProperty('--accent-ui', vars.ui);
    document.documentElement.style.setProperty('--accent-ui-strong', vars.uiStrong);
    document.documentElement.style.setProperty('--accent-ui-soft', vars.uiSoft);
    document.documentElement.style.setProperty('--accent-glow', vars.glow);
    document.documentElement.style.setProperty('--accent-text', vars.text);
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_THEME_KEY, globeTheme);
    window.localStorage.setItem(STORAGE_ACCENT_KEY, accent);
  }, [a, accent, globeTheme, isReady]);

  useEffect(() => {
    SERVERS.forEach((server) => {
      setPings((c) => ({ ...c, [server.id]: 'testing' }));
      pingTimeoutsRef.current[server.id] = setTimeout(() => {
        setPings((c) => ({ ...c, [server.id]: server.basePing + getPingVariation() }));
        delete pingTimeoutsRef.current[server.id];
      }, getPingProbeDelay());
    });
    return () => {
      if (pingKickoffFrameRef.current !== null) {
        window.cancelAnimationFrame(pingKickoffFrameRef.current);
        pingKickoffFrameRef.current = null;
      }
      Object.values(pingTimeoutsRef.current).forEach(clearTimeout);
      pingTimeoutsRef.current = {};
    };
  }, []);

  /* ── actions ── */

  const focusServer = (server: ServerData) => {
    setSelectedServer(server);
    setGlobeFocusToken((c) => c + 1);
  };

  const simulatePing = (serverId: string) => {
    const existing = pingTimeoutsRef.current[serverId];
    if (existing) clearTimeout(existing);
    setPings((c) => ({ ...c, [serverId]: 'testing' }));
    pingTimeoutsRef.current[serverId] = setTimeout(() => {
      const basePing = SERVERS.find((s) => s.id === serverId)?.basePing ?? 60;
      setPings((c) => ({ ...c, [serverId]: basePing + getPingVariation() }));
      delete pingTimeoutsRef.current[serverId];
    }, getPingProbeDelay());
  };

  const handleServerSelect = (server: ServerData) => {
    focusServer(server);
    if (pingKickoffFrameRef.current !== null) window.cancelAnimationFrame(pingKickoffFrameRef.current);
    pingKickoffFrameRef.current = window.requestAnimationFrame(() => {
      pingKickoffFrameRef.current = null;
      simulatePing(server.id);
    });
  };

  const handleCredentialsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (authMode === 'register') {
      if (regStep === 1) {
        if (password.length < 8) {
          setFormError('Пароль должен быть не менее 8 символов');
          return;
        }
        if (password !== confirmPassword) {
          setFormError('Пароли не совпадают');
          return;
        }
        if (!termsAccepted) {
          setFormError('Необходимо принять условия');
          return;
        }
        setLoading(true);
        await new Promise((r) => setTimeout(r, 800));
        setLoading(false);
        setRegStep(2);
        return;
      }
      if (regStep === 2) {
        if (verifyCode.length !== 6) {
          setFormError('Введите 6-значный код');
          return;
        }
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1000));
        setLoading(false);
        setRegStep(3);
        setTimeout(() => navigate('/dashboard'), 1500);
        return;
      }
    }

    /* login */
    if (!email || !password) {
      setFormError('Заполните все поля');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    navigate('/dashboard');
  };

  const switchAuthMode = useCallback((mode: 'register' | 'login') => {
    setAuthMode(mode);
    setRegStep(1);
    setFormError('');
    setVerifyCode('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const passwordStrength = useMemo(() => {
    if (password.length === 0) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: 'Слабый', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Средний', color: 'bg-yellow-500' };
    if (score <= 3) return { level: 3, label: 'Хороший', color: 'bg-emerald-400' };
    return { level: 4, label: 'Надёжный', color: 'bg-emerald-500' };
  }, [password]);

  const refreshAllPings = () => SERVERS.forEach((s) => simulatePing(s.id));

  const pingColor = (ping: number | 'testing' | undefined) => {
    if (typeof ping !== 'number') return t.textSubtle;
    if (theme === 'milky') {
      if (ping < 50) return 'text-emerald-700';
      if (ping < 100) return 'text-amber-700';
      return 'text-rose-700';
    }
    if (ping < 50) return 'text-emerald-300';
    if (ping < 100) return 'text-amber-300';
    return 'text-rose-300';
  };

  const pingValueClassName = 'font-mono text-sm font-semibold tabular-nums tracking-tight';

  /* ═══════════════ render ═══════════════ */

  return (
    <div className={cn('relative min-h-[100svh] font-sans transition-colors duration-500 lg:h-[100svh] lg:overflow-hidden', t.bg, t.text)}>
      <Globe
        selectedCountryId={selectedServer.id}
        selectedLocation={selectedServer.coords}
        serverInfo={selectedServerInfo}
        theme={globeTheme}
        focusToken={globeFocusToken}
        accentRgb={a.rgb}
      />

      {/* background ambient — subtle accent glow, dark theme only */}
      {theme === 'dark' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={cn(
              'absolute -left-[400px] -top-[400px] h-[800px] w-[800px] rounded-full opacity-20 blur-[180px] transition-colors duration-1000',
              a.blur1,
            )}
          />
        </div>
      )}

      {/* ── content layer ── */}
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1520px] flex-col px-4 py-4 md:px-8 md:py-6 lg:h-[100svh] lg:min-h-0">

        {/* ── header ── */}
        <header className="pointer-events-auto mb-4 flex shrink-0 items-center justify-between gap-4">
          <Logo theme={theme} accent={accent} className="h-9 w-auto md:h-10" />

          <div className="flex items-center gap-3">
            <div className={cn('flex items-center gap-1.5 rounded-full border p-1.5 transition-colors', t.border, t.cardSolid)}>
              {(Object.keys(ACCENTS) as AccentName[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAccent(key)}
                  className={cn(
                    'h-4 w-4 rounded-full transition-all duration-300',
                    ACCENTS[key].color,
                    accent === key
                      ? cn('scale-110 ring-2 ring-current ring-offset-2', theme === 'dark' ? 'ring-offset-[#0a0a0a]' : 'ring-offset-white')
                      : 'scale-90 opacity-60 hover:scale-100 hover:opacity-100',
                  )}
                  aria-label={`Акцент ${key}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setTheme((c) => (c === 'dark' ? 'milky' : 'dark'))}
              className={cn(
                'rounded-full border p-2 transition-colors',
                t.border,
                t.cardSolid,
                t.textMuted,
                theme === 'dark' ? 'hover:text-white' : 'hover:text-black',
              )}
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* ── main: two-column layout ── */}
        <main className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[380px_minmax(0,1fr)_320px] xl:gap-6">

          {/* ══════ LEFT — Auth (full height) ══════ */}
          <motion.section
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto flex min-h-0 flex-col"
          >
            <div
              className={cn(
                'flex flex-1 flex-col rounded-2xl border p-6 transition-colors',
                t.card,
                t.border,
              )}
            >
              {/* auth mode tabs */}
              <div className={cn('mb-5 flex gap-1 rounded-xl border p-1', t.border, t.cardSolid)}>
                {(['register', 'login'] as const).map((mode) => {
                  const active = authMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => switchAuthMode(mode)}
                      className={cn(
                        'relative flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300',
                        active ? t.textStrong : t.textMuted,
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="authTab"
                          className={cn('absolute inset-0 rounded-lg', t.card, a.bgSoft)}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10">{mode === 'register' ? 'Регистрация' : 'Вход'}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${authMode}-${regStep}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-1 flex-col"
                >
                  {/* ── REGISTER STEP 1 ── */}
                  {authMode === 'register' && regStep === 1 && (
                    <>
                      <h1 className={cn('mb-2 text-2xl font-medium tracking-tight', t.textStrong)}>Создайте аккаунт</h1>
                      <p className={cn('mb-5 text-sm leading-relaxed', t.textMuted)}>Один аккаунт — доступ ко всем серверам и устройствам.</p>

                      <form className="space-y-3" onSubmit={handleCredentialsSubmit}>
                        <div>
                          <label className={cn('mb-1.5 block text-[11px] font-medium uppercase tracking-wider', t.textSubtle)}>Почта</label>
                          <input
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
                            className={cn('w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors duration-200', t.input)}
                          />
                        </div>

                        <div>
                          <label className={cn('mb-1.5 block text-[11px] font-medium uppercase tracking-wider', t.textSubtle)}>Пароль</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              autoComplete="new-password"
                              placeholder="Минимум 8 символов"
                              value={password}
                              onChange={(e) => { setPassword(e.target.value); setFormError(''); }}
                              className={cn('w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none transition-colors duration-200', t.input)}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className={cn('absolute right-3 top-1/2 -translate-y-1/2', t.textSubtle)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {password.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex flex-1 gap-1">
                                {[1, 2, 3, 4].map((i) => (
                                  <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= passwordStrength.level ? passwordStrength.color : t.divider)} />
                                ))}
                              </div>
                              <span className={cn('text-[11px]', t.textSubtle)}>{passwordStrength.label}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className={cn('mb-1.5 block text-[11px] font-medium uppercase tracking-wider', t.textSubtle)}>Повторите пароль</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              autoComplete="new-password"
                              placeholder="Ещё раз"
                              value={confirmPassword}
                              onChange={(e) => { setConfirmPassword(e.target.value); setFormError(''); }}
                              className={cn(
                                'w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none transition-colors duration-200',
                                t.input,
                                confirmPassword.length > 0 && password !== confirmPassword && 'border-red-500/50',
                              )}
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={cn('absolute right-3 top-1/2 -translate-y-1/2', t.textSubtle)}>
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {confirmPassword.length > 0 && password === confirmPassword && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-[11px] text-emerald-500">Пароли совпадают</span>
                            </div>
                          )}
                        </div>

                        {formError && <p className="text-sm text-red-500">{formError}</p>}

                        <label className="flex cursor-pointer items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-current"
                          />
                          <span className={cn('text-xs leading-relaxed', t.textMuted)}>
                            Я принимаю{' '}
                            <Link to="/terms" className="underline underline-offset-2">Пользовательское соглашение</Link>,{' '}
                            <Link to="/privacy" className="underline underline-offset-2">Политику обработки ПД</Link>{' '}
                            и даю согласие на обработку персональных данных
                          </span>
                        </label>

                        <button
                          type="submit"
                          disabled={loading || !termsAccepted || !email || password.length < 8 || password !== confirmPassword}
                          className={cn('inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60', a.button)}
                        >
                          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                          Продолжить
                        </button>
                      </form>

                      <div className="my-4 flex items-center gap-3">
                        <div className={cn('h-px flex-1', t.divider)} />
                        <span className={cn('text-[11px] uppercase tracking-wider', t.textSubtle)}>или</span>
                        <div className={cn('h-px flex-1', t.divider)} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" className={cn('inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors', t.border, t.card, t.cardHover, t.textStrong)}>
                          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                          Google
                        </button>
                        <button type="button" className={cn('inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors', t.border, t.card, t.cardHover, t.textStrong)}>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                          Telegram
                        </button>
                      </div>
                    </>
                  )}

                  {/* ── REGISTER STEP 2: verify email ── */}
                  {authMode === 'register' && regStep === 2 && (
                    <>
                      <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-2xl', a.bgSoft)}>
                        <Mail className={cn('h-6 w-6', a.text)} />
                      </div>
                      <h1 className={cn('mb-2 text-2xl font-medium tracking-tight', t.textStrong)}>Проверьте почту</h1>
                      <p className={cn('mb-5 text-sm leading-relaxed', t.textMuted)}>
                        Мы отправили 6-значный код на <span className={cn('font-medium', t.textStrong)}>{email}</span>. Введите его ниже.
                      </p>

                      <form className="space-y-3" onSubmit={handleCredentialsSubmit}>
                        <div>
                          <label className={cn('mb-1.5 block text-[11px] font-medium uppercase tracking-wider', t.textSubtle)}>Код подтверждения</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            required
                            autoFocus
                            placeholder="000000"
                            value={verifyCode}
                            onChange={(e) => { setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setFormError(''); }}
                            className={cn('w-full rounded-xl border px-4 py-2.5 text-center font-mono text-lg tracking-[0.3em] outline-none transition-colors duration-200', t.input)}
                          />
                        </div>

                        {formError && <p className="text-sm text-red-500">{formError}</p>}

                        <button
                          type="submit"
                          disabled={loading || verifyCode.length !== 6}
                          className={cn('inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60', a.button)}
                        >
                          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                          Подтвердить
                        </button>
                      </form>

                      <div className="mt-4 flex items-center justify-between">
                        <button type="button" onClick={() => setRegStep(1)} className={cn('text-sm transition-colors hover:underline', t.textMuted)}>← Назад</button>
                        <button type="button" className={cn('text-sm transition-colors hover:underline', a.text)}>Отправить повторно</button>
                      </div>
                    </>
                  )}

                  {/* ── REGISTER STEP 3: success ── */}
                  {authMode === 'register' && regStep === 3 && (
                    <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                      <div className={cn('mb-4 flex h-14 w-14 items-center justify-center rounded-full', a.bgSoft)}>
                        <Check className={cn('h-7 w-7', a.text)} />
                      </div>
                      <h1 className={cn('mb-2 text-2xl font-medium tracking-tight', t.textStrong)}>Аккаунт создан</h1>
                      <p className={cn('text-sm', t.textMuted)}>Перенаправляем в личный кабинет...</p>
                    </div>
                  )}

                  {/* ── LOGIN ── */}
                  {authMode === 'login' && (
                    <>
                      <h1 className={cn('mb-2 text-2xl font-medium tracking-tight', t.textStrong)}>С возвращением</h1>
                      <p className={cn('mb-5 text-sm leading-relaxed', t.textMuted)}>Войдите, чтобы перейти к маршрутам и настройкам.</p>

                      <form className="space-y-3" onSubmit={handleCredentialsSubmit}>
                        <div>
                          <label className={cn('mb-1.5 block text-[11px] font-medium uppercase tracking-wider', t.textSubtle)}>Почта</label>
                          <input
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
                            className={cn('w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors duration-200', t.input)}
                          />
                        </div>

                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <label className={cn('text-[11px] font-medium uppercase tracking-wider', t.textSubtle)}>Пароль</label>
                            <button type="button" className={cn('text-[11px] transition-colors hover:underline', a.text)}>Забыли пароль?</button>
                          </div>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              autoComplete="current-password"
                              placeholder="Введите пароль"
                              value={password}
                              onChange={(e) => { setPassword(e.target.value); setFormError(''); }}
                              className={cn('w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none transition-colors duration-200', t.input)}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className={cn('absolute right-3 top-1/2 -translate-y-1/2', t.textSubtle)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {formError && <p className="text-sm text-red-500">{formError}</p>}

                        <button
                          type="submit"
                          disabled={loading || !email || !password}
                          className={cn('inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60', a.button)}
                        >
                          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                          Войти
                        </button>
                      </form>

                      <div className="my-4 flex items-center gap-3">
                        <div className={cn('h-px flex-1', t.divider)} />
                        <span className={cn('text-[11px] uppercase tracking-wider', t.textSubtle)}>или</span>
                        <div className={cn('h-px flex-1', t.divider)} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" className={cn('inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors', t.border, t.card, t.cardHover, t.textStrong)}>
                          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                          Google
                        </button>
                        <button type="button" className={cn('inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors', t.border, t.card, t.cardHover, t.textStrong)}>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                          Telegram
                        </button>
                      </div>
                    </>
                  )}

                  <div className="flex-1" />

                  {/* footer text */}
                  <p className={cn('mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px]', t.textSubtle)}>
                    <span>© 2026 WW.pro</span>
                    <Link to="/terms" className="hover:underline">Условия</Link>
                    <Link to="/privacy" className="hover:underline">Конфиденциальность</Link>
                    <Link to="/refund" className="hover:underline">Возврат</Link>
                    <Link to="/cookies" className="hover:underline">Cookies</Link>
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>

          {/* ══════ CENTER — globe space ══════ */}
          <section className="relative hidden min-h-0 lg:block" aria-hidden="true" />

          {/* ══════ RIGHT — Active route + server list ══════ */}
          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="pointer-events-auto flex min-h-0 flex-col gap-4 lg:col-span-1"
          >
            {/* ── active server card (minimal) ── */}
            <div className={cn('h-[15rem] shrink-0 rounded-2xl border p-5 transition-colors', t.border, t.cardSolid)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={cn('mb-1 flex items-center text-xs font-medium', a.text)}>
                    <span>Активный маршрут</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={selectedServer.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className={cn('text-2xl font-light tracking-tight', t.textStrong)}
                    >
                      {selectedServer.city}
                    </motion.h2>
                  </AnimatePresence>
                  <div className={cn('mt-1 flex items-center gap-2 text-sm', t.textMuted)}>
                    {selectedServerFlagClassName && (
                      <span className={cn('server-flag-icon rounded-[3px]', selectedServerFlagClassName)} aria-hidden="true" />
                    )}
                    <span>{selectedServer.country}</span>
                    <span className={t.textSubtle}>·</span>
                    <span className={cn(pingValueClassName, pingColor(selectedPing))}>
                      {typeof selectedPing === 'number' ? `${selectedPing} ms` : '...'}
                    </span>
                  </div>
                </div>
                <div className={cn('rounded-lg border px-2.5 py-1 text-center', t.border, t.card)}>
                  <div className={cn('text-[10px] uppercase tracking-wider', t.textSubtle)}>Канал</div>
                  <div className={cn('text-sm font-medium', t.textStrong)}>10 Gbps</div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={selectedServer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className={cn('mt-3 min-h-[6rem] text-sm leading-relaxed', t.textMuted)}
                >
                  {selectedServer.description}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* ── server list ── */}
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col rounded-2xl border p-4 transition-colors',
                t.card,
                t.border,
              )}
            >
              <div className="mb-3 flex shrink-0 items-center justify-between">
                <h2 className={cn('text-sm font-medium', t.textStrong)}>Доступные серверы</h2>
                <button
                  type="button"
                  onClick={refreshAllPings}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] transition-colors',
                    t.border,
                    t.textMuted,
                    t.cardHover,
                  )}
                  aria-label="Обновить пинги"
                >
                  <RefreshCw className={cn('h-3 w-3', isAnyPingTesting && 'animate-spin')} />
                  <span>Проверить пинг</span>
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto scrollbar-none">
                {SERVERS.map((server) => {
                  const ping = pings[server.id];
                  const isSelected = server.id === selectedServer.id;
                  const flagClassName = resolveFlagMeta({ code: server.flagCode, countryName: server.country }).className;
                  const pingText = typeof ping === 'number' ? `${ping} ms` : '...';

                  return (
                    <button
                      key={server.id}
                      type="button"
                      onClick={() => handleServerSelect(server)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200',
                        isSelected
                          ? cn(t.card, a.border)
                          : cn(t.border, t.cardHover, t.borderHover),
                      )}
                    >
                      <span
                        className={cn('server-flag-icon shrink-0 rounded-[3px]', flagClassName)}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className={cn('text-sm font-medium', t.textStrong)}>{server.country}</div>
                        <div className={cn('text-xs', t.textSubtle)}>{server.city}</div>
                      </div>
                      <span className={cn(pingValueClassName, pingColor(ping))}>
                        {pingText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </main>
      </div>
    </div>
  );
}
