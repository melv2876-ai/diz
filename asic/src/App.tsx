import React, { createContext, useContext, useState } from 'react';
import { Logo } from '../../components/Logo';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  FileJson,
  Globe,
  Laptop,
  LifeBuoy,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ACCENTS = {
  emerald: {
    color: 'bg-emerald-500',
    text: 'text-emerald-500',
    textLight: 'text-emerald-400',
    bgSoft: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    navBg: 'from-emerald-500/15',
    blur1: 'bg-emerald-500/20',
    button: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    buttonOutline: 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10',
    iconGlow: 'bg-emerald-400',
    selection: 'selection:bg-emerald-500/30',
    glowCard: 'to-emerald-500/10',
    planBg: 'from-emerald-400 to-emerald-900/20 shadow-emerald-900/20',
    planDivider: 'via-emerald-400',
  },
  orange: {
    color: 'bg-orange-500',
    text: 'text-orange-500',
    textLight: 'text-orange-400',
    bgSoft: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    navBg: 'from-orange-500/15',
    blur1: 'bg-orange-500/20',
    button: 'bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    buttonOutline: 'border-orange-500/30 text-orange-500 hover:bg-orange-500/10',
    iconGlow: 'bg-orange-400',
    selection: 'selection:bg-orange-500/30',
    glowCard: 'to-orange-500/10',
    planBg: 'from-orange-400 to-orange-900/20 shadow-orange-900/20',
    planDivider: 'via-orange-400',
  },
  blue: {
    color: 'bg-blue-500',
    text: 'text-blue-500',
    textLight: 'text-blue-400',
    bgSoft: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    navBg: 'from-blue-500/15',
    blur1: 'bg-blue-500/20',
    button: 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    buttonOutline: 'border-blue-500/30 text-blue-500 hover:bg-blue-500/10',
    iconGlow: 'bg-blue-400',
    selection: 'selection:bg-blue-500/30',
    glowCard: 'to-blue-500/10',
    planBg: 'from-blue-400 to-blue-900/20 shadow-blue-900/20',
    planDivider: 'via-blue-400',
  },
  pink: {
    color: 'bg-pink-500',
    text: 'text-pink-500',
    textLight: 'text-pink-400',
    bgSoft: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    navBg: 'from-pink-500/15',
    blur1: 'bg-pink-500/20',
    button: 'bg-pink-500 hover:bg-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]',
    buttonOutline: 'border-pink-500/30 text-pink-500 hover:bg-pink-500/10',
    iconGlow: 'bg-pink-400',
    selection: 'selection:bg-pink-500/30',
    glowCard: 'to-pink-500/10',
    planBg: 'from-pink-400 to-pink-900/20 shadow-pink-900/20',
    planDivider: 'via-pink-400',
  },
} as const;

const THEMES = {
  dark: {
    bg: 'bg-[#050505]',
    textStrong: 'text-white',
    text: 'text-zinc-200',
    textMuted: 'text-zinc-400',
    textSubtle: 'text-zinc-500',
    border: 'border-white/[0.05]',
    borderHover: 'hover:border-white/[0.1]',
    sidebar: 'bg-black/20',
    card: 'bg-white/[0.02]',
    cardHover: 'hover:bg-white/[0.04]',
    cardSolid: 'bg-[#0a0a0a]',
    divider: 'bg-gradient-to-r from-white/[0.08] via-white/[0.02] to-transparent',
    navHover: 'hover:bg-white/[0.05]',
    navActiveText: 'text-white',
    tableHeader: 'bg-white/[0.02]',
  },
  milky: {
    bg: 'bg-[#faf8f5]',
    textStrong: 'text-zinc-900',
    text: 'text-zinc-800',
    textMuted: 'text-zinc-500',
    textSubtle: 'text-zinc-400',
    border: 'border-black/[0.05]',
    borderHover: 'hover:border-black/[0.1]',
    sidebar: 'bg-white/40',
    card: 'bg-black/[0.02]',
    cardHover: 'hover:bg-black/[0.04]',
    cardSolid: 'bg-white',
    divider: 'bg-gradient-to-r from-black/[0.08] via-black/[0.02] to-transparent',
    navHover: 'hover:bg-black/[0.05]',
    navActiveText: 'text-black',
    tableHeader: 'bg-black/[0.02]',
  },
} as const;

type ThemeType = keyof typeof THEMES;
type AccentType = keyof typeof ACCENTS;

type ThemeContextValue = {
  theme: ThemeType;
  accent: AccentType;
  t: (typeof THEMES)[ThemeType];
  a: (typeof ACCENTS)[AccentType];
  setTheme: (theme: ThemeType) => void;
  setAccent: (accent: AccentType) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark' as ThemeType,
  accent: 'emerald' as AccentType,
  t: THEMES.dark,
  a: ACCENTS.emerald,
  setTheme: (_theme: ThemeType) => { },
  setAccent: (_accent: AccentType) => { },
});

