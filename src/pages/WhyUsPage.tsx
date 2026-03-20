'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  EyeOff,
  Globe,
  Lock,
  MessageCircle,
  Moon,
  Shield,
  Smartphone,
  Sun,
  Tv,
  UserCheck,
  Wallet,
  Zap,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

/* ───────────── types ───────────── */

type ThemeName = 'dark' | 'milky';
type AccentName = 'emerald' | 'orange' | 'blue' | 'pink';

/* ───────────── storage ───────────── */

const STORAGE_THEME_KEY = 'wwpro-theme';
const STORAGE_ACCENT_KEY = 'wwpro-accent';

/* ───────────── design tokens ───────────── */

const ACCENTS = {
  emerald: {
    color: 'bg-emerald-500',
    text: 'text-emerald-500',
    textLight: 'text-emerald-400',
    bgSoft: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    button: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_24px_rgba(16,185,129,0.3)]',
    rgb: '16, 185, 129',
    hex: '#10b981',
    gradientFrom: 'from-emerald-500/20',
  },
  orange: {
    color: 'bg-orange-500',
    text: 'text-orange-500',
    textLight: 'text-orange-400',
    bgSoft: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    button: 'bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_24px_rgba(249,115,22,0.3)]',
    rgb: '249, 115, 22',
    hex: '#f97316',
    gradientFrom: 'from-orange-500/20',
  },
  blue: {
    color: 'bg-blue-500',
    text: 'text-blue-500',
    textLight: 'text-blue-400',
    bgSoft: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    button: 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_24px_rgba(59,130,246,0.3)]',
    rgb: '59, 130, 246',
    hex: '#3b82f6',
    gradientFrom: 'from-blue-500/20',
  },
  pink: {
    color: 'bg-pink-500',
    text: 'text-pink-500',
    textLight: 'text-pink-400',
    bgSoft: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    button: 'bg-pink-500 hover:bg-pink-400 text-white shadow-[0_0_24px_rgba(236,72,153,0.3)]',
    rgb: '236, 72, 153',
    hex: '#ec4899',
    gradientFrom: 'from-pink-500/20',
  },
} as const;

const THEMES = {
  dark: {
    bg: 'bg-[#050505]',
    bgRaw: '#050505',
    textStrong: 'text-white',
    text: 'text-zinc-200',
    textMuted: 'text-zinc-400',
    textSubtle: 'text-zinc-500',
    border: 'border-white/[0.06]',
    card: 'bg-white/[0.03]',
    cardHover: 'hover:bg-white/[0.06]',
    cardSolid: 'bg-[#0a0a0a]',
    sectionAlt: 'bg-white/[0.02]',
    divider: 'bg-white/[0.06]',
    gridLine: 'rgba(255,255,255,0.03)',
    gridLineBright: 'rgba(255,255,255,0.06)',
  },
  milky: {
    bg: 'bg-[#faf8f5]',
    bgRaw: '#faf8f5',
    textStrong: 'text-zinc-950',
    text: 'text-zinc-700',
    textMuted: 'text-zinc-500',
    textSubtle: 'text-zinc-400',
    border: 'border-zinc-200',
    card: 'bg-white',
    cardHover: 'hover:bg-zinc-50',
    cardSolid: 'bg-white',
    sectionAlt: 'bg-zinc-50/80',
    divider: 'bg-zinc-200',
    gridLine: 'rgba(0,0,0,0.03)',
    gridLineBright: 'rgba(0,0,0,0.06)',
  },
} as const;

/* ───────────── data ───────────── */

const FEATURES = [
  {
    icon: Shield,
    title: 'Полная безопасность',
    description: 'Военное шифрование AES-256 защищает каждый байт вашего трафика. Перехватить данные невозможно — даже в публичных Wi-Fi сетях.',
    visual: 'shield',
  },
  {
    icon: Zap,
    title: 'Скорость 10 Гбит/с',
    description: 'Каналы с пропускной способностью 10 Gbps. Стриминг в 4K, онлайн-игры и видеозвонки — без единого лага.',
    visual: 'speed',
  },
  {
    icon: Tv,
    title: 'Без рекламы на YouTube',
    description: 'Серверы в Армении и Финляндии полностью убирают рекламу в YouTube. Смотрите видео без прерываний.',
    visual: 'adblock',
  },
  {
    icon: Smartphone,
    title: 'Простота использования',
    description: 'Подключение в один клик. Никаких сложных настроек — просто установите и пользуйтесь на любом устройстве.',
    visual: 'simple',
  },
  {
    icon: Wallet,
    title: 'Самые доступные цены',
    description: 'Качество топ-уровня по цене дешевле чашки кофе. Никаких скрытых платежей, всё прозрачно и честно.',
    visual: 'price',
  },
  {
    icon: MessageCircle,
    title: 'Поддержка 24/7',
    description: 'Команда поддержки всегда на связи. Ответим быстро и поможем решить любой вопрос — днём и ночью.',
    visual: 'support',
  },
  {
    icon: EyeOff,
    title: 'Без логов',
    description: 'Мы не храним и не отслеживаем вашу активность. Строгая политика no-logs — полная приватность без компромиссов.',
    visual: 'nologs',
  },
];

