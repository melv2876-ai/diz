import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Logo } from '../../components/Logo';
import {
  Bell,
  CaretDown,
  CaretRight,
  CheckCircle,
  Clock,
  CreditCard,
  DownloadSimple,
  Envelope,
  FileCode,
  Gift,
  Globe,
  Info,
  Laptop,
  Lifebuoy,
  Lightning,
  Megaphone,
  Moon,
  GearSix,
  RocketLaunch,
  ShieldCheck,
  SignOut,
  Sun,
  TelegramLogo,
  User,
  Wallet,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const ICON_WEIGHT = 'duotone' as const;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── Notification System ── */
type NotificationType = 'promo' | 'info' | 'success' | 'system';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  action?: { label: string; href: string };
};

const NOTIFICATION_ICONS: Record<NotificationType, any> = {
  promo: Gift,
  info: Info,
  success: CheckCircle,
  system: Megaphone,
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'promo',
    title: 'Бонус 5 дней бесплатно',
    body: 'Привяжите Telegram-аккаунт и получите 5 дней VPN в подарок',
    time: 'Сейчас',
    read: false,
    action: { label: 'Получить', href: '#' },
  },
  {
    id: '2',
    type: 'success',
    title: 'Вход выполнен',
    body: 'Новый вход через Telegram с устройства macOS',
    time: '2 мин назад',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Обновление серверов',
    body: 'Добавлены новые локации: Стамбул, Варшава',
    time: '1 час назад',
    read: true,
  },
];

type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  dismiss: (id: string) => void;
  markAllRead: () => void;
  addToast: (n: Omit<Notification, 'id' | 'read'>) => void;
};

const NotificationCtx = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  dismiss: () => {},
  markAllRead: () => {},
  addToast: () => {},
});

const useNotifications = () => useContext(NotificationCtx);

type Toast = Notification & { expiresAt: number };

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const dismiss = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const addToast = (n: Omit<Notification, 'id' | 'read'>) => {
    const id = Date.now().toString();
    const notification: Notification = { ...n, id, read: false };
    setNotifications((prev) => [notification, ...prev]);
    setToasts((prev) => [...prev, { ...notification, expiresAt: Date.now() + 4000 }]);
  };

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setInterval(() => {
      setToasts((prev) => prev.filter((t) => t.expiresAt > Date.now()));
    }, 500);
    return () => clearInterval(timer);
  }, [toasts.length]);

  return (
    <NotificationCtx.Provider value={{ notifications, unreadCount, dismiss, markAllRead, addToast }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </NotificationCtx.Provider>
  );
};