const DEVICES = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    os: 'macOS',
    location: 'Франкфурт, Германия',
    ip: '192.168.1.12',
    lastActive: '2 мин назад',
    status: 'active',
  },
  {
    id: 2,
    name: 'iPhone 14 Pro',
    os: 'iOS',
    location: 'Лондон, Великобритания',
    ip: '10.0.0.5',
    lastActive: '1 час назад',
    status: 'offline',
  },
  {
    id: 3,
    name: 'Windows Desktop',
    os: 'Windows 11',
    location: 'Нью-Йорк, США',
    ip: '172.16.0.8',
    lastActive: '3 дня назад',
    status: 'offline',
  },
];

const PLANS = [
  {
    id: 'basic',
    name: 'Старт',
    price: '$4.99',
    period: '/мес',
    features: ['1 устройство', 'Стандартная скорость', '10 локаций'],
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: '/мес',
    features: ['5 устройств', 'Максимальная скорость (10 Гбит/с)', 'Все локации', 'Блокировка рекламы'],
    recommended: true,
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: '$14.99',
    period: '/мес',
    features: ['Безлимитные устройства', 'Максимальная скорость', 'Выделенный IP', 'Приоритетная поддержка 24/7'],
    recommended: false,
  },
];

const BILLING_HISTORY = [
  { id: 'INV-2024-001', date: '15 окт 2024', amount: '$9.99', status: 'paid', plan: 'Тариф Pro' },
  { id: 'INV-2024-002', date: '15 ноя 2024', amount: '$9.99', status: 'paid', plan: 'Тариф Pro' },
  { id: 'INV-2024-003', date: '15 дек 2024', amount: '$9.99', status: 'pending', plan: 'Тариф Pro' },
];

const TAB_LABELS = {
  overview: 'Обзор',
  billing: 'Оплата и тарифы',
  devices: 'Устройства',
  preferences: 'Параметры',
  support: 'Поддержка',
} as const;

type TabType = keyof typeof TAB_LABELS;

const NavItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => {
  const { t, a } = useContext(ThemeContext);

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group',
        active ? t.navActiveText : cn(t.textMuted, t.navHover)
      )}
    >
      {active ? (
        <motion.div
          layoutId="activeNavBg"
          className={cn('absolute inset-0 rounded-xl bg-gradient-to-r to-transparent opacity-80', a.navBg)}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      ) : null}
      <div className="relative z-10 flex items-center gap-3">
        <Icon className={cn('h-5 w-5 transition-colors', active ? a.textLight : t.textMuted)} />
        {label}
      </div>
    </button>
  );
};

const GlowCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { t, a } = useContext(ThemeContext);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-500',
        t.card,
        t.border,
        t.borderHover,
        className
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          a.glowCard
        )}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const OverviewTab = () => {
  const { t, a } = useContext(ThemeContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className={cn('relative overflow-hidden rounded-3xl border p-8', t.cardSolid, t.border)}>
        <div className={cn('pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full opacity-20 blur-[100px]', a.blur1)} />

        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className={cn('mb-4 flex items-center gap-2 text-sm font-medium', a.text)}>
              <ShieldCheck className="h-4 w-4" />
              <span>Подписка активна</span>
            </div>
            <h2 className={cn('mb-2 text-6xl font-light tracking-tight', t.textStrong)}>243</h2>
            <p className={t.textMuted}>
              Дней осталось по <span className={t.textStrong}>тарифу Pro</span>
            </p>
          </div>
          <button className={cn('rounded-xl px-6 py-3 font-medium transition-all', a.button)}>
            Продлить подписку
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlowCard className="p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className={cn('text-lg font-medium', t.textStrong)}>Активные устройства</h3>
            <span className={cn('rounded-full border px-2 py-1 text-xs', t.border, t.textMuted)}>3 из 5</span>
          </div>

          <div className="space-y-4">
            {DEVICES.map((device) => (
              <div
                key={device.id}
                className={cn(
                  'flex items-center justify-between rounded-xl border p-4 transition-colors',
                  t.card,
                  t.border,
                  t.borderHover
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-full border', t.cardSolid, t.border)}>
                    {device.os.includes('mac') || device.os.includes('Windows') ? (
                      <Laptop className={cn('h-5 w-5', t.textMuted)} />
                    ) : (
                      <Globe className={cn('h-5 w-5', t.textMuted)} />
                    )}
                  </div>
                  <div>
                    <h4 className={cn('text-sm font-medium', t.textStrong)}>{device.name}</h4>
                    <div className={cn('mt-1 flex items-center gap-2 text-xs', t.textSubtle)}>
                      <span>{device.location}</span>
                      <span>•</span>
                      <span className="font-mono">{device.ip}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {device.status === 'active' ? (
                    <div className="flex items-center gap-1.5">
                      <div className={cn('h-2 w-2 rounded-full', a.color, a.iconGlow)} />
                      <span className={cn('text-xs font-medium', a.text)}>Активно</span>
                    </div>
                  ) : null}
                  <button className={cn('rounded-lg border px-3 py-1.5 text-xs transition-colors', t.border, t.textMuted, t.cardHover)}>
                    Отключить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>

        <div className="space-y-6">
          <GlowCard className="p-6">
            <h3 className={cn('mb-4 text-lg font-medium', t.textStrong)}>Быстрые действия</h3>
            <div className="space-y-3">
              <button className={cn('group flex w-full items-center justify-between rounded-xl border p-3 transition-colors', t.card, t.border, t.borderHover)}>
                <div className="flex items-center gap-3">
                  <Download className={cn('h-5 w-5', t.textMuted, `group-hover:${a.text}`)} />
                  <span className={cn('text-sm font-medium', t.textStrong)}>Скачать приложение</span>
                </div>
                <ChevronRight className={cn('h-4 w-4', t.textSubtle)} />
              </button>
              <button className={cn('group flex w-full items-center justify-between rounded-xl border p-3 transition-colors', t.card, t.border, t.borderHover)}>
                <div className="flex items-center gap-3">
                  <FileJson className={cn('h-5 w-5', t.textMuted, `group-hover:${a.text}`)} />
                  <span className={cn('text-sm font-medium', t.textStrong)}>Конфиги WireGuard</span>
                </div>
                <ChevronRight className={cn('h-4 w-4', t.textSubtle)} />
              </button>
            </div>
          </GlowCard>

          <GlowCard className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', a.bgSoft, a.text)}>
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className={cn('mb-1 text-sm font-medium', t.textStrong)}>Автопродление включено</h4>
                <p className={cn('text-xs leading-relaxed', t.textMuted)}>
                  Подписка автоматически продлится 15 октября 2025.
                </p>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </motion.div>
  );
};

const BillingTab = () => {
  const { t, a } = useContext(ThemeContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div>
        <h3 className={cn('mb-6 text-xl font-medium', t.textStrong)}>Доступные тарифы</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-2xl border p-6 transition-all duration-300',
                plan.recommended ? t.cardSolid : t.card,
                plan.recommended ? a.border : t.border,
                plan.recommended ? 'shadow-[0_0_30px_rgba(0,0,0,0.1)]' : t.borderHover
              )}
            >
              {plan.recommended ? (
                <div
                  className={cn(
                    'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
                    a.planBg,
                    t.textStrong
                  )}
                >
                  Рекомендуем
                </div>
              ) : null}

              <div className="mb-6">
                <h4 className={cn('mb-2 text-lg font-medium', t.textStrong)}>{plan.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className={cn('text-4xl font-light tracking-tight', t.textStrong)}>{plan.price}</span>
                  <span className={t.textMuted}>{plan.period}</span>
                </div>
              </div>

              <div className={cn('mb-6 h-px w-full', plan.recommended ? `bg-gradient-to-r from-transparent ${a.planDivider} to-transparent opacity-20` : t.divider)} />

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className={cn('h-4 w-4', plan.recommended ? a.text : t.textSubtle)} />
                    <span className={cn('text-sm', t.text)}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={cn(
                  'w-full rounded-xl py-3 font-medium transition-all',
                  plan.recommended ? a.button : cn('border', t.border, t.textStrong, t.cardHover)
                )}
              >
                {plan.recommended ? 'Текущий тариф' : 'Выбрать тариф'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <GlowCard className="p-0">
        <div className={cn('border-b p-6', t.border)}>
          <h3 className={cn('text-lg font-medium', t.textStrong)}>Последние счета</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={cn('text-xs uppercase', t.textSubtle, t.tableHeader)}>
              <tr>
                <th className="px-6 py-4 font-medium">Счет</th>
                <th className="px-6 py-4 font-medium">Дата</th>
                <th className="px-6 py-4 font-medium">Тариф</th>
                <th className="px-6 py-4 font-medium">Сумма</th>
                <th className="px-6 py-4 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody className={cn('divide-y', t.border)}>
              {BILLING_HISTORY.map((invoice) => (
                <tr key={invoice.id} className={cn('transition-colors', t.cardHover)}>
                  <td className={cn('px-6 py-4 font-mono', t.textStrong)}>{invoice.id}</td>
                  <td className={cn('px-6 py-4', t.textMuted)}>{invoice.date}</td>
                  <td className={cn('px-6 py-4', t.text)}>{invoice.plan}</td>
                  <td className={cn('px-6 py-4 font-medium', t.textStrong)}>{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-xs font-medium',
                        invoice.status === 'paid'
                          ? cn(a.bgSoft, a.text, a.border)
                          : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500'
                      )}
                    >
                      {invoice.status === 'paid' ? 'Оплачен' : 'Ожидает'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [accent, setAccent] = useState<AccentType>('emerald');

  const t = THEMES[theme];
  const a = ACCENTS[accent];

  return (
    <ThemeContext.Provider value={{ theme, accent, t, a, setTheme, setAccent }}>
      <div className={cn('relative flex h-screen overflow-hidden font-sans transition-colors duration-500', t.bg, t.text, a.selection)}>
        <div
          className={cn(
            'relative z-10 flex w-64 flex-col border-r transition-colors duration-500',
            t.border,
            t.sidebar,
            theme === 'dark' ? 'backdrop-blur-xl' : 'backdrop-blur-md'
          )}
        >
          <div className="flex items-center p-6">
            <Logo theme={theme} accent={accent} className="h-8 w-auto" />
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto px-4 py-6">
            <div>
              <div className={cn('mb-3 px-4 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>Управление</div>
              <div className="space-y-1">
                <NavItem icon={Globe} label="Обзор" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <NavItem icon={CreditCard} label="Оплата и тарифы" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                <NavItem icon={Laptop} label="Устройства" active={activeTab === 'devices'} onClick={() => setActiveTab('devices')} />
              </div>
            </div>

            <div>
              <div className={cn('mb-3 px-4 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>Настройки</div>
              <div className="space-y-1">
                <NavItem icon={Settings} label="Параметры" active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} />
                <NavItem icon={LifeBuoy} label="Поддержка" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
              </div>
            </div>
          </div>

          <div className={cn('shrink-0 border-t px-6 py-4', t.border)}>
            <div className={cn('flex flex-wrap gap-x-3 gap-y-1 text-[11px]', t.textSubtle)}>
              <a href="/terms" className="transition-colors hover:underline">Условия</a>
              <a href="/privacy" className="transition-colors hover:underline">Конфиденциальность</a>
              <a href="/refund" className="transition-colors hover:underline">Возврат</a>
            </div>
            <div className={cn('mt-1.5 text-[10px]', t.textSubtle)}>© 2026 WW.pro</div>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div
              className={cn(
                'absolute -left-[500px] -top-[500px] h-[1000px] w-[1000px] rounded-full blur-[180px] transition-colors duration-1000',
                a.color,
                theme === 'dark' ? 'opacity-20' : 'opacity-[0.15]'
              )}
            />
          </div>

          <header
            className={cn(
              'relative z-10 flex h-20 shrink-0 items-center justify-between border-b px-8 transition-colors duration-500',
              t.border,
              theme === 'dark' ? 'bg-black/10 backdrop-blur-md' : 'bg-white/40 backdrop-blur-md'
            )}
          >
            <h1 className={cn('text-xl font-medium', t.textStrong)}>{TAB_LABELS[activeTab]}</h1>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className={cn('flex items-center gap-1.5 rounded-full border p-1.5 transition-colors', t.border, t.cardSolid)}>
                  {(Object.keys(ACCENTS) as AccentType[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setAccent(key)}
                      className={cn(
                        'h-4 w-4 rounded-full transition-all duration-300',
                        ACCENTS[key].color,
                        accent === key ? 'scale-110 ring-2 ring-current ring-offset-2' : 'scale-90 opacity-60 hover:scale-100 hover:opacity-100',
                        theme === 'dark' ? 'ring-offset-[#0a0a0a]' : 'ring-offset-white'
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'milky' : 'dark')}
                  className={cn(
                    'rounded-full border p-2 transition-colors',
                    t.border,
                    t.cardSolid,
                    t.textMuted,
                    theme === 'dark' ? 'hover:text-white' : 'hover:text-black'
                  )}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center gap-3 border-l border-inherit pl-6">
                <div className="hidden text-right md:block">
                  <div className={cn('text-sm font-medium', t.textStrong)}>Влад</div>
                  <div className={cn('text-xs', a.text)}>Тариф Pro</div>
                </div>
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-full border', t.border, t.cardSolid)}>
                  <span className={cn('text-sm font-medium', t.textStrong)}>В</span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-5xl">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' ? <OverviewTab key="overview" /> : null}
                {activeTab === 'billing' ? <BillingTab key="billing" /> : null}
                {['devices', 'preferences', 'support'].includes(activeTab) ? (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn('flex flex-col items-center justify-center py-20 text-center', t.textMuted)}
                  >
                    <AlertCircle className="mb-4 h-12 w-12 opacity-20" />
                    <h3 className={cn('mb-2 text-lg font-medium', t.textStrong)}>Скоро будет</h3>
                    <p className="max-w-sm">
                      Этот раздел еще в разработке. Скоро здесь появится полноценный интерфейс.
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