const STATS = [
  { value: 10, suffix: ' Гбит/с', label: 'Пропускная способность' },
  { value: 4, suffix: '+', label: 'Страны серверов' },
  { value: 99.9, suffix: '%', label: 'Аптайм серверов' },
  { value: 50, prefix: '<', suffix: ' мс', label: 'Средний пинг' },
];

const STEPS = [
  { step: '01', title: 'Зарегистрируйтесь', description: 'Создайте аккаунт за 30 секунд. Нужен только email.', icon: UserCheck },
  { step: '02', title: 'Выберите тариф', description: 'Гибкие планы от 1 месяца. Без привязки — отмена в любой момент.', icon: Wallet },
  { step: '03', title: 'Подключитесь', description: 'Один клик — и вы под защитой. Работает на всех устройствах.', icon: Globe },
];

const PLAN_HIGHLIGHTS = [
  'Безлимитный трафик',
  'Все серверы включены',
  'До 5 устройств одновременно',
  'Блокировка рекламы YouTube',
  'Поддержка 24/7',
  'Без логов активности',
];

/* simplified world map dots — [x%, y%] relative positions */
const MAP_DOTS: [number, number][] = [
  /* North America */
  [16,22],[17,24],[18,22],[19,24],[20,26],[21,24],[22,22],[23,24],[22,26],[20,28],[18,28],[16,26],[21,28],[23,28],[24,26],[15,24],[19,26],[20,22],[17,26],[21,22],
  /* South America */
  [27,48],[28,50],[29,52],[28,54],[27,56],[28,58],[29,56],[30,54],[29,48],[28,46],[27,52],[28,52],[26,50],[29,50],[30,52],[28,60],[27,62],[28,56],[29,58],[30,56],
  /* Europe */
  [46,20],[47,22],[48,20],[49,22],[50,24],[47,24],[48,26],[49,26],[50,22],[51,24],[46,24],[48,22],[49,20],[50,20],[47,26],[51,22],[52,24],[46,22],[48,24],[50,26],
  /* Africa */
  [48,34],[49,36],[50,38],[49,40],[48,42],[50,42],[51,40],[52,38],[50,34],[49,34],[51,36],[48,38],[50,40],[47,36],[51,34],[49,38],[50,36],[48,40],[52,36],[51,42],
  /* Asia */
  [58,22],[60,24],[62,22],[64,26],[66,24],[68,22],[70,24],[72,26],[74,24],[62,26],[65,22],[67,26],[69,24],[71,22],[73,26],[60,22],[63,24],[66,22],[70,26],[75,24],
  /* Oceania */
  [76,46],[78,48],[80,46],[77,48],[79,50],[81,48],[76,50],[78,46],[80,48],[82,46],
];

/* server locations on the dot-map */
const SERVER_LOCATIONS = [
  { name: 'Франкфурт', flag: '🇩🇪', x: 49, y: 22, ping: '~35 мс' },
  { name: 'Хельсинки', flag: '🇫🇮', x: 52, y: 17, ping: '~42 мс' },
  { name: 'Ереван', flag: '🇦🇲', x: 57, y: 26, ping: '~55 мс' },
  { name: 'Нью-Йорк', flag: '🇺🇸', x: 22, y: 24, ping: '~110 мс' },
];

/* ───────────── hooks ───────────── */

function useCountUp(end: number, duration = 1800, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* ease-out cubic */
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration, decimals]);

  return { ref, value };
}

/* ───────────── sub-components ───────────── */