/* ── Toast Stack ── */
const ToastStack = ({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) => {
  const { t, a } = useContext(ThemeContext);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-2">
      <AnimatePresence>
        {toasts.slice(-3).map((toast) => {
          const IconComp = NOTIFICATION_ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
              className={cn(
                'pointer-events-auto flex w-80 items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl',
                t.cardSolid, a.border
              )}
            >
              <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', a.bgSoft)}>
                <IconComp weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn('text-xs font-medium', t.textStrong)}>{toast.title}</div>
                <div className={cn('mt-0.5 text-[11px] leading-relaxed', t.textMuted)}>{toast.body}</div>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className={cn('shrink-0 rounded-full p-0.5 transition-colors', t.textSubtle, 'hover:bg-white/10')}
              >
                <X weight="bold" className="h-3 w-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

/* ── Notification Panel (bell dropdown) ── */
const NotificationPanel = () => {
  const { t, a } = useContext(ThemeContext);
  const { notifications, unreadCount, dismiss, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative rounded-full border p-2 transition-all duration-300',
          t.cardSolid,
          unreadCount > 0 && !open
            ? cn(a.border, a.text)
            : cn(t.border, t.textMuted),
          'hover:text-inherit'
        )}
      >
        <motion.div
          animate={unreadCount > 0 && !open ? { rotate: [0, 12, -12, 8, -8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2.5 }}
        >
          <Bell weight={unreadCount > 0 ? 'fill' : (open ? 'fill' : ICON_WEIGHT)} className="h-4 w-4" />
        </motion.div>
        {unreadCount > 0 ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold',
              a.color, 'text-black'
            )}
          >
            {unreadCount}
          </motion.span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border-2 shadow-[0_8px_40px_rgba(0,0,0,0.5)]',
              a.border, t.cardSolid, 'backdrop-blur-xl'
            )}
          >
            {/* Header */}
            <div className={cn('flex items-center justify-between border-b px-4 py-3', t.border)}>
              <span className={cn('text-xs font-medium', t.textStrong)}>Уведомления</span>
              {notifications.length > 0 ? (
                <button
                  onClick={markAllRead}
                  className={cn('text-[10px] font-medium transition-opacity hover:opacity-70', a.text)}
                >
                  Прочитать все
                </button>
              ) : null}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className={cn('px-4 py-8 text-center text-xs', t.textSubtle)}>
                  Нет уведомлений
                </div>
              ) : (
                notifications.map((n) => {
                  const IconComp = NOTIFICATION_ICONS[n.type];
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'group relative flex items-start gap-3 px-4 py-3 transition-colors',
                        !n.read && a.bgSoft,
                        t.cardHover
                      )}
                    >
                      <div className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                        n.type === 'promo' ? a.bgSoft : t.card
                      )}>
                        <IconComp
                          weight={n.type === 'promo' ? 'fill' : ICON_WEIGHT}
                          className={cn('h-3.5 w-3.5', n.type === 'promo' ? a.text : t.textMuted)}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className={cn('text-xs font-medium', t.textStrong)}>{n.title}</span>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <span className={cn('text-[10px]', t.textSubtle)}>{n.time}</span>
                            <button
                              onClick={() => dismiss(n.id)}
                              className={cn(
                                'rounded-full p-0.5 opacity-0 transition-all group-hover:opacity-100',
                                t.textSubtle, 'hover:bg-white/10'
                              )}
                            >
                              <X weight="bold" className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                        <p className={cn('mt-0.5 text-[11px] leading-relaxed', t.textMuted)}>{n.body}</p>
                        {n.action ? (
                          <a
                            href={n.action.href}
                            className={cn('mt-1.5 inline-block text-[11px] font-medium transition-opacity hover:opacity-80', a.text)}
                          >
                            {n.action.label} →
                          </a>
                        ) : null}
                      </div>
                      {!n.read ? (
                        <div className={cn('absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full', a.color)} />
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

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
    divide: 'divide-white/[0.05]',
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
    divide: 'divide-black/[0.05]',
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
  hasSubscription: boolean;
  setTheme: (theme: ThemeType) => void;
  setAccent: (accent: AccentType) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark' as ThemeType,
  accent: 'emerald' as AccentType,
  t: THEMES.dark,
  a: ACCENTS.emerald,
  hasSubscription: false,
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

type PaymentMethod = 'yukassa' | 'cryptobot';

const SUB_PLANS = [
  { id: '1m', months: 1, label: '1 месяц', oldPrice: 199, price: 99, perMonth: 99, badge: null, highlighted: false },
  { id: '3m', months: 3, label: '3 месяца', oldPrice: 597, price: 249, perMonth: 83, badge: 'optimal' as const, highlighted: true },
  { id: '6m', months: 6, label: '6 месяцев', oldPrice: 1194, price: 449, perMonth: 75, badge: null, highlighted: false },
  { id: '12m', months: 12, label: '12 месяцев', oldPrice: 2388, price: 749, perMonth: 62, badge: 'best' as const, highlighted: false },
];

const BILLING_HISTORY = [
  { id: 'INV-2024-001', date: '15 окт 2024', amount: '$9.99', status: 'paid', plan: 'Тариф Pro' },
  { id: 'INV-2024-002', date: '15 ноя 2024', amount: '$9.99', status: 'paid', plan: 'Тариф Pro' },
  { id: 'INV-2024-003', date: '15 дек 2024', amount: '$9.99', status: 'pending', plan: 'Тариф Pro' },
];

const SERVERS = [
  { country: 'Германия', city: 'Франкфурт', flag: '🇩🇪', ping: '24 мс' },
  { country: 'Нидерланды', city: 'Амстердам', flag: '🇳🇱', ping: '28 мс' },
  { country: 'Финляндия', city: 'Хельсинки', flag: '🇫🇮', ping: '32 мс' },
  { country: 'США', city: 'Нью-Йорк', flag: '🇺🇸', ping: '89 мс' },
  { country: 'Великобритания', city: 'Лондон', flag: '🇬🇧', ping: '36 мс' },
  { country: 'Турция', city: 'Стамбул', flag: '🇹🇷', ping: '48 мс' },
];

const TAB_LABELS = {
  overview: 'Личный кабинет',
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
        <Icon weight={ICON_WEIGHT} className={cn('h-5 w-5 transition-colors', active ? a.textLight : t.textMuted)} />
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
  const { t, a, hasSubscription, theme } = useContext(ThemeContext);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setSelectedPayment(null);
    setTimeout(() => paymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleSelectPayment = (method: PaymentMethod) => {
    setSelectedPayment(method);
    setTimeout(() => receiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const activePlan = SUB_PLANS.find((p) => p.id === selectedPlan);

  /* mock receipt data */
  const mockTxId = '314f6ca2-000f-5000-b000-1ddc0bff50c6';
  const mockUserId = '865413405';
  const accessDate = new Date();
  if (activePlan) accessDate.setDate(accessDate.getDate() + activePlan.months * 30);
  const formatDate = (d: Date) => d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (!hasSubscription) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* ── Step 1: Welcome ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={cn('relative overflow-hidden rounded-2xl border p-6', t.card, a.border)}
        >
          <div className={cn('pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full opacity-15 blur-[100px]', a.blur1)} />
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={cn('mb-3 text-2xl font-light tracking-tight', t.textStrong)}
            >
              Рады видеть вас, <span className={a.text}>Влад</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className={cn('mb-1.5 text-sm leading-relaxed', t.text)}
            >
              Подключение к быстрому VPN — три простых шага.
              Всё займёт не больше минуты.
            </motion.p>
            <div className="mt-5 space-y-3">
              {[
                { step: '1', icon: Wallet, title: 'Оплатите тариф', desc: 'Выберите подходящий план ниже и оплатите удобным способом' },
                { step: '2', icon: DownloadSimple, title: 'Скачайте приложение', desc: 'Установите WireGuard на нужное устройство — ПК, телефон или роутер' },
                { step: '3', icon: ShieldCheck, title: 'Активируйте подписку', desc: 'Вернитесь в кабинет, скачайте конфиг и импортируйте его в приложение' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.15 }}
                  className="flex items-start gap-3"
                >
                  <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', a.bgSoft)}>
                    <item.icon weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5', a.text)} />
                  </div>
                  <div className="min-w-0">
                    <div className={cn('text-sm font-medium', t.textStrong)}>{item.title}</div>
                    <div className={cn('text-xs leading-relaxed', t.textMuted)}>{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Step 2: Pick a plan ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <h3 className={cn('mb-4 text-sm font-medium', t.textMuted)}>Шаг 1 — Выберите тариф</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUB_PLANS.map((plan, i) => {
              const isSelected = selectedPlan === plan.id;
              const discount = Math.round((1 - plan.price / plan.oldPrice) * 100);
              const hasBorder = plan.highlighted || plan.badge === 'best';

              return (
                <motion.button
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.3 + i * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={cn(
                    'group relative flex flex-col items-start overflow-hidden rounded-2xl border p-6 text-left transition-all duration-500',
                    isSelected
                      ? cn(t.cardSolid, a.border, 'shadow-[0_0_30px_rgba(0,0,0,0.12)]')
                      : hasBorder
                        ? cn(t.card, plan.badge === 'best' ? 'border-amber-500/30' : a.border)
                        : cn(t.card, t.border, t.borderHover)
                  )}
                >
                  {/* GlowCard hover effect */}
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-opacity duration-500',
                      a.glowCard,
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                  />

                  <div className="relative z-10 flex w-full flex-1 flex-col">
                    <span className={cn('mb-3 text-sm font-medium', t.textStrong)}>{plan.label}</span>
                    <span className={cn('text-xs line-through', t.textSubtle)}>{plan.oldPrice}₽</span>
                    <span className={cn('text-3xl font-light tracking-tight', t.textStrong)}>{plan.price}₽</span>
                    <span className={cn('mt-1 text-xs', t.textMuted)}>{plan.perMonth}₽ / мес</span>
                    <div className={cn('mt-3 w-fit rounded-full border px-2 py-0.5 text-[10px] font-medium', a.bgSoft, a.text, a.border)}>
                      −{discount}%
                    </div>
                  </div>

                  {/* Badge — compact, bottom-right */}
                  {plan.badge === 'optimal' ? (
                    <span className={cn('absolute bottom-2.5 right-2.5 rounded-full px-2 py-0.5 text-[9px] font-medium', a.bgSoft, a.text)}>
                      Оптимальный
                    </span>
                  ) : plan.badge === 'best' ? (
                    <span className="absolute bottom-2.5 right-2.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-medium text-amber-500">
                      Лучшее предложение
                    </span>
                  ) : null}

                  {/* Selection dot */}
                  <AnimatePresence>
                    {isSelected ? (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn('absolute right-3 top-3 h-2.5 w-2.5 rounded-full', a.color)}
                      />
                    ) : null}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Step 5: Payment method ── */}
        <AnimatePresence>
          {selectedPlan ? (
            <motion.div
              ref={paymentRef}
              key="payment"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h3 className={cn('text-sm font-medium', t.textMuted)}>Шаг 2 — Способ оплаты</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* YuKassa */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectPayment('yukassa')}
                  className={cn(
                    'group relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300',
                    selectedPayment === 'yukassa'
                      ? cn(t.cardSolid, a.border)
                      : cn(t.card, t.border, t.borderHover)
                  )}
                >
                  <div className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-opacity duration-500',
                    a.glowCard,
                    selectedPayment === 'yukassa' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )} />
                  <div className="relative z-10 flex w-full items-center gap-3">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', a.bgSoft)}>
                      <CreditCard weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
                    </div>
                    <div className="flex-1">
                      <div className={cn('text-sm font-medium', t.textStrong)}>ЮKassa</div>
                      <div className={cn('text-[11px]', t.textMuted)}>Карта, СБП, кошельки</div>
                    </div>
                    {selectedPayment === 'yukassa' ? (
                      <div className={cn('h-2.5 w-2.5 rounded-full', a.color)} />
                    ) : null}
                  </div>
                </motion.button>

                {/* Cryptobot */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectPayment('cryptobot')}
                  className={cn(
                    'group relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300',
                    selectedPayment === 'cryptobot'
                      ? cn(t.cardSolid, a.border)
                      : cn(t.card, t.border, t.borderHover)
                  )}
                >
                  <div className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-opacity duration-500',
                    a.glowCard,
                    selectedPayment === 'cryptobot' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )} />
                  <div className="relative z-10 flex w-full items-center gap-3">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-medium', a.bgSoft, a.text)}>BTC</div>
                    <div className="flex-1">
                      <div className={cn('text-sm font-medium', t.textStrong)}>Cryptobot</div>
                      <div className={cn('text-[11px]', t.textMuted)}>Крипто через Telegram</div>
                    </div>
                    {selectedPayment === 'cryptobot' ? (
                      <div className={cn('h-2.5 w-2.5 rounded-full', a.color)} />
                    ) : null}
                  </div>
                </motion.button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Step 6: Receipt + Pay ── */}
        <AnimatePresence>
          {selectedPayment && activePlan ? (
            <motion.div
              ref={receiptRef}
              key="receipt"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Receipt */}
              <div className={cn('overflow-hidden rounded-2xl border', t.card, a.border)}>
                <div className={cn('flex items-center gap-2.5 border-b px-5 py-4', a.border, a.bgSoft)}>
                  <div className={cn('flex h-5 w-5 items-center justify-center rounded-full', a.color)}>
                    <ShieldCheck weight="fill" className="h-3 w-3 text-black" />
                  </div>
                  <span className={cn('text-sm font-medium', t.textStrong)}>Счёт сформирован</span>
                </div>
                <div className={cn('divide-y px-5', t.divide)}>
                  <div className="flex items-center justify-between py-3">
                    <span className={cn('text-xs', t.textMuted)}>ID пользователя</span>
                    <span className={cn('font-mono text-xs', a.text)}>{mockUserId}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-3">
                    <span className={cn('shrink-0 text-xs', t.textMuted)}>Транзакция</span>
                    <span className={cn('break-all text-right font-mono text-[11px]', a.text)}>{mockTxId}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className={cn('text-xs', t.textMuted)}>Тариф</span>
                    <span className={cn('text-xs', t.textStrong)}>{activePlan.label} ({activePlan.months * 30} дн.)</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className={cn('text-xs', t.textMuted)}>Сумма</span>
                    <span className={cn('text-sm font-medium', a.text)}>{activePlan.price} ₽</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className={cn('text-xs', t.textMuted)}>Оплата</span>
                    <span className={cn('text-xs', t.textStrong)}>
                      {selectedPayment === 'yukassa' ? 'Карта / СБП' : 'Криптовалюта'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className={cn('text-xs', t.textMuted)}>Доступ до</span>
                    <span className={cn('text-xs', t.textStrong)}>{formatDate(accessDate)}</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className={cn('flex items-center gap-3 rounded-xl border p-4', a.border, a.bgSoft)}>
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', a.color)}>
                  <RocketLaunch weight="fill" className="h-4 w-4 text-black" />
                </div>
                <div>
                  <p className={cn('text-xs font-medium leading-relaxed', t.textStrong)}>
                    Подписка активируется мгновенно
                  </p>
                  <p className={cn('text-[11px] leading-relaxed', t.textMuted)}>
                    Если что-то пойдёт не так — нажмите «Проверить оплату»
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={cn('w-full rounded-2xl py-4 text-center text-sm font-semibold tracking-wide transition-all', a.button)}
              >
                Перейти к оплате →
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.2 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full rounded-2xl border py-3.5 text-center text-xs font-medium transition-all',
                  a.buttonOutline
                )}
              >
                Проверить оплату
              </motion.button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    );
  }

  /* ── Active subscription view (original) ── */
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
              <ShieldCheck weight={ICON_WEIGHT} className="h-4 w-4" />
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
                      <Laptop weight={ICON_WEIGHT} className={cn('h-5 w-5', t.textMuted)} />
                    ) : (
                      <Globe weight={ICON_WEIGHT} className={cn('h-5 w-5', t.textMuted)} />
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
                  <DownloadSimple weight={ICON_WEIGHT} className={cn('h-5 w-5', t.textMuted, `group-hover:${a.text}`)} />
                  <span className={cn('text-sm font-medium', t.textStrong)}>Скачать приложение</span>
                </div>
                <CaretRight weight="bold" className={cn('h-4 w-4', t.textSubtle)} />
              </button>
              <button className={cn('group flex w-full items-center justify-between rounded-xl border p-3 transition-colors', t.card, t.border, t.borderHover)}>
                <div className="flex items-center gap-3">
                  <FileCode weight={ICON_WEIGHT} className={cn('h-5 w-5', t.textMuted, `group-hover:${a.text}`)} />
                  <span className={cn('text-sm font-medium', t.textStrong)}>Конфиги WireGuard</span>
                </div>
                <CaretRight weight="bold" className={cn('h-4 w-4', t.textSubtle)} />
              </button>
            </div>
          </GlowCard>

          <GlowCard className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', a.bgSoft, a.text)}>
                <Lightning weight={ICON_WEIGHT} className="h-5 w-5" />
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
      className="space-y-6"
    >
      <div>
        <h3 className={cn('mb-6 text-xl font-medium', t.textStrong)}>Доступные тарифы</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUB_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-2xl border p-6 transition-all duration-300',
                plan.highlighted ? t.cardSolid : t.card,
                plan.highlighted ? a.border : t.border,
                plan.highlighted ? 'shadow-[0_0_30px_rgba(0,0,0,0.1)]' : t.borderHover
              )}
            >
              {plan.badge === 'optimal' ? (
                <div
                  className={cn(
                    'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                    a.bgSoft, a.text, a.border
                  )}
                >
                  Оптимальный
                </div>
              ) : plan.badge === 'best' ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                  Лучшее предложение
                </div>
              ) : null}

              <div className="mb-4">
                <h4 className={cn('mb-2 text-lg font-medium', t.textStrong)}>{plan.label}</h4>
                <span className={cn('text-sm line-through', t.textSubtle)}>{plan.oldPrice}₽</span>
                <div className="flex items-baseline gap-1">
                  <span className={cn('text-4xl font-light tracking-tight', t.textStrong)}>{plan.price}₽</span>
                </div>
                <span className={cn('mt-1 text-xs', t.textMuted)}>{plan.perMonth}₽ / мес</span>
              </div>

              <div className={cn('mb-4 h-px w-full', plan.highlighted ? `bg-gradient-to-r from-transparent ${a.planDivider} to-transparent opacity-20` : t.divider)} />

              <button
                className={cn(
                  'w-full rounded-xl py-3 font-medium transition-all',
                  plan.highlighted ? a.button : cn('border', t.border, t.textStrong, t.cardHover)
                )}
              >
                Выбрать тариф
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
            <tbody className={cn('divide-y', t.divide)}>
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