/** Animated grid background for hero */
function HeroGrid({ accentRgb, theme }: { accentRgb: string; theme: ThemeName }) {
  const t = THEMES[theme];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* grid pattern */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(${t.gridLine} 1px, transparent 1px),
            linear-gradient(90deg, ${t.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
      {/* brighter center cross */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(${t.gridLineBright} 1px, transparent 1px),
            linear-gradient(90deg, ${t.gridLineBright} 1px, transparent 1px)
          `,
          backgroundSize: '256px 256px',
        }}
      />
      {/* accent glow blob top */}
      <div
        className="absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full blur-[180px] transition-colors duration-1000"
        style={{ background: `rgba(${accentRgb}, ${theme === 'dark' ? 0.12 : 0.07})` }}
      />
      {/* accent glow blob side */}
      <div
        className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full blur-[140px] transition-colors duration-1000"
        style={{ background: `rgba(${accentRgb}, ${theme === 'dark' ? 0.06 : 0.04})` }}
      />
      {/* fade to bg at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: `linear-gradient(transparent, ${t.bgRaw})` }}
      />
    </div>
  );
}

/** Decorative floating rings/orbs for hero */
function FloatingOrbs({ accentRgb, scrollY }: { accentRgb: string; scrollY: ReturnType<typeof useScroll>['scrollY'] }) {
  const y1 = useTransform(scrollY, [0, 800], [0, 120]);
  const y2 = useTransform(scrollY, [0, 800], [0, -80]);
  const y3 = useTransform(scrollY, [0, 800], [0, 60]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* ring 1 — large accent ring top-right */}
      <motion.div
        className="absolute -right-16 -top-16 h-64 w-64 rounded-full border opacity-20 sm:h-80 sm:w-80"
        style={{ borderColor: `rgba(${accentRgb}, 0.3)`, y: y1 }}
      />
      {/* ring 2 — small solid dot left */}
      <motion.div
        className="absolute left-[8%] top-[60%] h-3 w-3 rounded-full opacity-40"
        style={{ background: `rgba(${accentRgb}, 0.5)`, y: y2 }}
      />
      {/* ring 3 — medium ring bottom-left */}
      <motion.div
        className="absolute -left-10 bottom-20 h-40 w-40 rounded-full border opacity-10 sm:h-56 sm:w-56"
        style={{ borderColor: `rgba(${accentRgb}, 0.25)`, y: y3 }}
      />
      {/* dashed orbit */}
      <motion.div
        className="absolute right-[15%] top-[30%] h-24 w-24 rounded-full border border-dashed opacity-10"
        style={{ borderColor: `rgba(${accentRgb}, 0.4)`, y: y2 }}
      />
      {/* small accent dot right */}
      <motion.div
        className="absolute right-[20%] top-[70%] h-2 w-2 rounded-full opacity-50"
        style={{ background: `rgba(${accentRgb}, 0.6)`, y: y1 }}
      />
    </div>
  );
}

/** Visual illustration per feature card */
function FeatureVisual({ type, accentRgb, isDark }: { type: string; accentRgb: string; isDark: boolean }) {
  const bg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
  const accent = `rgba(${accentRgb}, 0.15)`;
  const accentBright = `rgba(${accentRgb}, 0.3)`;
  const lineColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="relative mb-4 h-28 w-full overflow-hidden rounded-xl" style={{ background: bg }}>
      {type === 'shield' && (
        /* Encrypted data stream lines */
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px rounded-full"
              style={{
                width: `${40 + Math.random() * 40}%`,
                top: `${15 + i * 14}%`,
                left: `${5 + (i % 2) * 10}%`,
                background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? accentBright : lineColor}, transparent)`,
              }}
              animate={{ x: ['-20%', '20%', '-20%'] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'linear' }}
            />
          ))}
          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: accent }}>
            <Lock className="h-5 w-5" style={{ color: `rgba(${accentRgb}, 0.8)` }} />
          </div>
        </div>
      )}
      {type === 'speed' && (
        /* Speed waves */
        <div className="absolute inset-0 flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${20 + i * 18}%`,
                height: `${20 + i * 18}%`,
                left: '10%',
                top: '50%',
                transform: 'translateY(-50%)',
                border: `1px solid`,
                borderColor: `rgba(${accentRgb}, ${0.3 - i * 0.05})`,
              }}
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            />
          ))}
          <div className="absolute right-[15%] top-1/2 -translate-y-1/2 font-mono text-xl font-light" style={{ color: `rgba(${accentRgb}, 0.5)` }}>
            10G
          </div>
        </div>
      )}
      {type === 'adblock' && (
        /* Play button with strikethrough ad markers */
        <div className="absolute inset-0 flex items-center justify-center gap-3">
          <div className="flex h-10 w-16 items-center justify-center rounded-lg" style={{ background: accent }}>
            <div className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent" style={{ borderLeftColor: `rgba(${accentRgb}, 0.7)` }} />
          </div>
          {/* fake timeline with blocked ad markers */}
          <div className="flex w-32 flex-col gap-1.5">
            <div className="relative h-1 w-full overflow-hidden rounded-full" style={{ background: lineColor }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: `rgba(${accentRgb}, 0.5)` }}
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
            <div className="flex gap-1">
              {[20, 45, 75].map((pos) => (
                <div key={pos} className="relative flex items-center gap-0.5">
                  <div className="h-1.5 w-3 rounded-sm bg-red-500/20 line-through" />
                  <div className="text-[8px] text-red-500/40 line-through">Ad</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {type === 'simple' && (
        /* One-click toggle */
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="flex h-14 w-28 items-center rounded-full p-1"
            style={{ background: lineColor }}
          >
            <motion.div
              className="h-12 w-12 rounded-full shadow-lg"
              style={{ background: `rgba(${accentRgb}, 0.6)` }}
              animate={{ x: [0, 56, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      )}
      {type === 'price' && (
        /* Price comparison bars */
        <div className="absolute inset-0 flex items-end justify-center gap-3 px-8 pb-4">
          {[
            { h: '70%', label: 'Другие', muted: true },
            { h: '35%', label: 'WW.pro', muted: false },
          ].map((bar) => (
            <div key={bar.label} className="flex w-16 flex-col items-center gap-1">
              <motion.div
                className="w-full rounded-t-lg"
                style={{
                  background: bar.muted ? lineColor : `rgba(${accentRgb}, 0.3)`,
                  border: bar.muted ? 'none' : `1px solid rgba(${accentRgb}, 0.2)`,
                }}
                initial={{ height: 0 }}
                whileInView={{ height: bar.h }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: bar.muted ? 0 : 0.2 }}
              />
              <span className="text-[9px] opacity-50">{bar.label}</span>
            </div>
          ))}
        </div>
      )}
      {type === 'support' && (
        /* Chat bubbles */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8">
          <motion.div
            className="self-end rounded-xl rounded-br-sm px-3 py-1.5 text-[10px]"
            style={{ background: accent, color: `rgba(${accentRgb}, 0.8)` }}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Нужна помощь с настройкой
          </motion.div>
          <motion.div
            className="self-start rounded-xl rounded-bl-sm px-3 py-1.5 text-[10px]"
            style={{ background: lineColor }}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            Конечно! Сейчас поможем 👋
          </motion.div>
        </div>
      )}
      {type === 'nologs' && (
        /* Fading data lines */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full"
              style={{
                width: `${50 + Math.random() * 40}%`,
                background: lineColor,
              }}
              animate={{ opacity: [0.4, 0.1, 0] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            />
          ))}
          <div className="absolute text-[10px] font-medium opacity-30">DELETED</div>
        </div>
      )}
    </div>
  );
}

/** Animated SVG check for the included list */
function AnimatedCheck({ accentRgb, delay }: { accentRgb: string; delay: number }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.circle
        cx="12" cy="12" r="10"
        fill={`rgba(${accentRgb}, 0.1)`}
        stroke={`rgba(${accentRgb}, 0.3)`}
        strokeWidth="1"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: { scale: 1, opacity: 1 },
        }}
        transition={{ duration: 0.3, delay }}
      />
      <motion.path
        d="M8 12.5l2.5 2.5 5-5"
        fill="none"
        stroke={`rgba(${accentRgb}, 0.8)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1 },
        }}
        transition={{ duration: 0.4, delay: delay + 0.2 }}
      />
    </motion.svg>
  );
}

/** Dashboard mockup for the "included" section */
function DashboardMockup({ accentRgb, isDark }: { accentRgb: string; isDark: boolean }) {
  const bgCard = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const borderC = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textC = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  const textStrong = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)';
  const accent = `rgba(${accentRgb}, 0.5)`;
  const accentSoft = `rgba(${accentRgb}, 0.12)`;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border"
      style={{ borderColor: borderC, background: bgCard }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
    >
      {/* title bar */}
      <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: borderC }}>
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
        </div>
        <div className="ml-4 h-4 w-32 rounded-full" style={{ background: borderC }} />
      </div>

      <div className="flex">
        {/* sidebar mini */}
        <div className="hidden w-14 border-r sm:block" style={{ borderColor: borderC }}>
          <div className="flex flex-col items-center gap-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-5 w-5 rounded-md"
                style={{ background: i === 0 ? accentSoft : borderC }}
              />
            ))}
          </div>
        </div>

        {/* content */}
        <div className="flex-1 p-4">
          {/* status row */}
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ background: accent }} />
            <span className="text-[10px] font-medium" style={{ color: textStrong }}>Подключено</span>
            <span className="ml-auto font-mono text-[10px]" style={{ color: textC }}>Frankfurt, DE</span>
          </div>
          {/* stats mini cards */}
          <div className="grid grid-cols-3 gap-2">
            {['10 Gbps', '35 мс', '0 логов'].map((v, i) => (
              <motion.div
                key={v}
                className="rounded-lg border px-2 py-2 text-center"
                style={{ borderColor: borderC, background: bgCard }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="font-mono text-xs font-medium" style={{ color: i === 0 ? accent : textStrong }}>{v}</div>
              </motion.div>
            ))}
          </div>
          {/* speed bar */}
          <div className="mt-3">
            <div className="mb-1 text-[9px]" style={{ color: textC }}>Скорость соединения</div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: borderC }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, rgba(${accentRgb}, 0.4), rgba(${accentRgb}, 0.7))` }}
                initial={{ width: '0%' }}
                whileInView={{ width: '85%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Server map — dot matrix + server pins */
function ServerMap({ accentRgb, isDark }: { accentRgb: string; isDark: boolean }) {
  const dotColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="relative mx-auto aspect-[2/1] w-full max-w-4xl">
      {/* dots */}
      <svg viewBox="0 0 100 70" className="h-full w-full">
        {MAP_DOTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.5" fill={dotColor} />
        ))}
        {/* connection lines between servers */}
        {SERVER_LOCATIONS.map((s, i) =>
          SERVER_LOCATIONS.slice(i + 1).map((s2, j) => (
            <motion.line
              key={`${i}-${j}`}
              x1={s.x} y1={s.y} x2={s2.x} y2={s2.y}
              stroke={`rgba(${accentRgb}, 0.08)`}
              strokeWidth="0.2"
              strokeDasharray="1 1"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 + i * 0.15 }}
            />
          ))
        )}
        {/* server location pulses */}
        {SERVER_LOCATIONS.map((server, i) => (
          <g key={server.name}>
            <motion.circle
              cx={server.x} cy={server.y} r="2"
              fill="none"
              stroke={`rgba(${accentRgb}, 0.3)`}
              strokeWidth="0.3"
              animate={{ r: [1, 3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }}
            />
            <motion.circle
              cx={server.x} cy={server.y} r="0.8"
              fill={`rgba(${accentRgb}, 0.8)`}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.15 }}
            />
          </g>
        ))}
      </svg>
      {/* server labels */}
      {SERVER_LOCATIONS.map((server, i) => (
        <motion.div
          key={server.name}
          className="absolute text-[10px] sm:text-xs"
          style={{
            left: `${server.x}%`,
            top: `${(server.y / 70) * 100 + 4}%`,
            transform: 'translateX(-50%)',
          }}
          initial={{ opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 + i * 0.15 }}
        >
          <span className="whitespace-nowrap">
            {server.flag} <span style={{ color: `rgba(${accentRgb}, 0.7)` }}>{server.name}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────── page ───────────── */

export default function WhyUsPage() {
  const [theme, setTheme] = useState<ThemeName>('dark');
  const [accent, setAccent] = useState<AccentName>('emerald');

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) as ThemeName | null;
    const savedAccent = localStorage.getItem(STORAGE_ACCENT_KEY) as AccentName | null;
    if (savedTheme && savedTheme in THEMES) setTheme(savedTheme);
    if (savedAccent && savedAccent in ACCENTS) setAccent(savedAccent);
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_THEME_KEY, theme); }, [theme]);
  useEffect(() => { localStorage.setItem(STORAGE_ACCENT_KEY, accent); }, [accent]);

  const t = THEMES[theme];
  const a = ACCENTS[accent];
  const isDark = theme === 'dark';

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 80]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div className={cn('relative min-h-screen font-sans transition-colors duration-500', t.bg, t.text)}>

      {/* ════════════ HEADER ════════════ */}
      <header className={cn(
        'sticky top-0 z-40 border-b backdrop-blur-xl transition-colors',
        t.border,
        isDark ? 'bg-[#050505]/80' : 'bg-[#faf8f5]/80',
      )}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                t.border, t.textMuted,
                isDark ? 'hover:text-white hover:bg-white/[0.04]' : 'hover:text-zinc-900 hover:bg-zinc-50',
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Назад
            </Link>
            <Logo theme={theme} accent={accent} className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <div className={cn('flex items-center gap-1.5 rounded-full border p-1.5 transition-colors', t.border, t.cardSolid)}>
              {(Object.keys(ACCENTS) as AccentName[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAccent(key)}
                  className={cn(
                    'h-3.5 w-3.5 rounded-full transition-all duration-300',
                    ACCENTS[key].color,
                    accent === key
                      ? cn('scale-110 ring-2 ring-current ring-offset-2', isDark ? 'ring-offset-[#0a0a0a]' : 'ring-offset-white')
                      : 'scale-90 opacity-50 hover:scale-100 hover:opacity-100',
                  )}
                  aria-label={`Акцент ${key}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTheme((c) => (c === 'dark' ? 'milky' : 'dark'))}
              className={cn('rounded-full border p-2 transition-colors', t.border, t.cardSolid, t.textMuted, isDark ? 'hover:text-white' : 'hover:text-black')}
              aria-label="Сменить тему"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ════════════ HERO ════════════ */}
      <section className="relative overflow-hidden">
        <HeroGrid accentRgb={a.rgb} theme={theme} />
        <FloatingOrbs accentRgb={a.rgb} scrollY={scrollY} />

        <motion.div
          className="relative mx-auto max-w-4xl px-5 pb-24 pt-24 text-center sm:px-8 sm:pb-32 sm:pt-32"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* live badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2"
          >
            <span className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium', a.border, a.bgSoft, a.text)}>
              <span className="relative flex h-2 w-2">
                <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-75', a.color)} />
                <span className={cn('relative inline-flex h-2 w-2 rounded-full', a.color)} />
              </span>
              Работает прямо сейчас
            </span>
          </motion.div>

          <motion.h1
            className={cn('text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl lg:text-7xl', t.textStrong)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Быстрый. Безопасный.
            <br />
            <span className={a.text}>Доступный каждому.</span>
          </motion.h1>

          <motion.p
            className={cn('mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl', t.textMuted)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            WW.pro — VPN с серверами в&nbsp;4&nbsp;странах, каналами&nbsp;10&nbsp;Гбит/с
            и&nbsp;самыми доступными ценами. Качество топ&#8209;уровня без&nbsp;переплат.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Link to="/" className={cn('inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium transition-all duration-200', a.button)}>
              Начать бесплатно
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className={cn('inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-sm font-medium transition-colors', t.border, t.textStrong, isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-zinc-50')}
            >
              Узнать больше
            </a>
          </motion.div>

          {/* scroll indicator */}
          <motion.div
            className="mt-16 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="flex h-8 w-5 items-start justify-center rounded-full border p-1"
              style={{ borderColor: `rgba(${a.rgb}, 0.2)` }}
            >
              <motion.div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: `rgba(${a.rgb}, 0.5)` }}
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════ STATS BAR ════════════ */}
      <section className={cn('border-y transition-colors', t.border, t.sectionAlt)}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 sm:grid-cols-4">
          {STATS.map((stat, i) => {
            const { ref, value } = useCountUp(stat.value, 1800, stat.value % 1 !== 0 ? 1 : 0);
            return (
              <motion.div
                key={stat.label}
                className={cn(
                  'relative px-6 py-8 text-center sm:py-10',
                  i < STATS.length - 1 && 'sm:border-r',
                  i < 2 && 'border-b sm:border-b-0',
                  i === 0 && 'border-r sm:border-r',
                  t.border,
                )}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                {/* soft accent glow under number */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-16 w-16 -translate-y-1/2 rounded-full blur-2xl"
                  style={{ background: `rgba(${a.rgb}, ${isDark ? 0.06 : 0.04})` }}
                />
                <div className={cn('relative text-2xl font-light tabular-nums sm:text-3xl', t.textStrong)}>
                  <span ref={ref}>
                    {stat.prefix ?? ''}{value}{stat.suffix ?? ''}
                  </span>
                </div>
                <div className={cn('mt-1.5 text-xs sm:text-sm', t.textMuted)}>
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div
            className="mb-14 text-center sm:mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={cn('text-2xl font-medium tracking-tight sm:text-3xl', t.textStrong)}>
              Всё, что нужно для&nbsp;свободного интернета
            </h2>
            <p className={cn('mx-auto mt-4 max-w-lg text-sm sm:text-base', t.textMuted)}>
              Каждая деталь продумана для максимума скорости, безопасности и&nbsp;удобства.
            </p>
          </motion.div>

          {/* hero feature — full width */}
          <motion.div
            className={cn('group mb-5 overflow-hidden rounded-2xl border transition-all duration-300', t.border, t.card)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            style={{ boxShadow: 'none', transition: 'box-shadow 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 60px rgba(${a.rgb}, 0.07)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div className="grid lg:grid-cols-2">
              {/* left: animated encrypted stream */}
              <div
                className="relative flex min-h-[200px] items-center justify-center overflow-hidden lg:min-h-[280px]"
                style={{ background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}
              >
                {/* flowing data lines */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-px"
                    style={{
                      width: `${30 + Math.random() * 50}%`,
                      top: `${8 + i * 9}%`,
                      left: `${(i % 3) * 5}%`,
                      background: `linear-gradient(90deg, transparent, rgba(${a.rgb}, ${0.1 + (i % 3) * 0.05}), transparent)`,
                    }}
                    animate={{ x: ['-30%', '30%', '-30%'] }}
                    transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'linear' }}
                  />
                ))}
                {/* center shield */}
                <div
                  className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl"
                  style={{
                    background: `rgba(${a.rgb}, 0.1)`,
                    boxShadow: `0 0 60px rgba(${a.rgb}, 0.15)`,
                  }}
                >
                  <Shield className="h-10 w-10" style={{ color: `rgba(${a.rgb}, 0.7)` }} />
                </div>
              </div>
              {/* right: text */}
              <div className="flex flex-col justify-center p-8 lg:p-10">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', a.bgSoft)}>
                  <Shield className={cn('h-5 w-5', a.text)} />
                </div>
                <h3 className={cn('mt-5 text-xl font-medium sm:text-2xl', t.textStrong)}>
                  {FEATURES[0].title}
                </h3>
                <p className={cn('mt-3 text-sm leading-relaxed sm:text-base', t.textMuted)}>
                  {FEATURES[0].description}
                </p>
                <p className={cn('mt-2 text-sm leading-relaxed', t.textMuted)}>
                  Современный протокол WireGuard обеспечивает минимальную задержку при максимальной защите. Ваши данные в абсолютной безопасности.
                </p>
              </div>
            </div>
          </motion.div>

          {/* remaining features grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.slice(1).map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className={cn(
                    'group overflow-hidden rounded-2xl border transition-all duration-300',
                    t.border, t.card, t.cardHover,
                  )}
                  style={{ boxShadow: 'none', transition: 'box-shadow 0.3s, background 0.3s, transform 0.3s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 48px rgba(${a.rgb}, 0.07)`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <FeatureVisual type={feature.visual} accentRgb={a.rgb} isDark={isDark} />
                  <div className="p-6 pt-0">
                    <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl transition-colors', a.bgSoft)}>
                      <Icon className={cn('h-5 w-5', a.text)} />
                    </div>
                    <h3 className={cn('mt-4 text-base font-medium', t.textStrong)}>{feature.title}</h3>
                    <p className={cn('mt-2 text-sm leading-relaxed', t.textMuted)}>{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════ YOUTUBE WITHOUT ADS — BROWSER DEMO ════════════ */}
      <section className={cn('border-y py-20 transition-colors sm:py-28', t.border, t.sectionAlt)}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr,auto] lg:gap-16">
            {/* left: text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
            >
              <div className={cn('mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium', a.border, a.bgSoft, a.text)}>
                <Tv className="h-3.5 w-3.5" />
                Без рекламы
              </div>
              <h2 className={cn('text-2xl font-medium tracking-tight sm:text-3xl', t.textStrong)}>
                YouTube без единой
                <br />
                рекламы. Серьёзно.
              </h2>
              <p className={cn('mt-4 max-w-md text-sm leading-relaxed sm:text-base', t.textMuted)}>
                Подключитесь к серверу в Армении или Финляндии — и реклама на YouTube
                исчезнет полностью. Никаких расширений, никаких костылей.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Видео запускается мгновенно',
                  'Работает на всех устройствах',
                  'Стриминг до 4K без буферизации',
                  'Никаких рекламных вставок — ноль',
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                  >
                    <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full', a.bgSoft)}>
                      <Check className={cn('h-3 w-3', a.text)} />
                    </div>
                    <span className={cn('text-sm', t.text)}>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* right: browser window with video player */}
            <motion.div
              className="relative mx-auto w-full max-w-[540px] lg:mx-0"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* glow behind browser */}
              <div
                className="pointer-events-none absolute -inset-8 rounded-3xl blur-3xl"
                style={{ background: `rgba(${a.rgb}, ${isDark ? 0.06 : 0.04})` }}
              />

              {/* browser chrome */}
              <div
                className={cn('relative overflow-hidden rounded-xl border shadow-2xl', t.border)}
                style={{ background: isDark ? '#0c0c0c' : '#ffffff' }}
              >
                {/* title bar */}
                <div
                  className="flex items-center gap-2 border-b px-3 py-2"
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                >
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  {/* address bar */}
                  <div
                    className="mx-2 flex flex-1 items-center gap-1.5 rounded-md px-2.5 py-1"
                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                  >
                    <Lock className="h-3 w-3 shrink-0" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
                    <span className="truncate font-mono text-[10px]" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                      youtube.com/watch?v=4K_nature
                    </span>
                  </div>
                </div>

                {/* video player area */}
                <div className="relative">
                  {/* video slot — replace with real recording later */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    {/* placeholder: animated gradient simulating video playback */}
                    <video
                      className="h-full w-full object-cover"
                      src="/demo/youtube-no-ads.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      /* if video file not found, CSS placeholder below will show instead */
                      style={{ position: 'relative', zIndex: 1 }}
                      onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
                    />
                    {/* CSS placeholder (visible when video file is missing) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-sky-900 via-blue-950 to-indigo-950">
                      {/* fake scenery - mountain/aurora */}
                      <div className="absolute inset-x-0 bottom-0 h-2/5">
                        <svg viewBox="0 0 540 120" className="h-full w-full" preserveAspectRatio="none">
                          <path d="M0,120 L0,80 Q60,20 120,60 Q180,90 240,40 Q300,0 360,50 Q420,80 480,30 Q510,10 540,45 L540,120Z" fill="rgba(255,255,255,0.03)" />
                          <path d="M0,120 L0,90 Q80,50 160,75 Q240,100 320,55 Q400,20 480,65 L540,50 L540,120Z" fill="rgba(255,255,255,0.02)" />
                        </svg>
                      </div>
                      {/* aurora glow */}
                      <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
                        style={{
                          background: `linear-gradient(180deg, rgba(${a.rgb}, 0.15) 0%, transparent 100%)`,
                        }}
                      />
                      {/* play icon */}
                      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                        <div className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white/80" />
                      </div>
                      <div className="relative z-10 mt-3 font-mono text-[10px] text-white/40">4K • Nature Documentary</div>
                    </div>
                  </div>

                  {/* YouTube-style bottom bar overlay */}
                  <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-6">
                    {/* progress bar */}
                    <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
                      <motion.div
                        className="h-full rounded-full bg-red-500"
                        initial={{ width: '0%' }}
                        whileInView={{ width: '35%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 3, delay: 0.5 }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* play/pause */}
                        <div className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white/80" />
                        <span className="font-mono text-[10px] text-white/60">1:24 / 3:47</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-sm bg-white/20 px-1 py-0.5 font-mono text-[8px] font-bold text-white/80">4K</span>
                      </div>
                    </div>
                  </div>

                  {/* NO ADS badge */}
                  <motion.div
                    className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1"
                    style={{ background: `rgba(${a.rgb}, 0.9)` }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, type: 'spring', bounce: 0.4 }}
                  >
                    <Check className="h-3 w-3 text-white" />
                    <span className="text-[10px] font-bold text-white">БЕЗ РЕКЛАМЫ</span>
                  </motion.div>
                </div>

                {/* YouTube-style info bar under video */}
                <div className="px-3 py-3" style={{ background: isDark ? '#0c0c0c' : '#ffffff' }}>
                  <div className="flex gap-3">
                    {/* channel avatar */}
                    <div className="h-9 w-9 shrink-0 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-xs font-medium"
                        style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}
                      >
                        Amazing Planet — 4K Nature
                      </div>
                      <div
                        className="mt-0.5 text-[10px]"
                        style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
                      >
                        2.4M просмотров • 1 день назад
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* comparison text below */}
              <div className="mt-5 flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-xs line-through" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}>Обычный YouTube</div>
                  <div className="mt-0.5 text-[10px]" style={{ color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>5-15 сек рекламы</div>
                </div>
                <ArrowRight className="h-4 w-4" style={{ color: `rgba(${a.rgb}, 0.5)` }} />
                <div className="text-center">
                  <div className={cn('text-xs font-medium', a.text)}>С WW.pro</div>
                  <div className="mt-0.5 text-[10px]" style={{ color: `rgba(${a.rgb}, 0.6)` }}>0 сек — сразу видео</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS — TIMELINE ════════════ */}
      <section className={cn('border-y py-20 transition-colors sm:py-28', t.border, t.sectionAlt)}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <motion.div
            className="mb-14 text-center sm:mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={cn('text-2xl font-medium tracking-tight sm:text-3xl', t.textStrong)}>
              Начать — проще простого
            </h2>
            <p className={cn('mx-auto mt-4 max-w-lg text-sm sm:text-base', t.textMuted)}>
              Три шага до безопасного и&nbsp;быстрого интернета.
            </p>
          </motion.div>

          {/* timeline */}
          <div className="relative">
            {/* connecting line — desktop only */}
            <div className="pointer-events-none absolute left-0 right-0 top-10 hidden sm:block">
              <div className="mx-auto" style={{ width: '70%' }}>
                <div className="h-px w-full" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                <motion.div
                  className="relative -top-px h-px"
                  style={{ background: `rgba(${a.rgb}, 0.4)` }}
                  initial={{ width: '0%' }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STEPS.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
                    className="relative text-center"
                  >
                    {/* circle node */}
                    <div className="relative z-10 mx-auto mb-5 flex h-20 w-20 items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ background: `rgba(${a.rgb}, 0.06)` }}
                      />
                      <div
                        className="absolute inset-2 rounded-full border"
                        style={{ borderColor: `rgba(${a.rgb}, 0.2)` }}
                      />
                      <StepIcon className="relative h-7 w-7" style={{ color: `rgba(${a.rgb}, 0.7)` }} />
                    </div>

                    <div className={cn('rounded-2xl border p-6 transition-colors', t.border, t.card)}>
                      <span className={cn('font-mono text-sm', a.textLight)}>{step.step}</span>
                      <h3 className={cn('mt-2 text-base font-medium', t.textStrong)}>{step.title}</h3>
                      <p className={cn('mt-2 text-sm leading-relaxed', t.textMuted)}>{step.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ WHAT'S INCLUDED ════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* left: dashboard mockup */}
            <DashboardMockup accentRgb={a.rgb} isDark={isDark} />

            {/* right: text + checklist */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
              >
                <h2 className={cn('text-2xl font-medium tracking-tight sm:text-3xl', t.textStrong)}>
                  Всё включено.
                  <br />
                  Без скрытых условий.
                </h2>
                <p className={cn('mt-4 text-sm leading-relaxed sm:text-base', t.textMuted)}>
                  Каждый тариф WW.pro включает полный набор возможностей. Никаких ограничений по
                  скорости, трафику или&nbsp;функциям.
                </p>
              </motion.div>

              <ul className="mt-8 space-y-4">
                {PLAN_HIGHLIGHTS.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.15 + i * 0.07 }}
                  >
                    <AnimatedCheck accentRgb={a.rgb} delay={0.15 + i * 0.07} />
                    <span className={cn('text-sm sm:text-base', t.textStrong)}>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ SERVER GEOGRAPHY ════════════ */}
      <section className={cn('border-y py-20 transition-colors sm:py-28', t.border, t.sectionAlt)}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div
            className="mb-14 text-center sm:mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={cn('text-2xl font-medium tracking-tight sm:text-3xl', t.textStrong)}>
              Серверы по всему миру
            </h2>
            <p className={cn('mx-auto mt-4 max-w-lg text-sm sm:text-base', t.textMuted)}>
              Стратегически расположенные точки подключения для минимальной задержки и&nbsp;максимальной скорости.
            </p>
          </motion.div>

          <ServerMap accentRgb={a.rgb} isDark={isDark} />

          {/* server cards */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {SERVER_LOCATIONS.map((server, i) => (
              <motion.div
                key={server.name}
                className={cn('rounded-xl border p-3 text-center transition-colors sm:p-4', t.border, t.card)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="text-lg sm:text-xl">{server.flag}</div>
                <div className={cn('mt-1 text-xs font-medium sm:text-sm', t.textStrong)}>{server.name}</div>
                <div className={cn('mt-0.5 font-mono text-[10px] sm:text-xs', a.text)}>{server.ping}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FINAL CTA ════════════ */}
      <section className="relative overflow-hidden">
        {/* animated gradient mesh */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full blur-[160px] transition-colors duration-1000"
            style={{ background: `rgba(${a.rgb}, ${isDark ? 0.08 : 0.05})` }}
            animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full blur-[140px] transition-colors duration-1000"
            style={{ background: `rgba(${a.rgb}, ${isDark ? 0.06 : 0.04})` }}
            animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <motion.div
          className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          {/* trust badges */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Shield, label: 'AES-256' },
              { icon: EyeOff, label: 'No Logs' },
              { icon: Zap, label: '10 Gbps' },
            ].map((badge, i) => (
              <motion.div
                key={badge.label}
                className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs', t.border, t.textMuted)}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <badge.icon className="h-3 w-3" />
                {badge.label}
              </motion.div>
            ))}
          </div>

          <h2 className={cn('text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl', t.textStrong)}>
            Готовы к безопасному
            <br />
            интернету?
          </h2>
          <p className={cn('mx-auto mt-5 max-w-lg text-sm leading-relaxed sm:text-base', t.textMuted)}>
            Регистрация занимает меньше минуты. Подключитесь к&nbsp;быстрому, защищённому
            интернету и&nbsp;забудьте о&nbsp;рекламе, ограничениях и&nbsp;слежке.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className={cn('inline-flex items-center gap-2 rounded-full px-9 py-4 text-base font-medium transition-all duration-200', a.button)}
            >
              Зарегистрироваться
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className={cn('border-t transition-colors', t.border)}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:justify-between sm:px-8">
          <Logo theme={theme} accent={accent} className="h-7 w-auto" />
          <div className={cn('flex items-center gap-5 text-xs', t.textSubtle)}>
            <Link to="/terms" className="transition-colors hover:underline">Оферта</Link>
            <Link to="/privacy" className="transition-colors hover:underline">Конфиденциальность</Link>
            <Link to="/refund" className="transition-colors hover:underline">Возвраты</Link>
          </div>
          <span className={cn('text-xs', t.textSubtle)}>© {new Date().getFullYear()} WW.pro</span>
        </div>
      </footer>
    </div>
  );
}