/* ── Profile Popover ── */
const CONNECTED_ACCOUNTS = {
  telegram: { connected: true, label: 'Telegram', name: '@vlad_dev' },
  email: { connected: false, label: 'Почта', name: null },
};

const ProfilePopover = () => {
  const { t, a, hasSubscription } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-3 rounded-xl border px-3 py-2 transition-all',
          t.border, open ? t.card : 'bg-transparent', t.borderHover
        )}
      >
        <div className="hidden text-right md:block">
          <div className={cn('text-sm font-medium', t.textStrong)}>Влад</div>
          <div className={cn('text-xs', hasSubscription ? a.text : t.textSubtle)}>
            {hasSubscription ? 'Тариф Pro' : 'Без подписки'}
          </div>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full border', t.border, t.cardSolid)}>
          <span className={cn('text-sm font-medium', t.textStrong)}>В</span>
        </div>
        <CaretDown weight="bold" className={cn('hidden h-3 w-3 transition-transform md:block', t.textSubtle, open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border shadow-2xl',
              t.border,
              t.cardSolid,
              'backdrop-blur-xl'
            )}
          >
            {/* User header */}
            <div className={cn('border-b px-4 py-4', t.border)}>
              <div className="flex items-center gap-3">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-full', a.bgSoft)}>
                  <User weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={cn('text-sm font-medium', t.textStrong)}>Влад</div>
                  <div className={cn('truncate text-xs', t.textMuted)}>@vlad_dev</div>
                </div>
                <div className={cn(
                  'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                  hasSubscription ? cn(a.bgSoft, a.text, a.border) : cn(t.card, t.textSubtle, t.border)
                )}>
                  {hasSubscription ? 'Pro' : 'Free'}
                </div>
              </div>
            </div>

            {/* Connected accounts */}
            <div className={cn('border-b px-2 py-2', t.border)}>
              <div className={cn('px-2 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>
                Привязанные аккаунты
              </div>
              {([
                { key: 'telegram', icon: TelegramLogo, ...CONNECTED_ACCOUNTS.telegram },
                { key: 'email', icon: Envelope, ...CONNECTED_ACCOUNTS.email },
              ] as const).map((acc) => (
                <button
                  key={acc.key}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    t.cardHover
                  )}
                >
                  <acc.icon weight={ICON_WEIGHT} className={cn('h-4 w-4 shrink-0', acc.connected ? a.text : t.textSubtle)} />
                  <span className={cn('flex-1 text-xs', t.text)}>{acc.label}</span>
                  {acc.connected ? (
                    <span className={cn('text-[10px] font-medium', a.text)}>{acc.name}</span>
                  ) : (
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', a.buttonOutline)}>
                      Привязать
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className={cn('border-b px-2 py-2', t.border)}>
              <button
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                  t.cardHover
                )}
              >
                <GearSix weight={ICON_WEIGHT} className={cn('h-4 w-4 shrink-0', t.textMuted)} />
                <span className={cn('flex-1 text-xs', t.text)}>Настройки аккаунта</span>
              </button>
            </div>

            {/* Logout */}
            <div className="px-2 py-2">
              <button
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                  t.cardHover
                )}
              >
                <SignOut weight={ICON_WEIGHT} className={cn('h-4 w-4 shrink-0', t.textMuted)} />
                <span className={cn('text-xs', t.textMuted)}>Выйти</span>
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [accent, setAccent] = useState<AccentType>('emerald');
  const [hasSubscription] = useState(false);

  const t = THEMES[theme];
  const a = ACCENTS[accent];

  return (
    <ThemeContext.Provider value={{ theme, accent, t, a, hasSubscription, setTheme, setAccent }}>
      <NotificationProvider>
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
                <NavItem icon={Globe} label="Личный кабинет" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <NavItem icon={CreditCard} label="Оплата и тарифы" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                <NavItem icon={Laptop} label="Устройства" active={activeTab === 'devices'} onClick={() => setActiveTab('devices')} />
              </div>
            </div>

            <div>
              <div className={cn('mb-3 px-4 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>Настройки</div>
              <div className="space-y-1">
                <NavItem icon={GearSix} label="Параметры" active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} />
                <NavItem icon={Lifebuoy} label="Поддержка" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
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

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
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
              'relative z-30 flex h-20 shrink-0 items-center justify-between border-b px-8 transition-colors duration-500',
              t.border,
              theme === 'dark' ? 'bg-black/10 backdrop-blur-md' : 'bg-white/40 backdrop-blur-md'
            )}
          >
            <h1 className={cn('text-xl font-medium', t.textStrong)}>{TAB_LABELS[activeTab]}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
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
                  {theme === 'dark' ? <Sun weight={ICON_WEIGHT} className="h-4 w-4" /> : <Moon weight={ICON_WEIGHT} className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center gap-4 border-l border-inherit pl-4">
                <ProfilePopover />
                <NotificationPanel />
              </div>
            </div>
          </header>

          <main className="relative z-10 flex-1 overflow-y-auto p-8">
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
                    <WarningCircle weight={ICON_WEIGHT} className="mb-4 h-12 w-12 opacity-20" />
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
      </NotificationProvider>
    </ThemeContext.Provider>
  );
}
