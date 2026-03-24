import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Logo } from '../../components/Logo';
import {
  AppleLogo,
  Bell,
  BellRinging,
  CalendarBlank,
  CaretDown,
  CaretRight,
  CellSignalFull,
  CheckCircle,
  Clock,
  ClipboardText,
  Copy,
  CreditCard,
  Crown,
  Desktop,
  Devices,
  DeviceMobile,
  Diamond,
  DownloadSimple,
  Envelope,
  EnvelopeOpen,
  FileCode,
  Gift,
  Globe,
  GooglePlayLogo,
  HandHeart,
  Fingerprint,
  Info,
  Laptop,
  Lifebuoy,
  MagnifyingGlass,
  Megaphone,
  Moon,
  GearSix,
  Plugs,
  QrCode,
  RocketLaunch,
  ShareNetwork,
  ShieldCheck,
  ShoppingCartSimple,
  SignOut,
  Star,
  Sun,
  TelegramLogo,
  Television,
  Trash,
  User,
  UserPlus,
  PencilSimple,
  Lock,
  Users,
  Wallet,
  WhatsappLogo,
  WarningCircle,
  WifiSlash,
  X,
  Binoculars,
  ChatCircleDots,
  PaperPlaneTilt,
  Question,
  ArrowRight,
  Detective,
  Ear,
  Eye,
  Ghost,
  Sparkle,
  Lightning,
  Confetti,
  Timer,
  Coins,
  ShieldStar,
  PersonArmsSpread,
  MagicWand,
  Parachute,
  Meteor,
  Compass,
  Seal,
  SealCheck,
  Feather,
  Spiral,
  Planet,
  Atom,
  Hexagon,
  Flower,
  HandPeace,
  List,
  Paperclip,
  Smiley,
  ImageSquare,
  Check,
  Checks,
  Receipt,
  ClockCounterClockwise,
  ArrowSquareOut,
  Headset,
  CaretLeft,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useIsMobile, useDeviceOverride, MobileProvider } from '../../hooks/use-mobile';

const ICON_WEIGHT = 'duotone' as const;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── PWA Install Prompt ── */
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const pwaListeners = new Set<() => void>();

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', ((e: Event) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    pwaListeners.forEach((fn) => fn());
  }) as EventListener);

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    pwaListeners.forEach((fn) => fn());
  });
}

/* ── Notification System ── */
type NotificationType = 'promo' | 'info' | 'success' | 'system';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  fullBody?: string;
  time: string;
  read: boolean;
  starred?: boolean;
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
    fullBody: 'Здравствуйте!\n\nМы подготовили для вас специальное предложение: привяжите Telegram-аккаунт к вашему профилю WW.pro и получите 5 дней бесплатного VPN-доступа.\n\nКак получить бонус:\n\n1. Перейдите в настройки профиля\n2. Нажмите «Привязать Telegram»\n3. Подтвердите аккаунт через бота @wwpro_bot\n4. 5 дней будут начислены автоматически\n\nПредложение действует для всех новых пользователей. Привязка занимает менее минуты.\n\nС уважением,\nКоманда WW.pro',
    time: 'Сейчас',
    read: false,
    starred: true,
    action: { label: 'Получить', href: '#' },
  },
  {
    id: '2',
    type: 'success',
    title: 'Вход выполнен',
    body: 'Новый вход через Telegram с устройства macOS',
    fullBody: 'Зафиксирован новый вход в ваш аккаунт.\n\nДетали:\n• Метод: Telegram OAuth\n• Устройство: macOS (MacBook Pro)\n• Браузер: Safari 18.2\n• IP: 185.220.xx.xx\n• Локация: Москва, Россия\n• Время: 14 марта 2026, 15:42 MSK\n\nЕсли это были не вы — немедленно смените пароль и обратитесь в службу поддержки.\n\nБезопасность вашего аккаунта — наш приоритет.',
    time: '2 мин назад',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Обновление серверов',
    body: 'Добавлены новые локации: Стамбул, Варшава',
    fullBody: 'Мы расширили нашу серверную инфраструктуру!\n\nНовые локации:\n\n🇹🇷 Стамбул, Турция\n— Пинг из Москвы: ~48 мс\n— Оптимально для доступа к турецким сервисам\n\n🇵🇱 Варшава, Польша\n— Пинг из Москвы: ~35 мс\n— Быстрое подключение к европейским ресурсам\n\nОба сервера уже доступны в приложении Hub. Просто выберите новую локацию из списка серверов.\n\nМы продолжаем расширять географию — следующие на очереди: Сеул и Сингапур.\n\nСпасибо, что выбираете WW.pro!',
    time: '1 час назад',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Плановое обслуживание серверов',
    body: 'Серверы Франкфурт и Амстердам будут недоступны 16 марта с 03:00 до 05:00 MSK',
    fullBody: 'Уважаемый пользователь!\n\nСообщаем о предстоящем плановом обслуживании серверной инфраструктуры.\n\n📅 Дата: 16 марта 2026\n🕐 Время: 03:00 — 05:00 MSK\n🌍 Затронутые серверы: Франкфурт (DE), Амстердам (NL)\n\nНа время обслуживания:\n• Подключения к указанным серверам будут временно прерваны\n• Автоматическое переключение на ближайший доступный сервер\n• Все остальные локации работают в штатном режиме\n\nЧто мы делаем:\n— Обновление ядра WireGuard до версии 1.0.20260315\n— Оптимизация маршрутизации трафика\n— Увеличение пропускной способности на 40%\n\nПриносим извинения за возможные неудобства. После завершения работ вы заметите значительное улучшение скорости.\n\nС уважением,\nТехническая команда WW.pro',
    time: '3 часа назад',
    read: true,
    starred: true,
  },
  {
    id: '5',
    type: 'promo',
    title: 'Весенняя скидка 30%',
    body: 'Только до 31 марта — годовой тариф со скидкой 30%',
    fullBody: '🌸 Весенняя акция WW.pro!\n\nТолько до 31 марта 2026 года — специальная скидка 30% на годовой тариф Pro.\n\nЧто входит:\n✓ Безлимитный VPN-трафик\n✓ Все серверные локации\n✓ До 5 устройств одновременно\n✓ Белые списки\n✓ Приоритетная поддержка\n\n💰 Было: 2 388 ₽/год\n💚 Стало: 1 672 ₽/год (139 ₽/мес)\n\nПромокод: SPRING2026\n\nАктивируйте в разделе «Личный кабинет» при оформлении подписки.\n\nУсловия:\n— Промокод одноразовый\n— Действует только на годовой тариф\n— Не суммируется с другими скидками\n\nНе упустите возможность!',
    time: 'Вчера',
    read: true,
    action: { label: 'Активировать', href: '#' },
  },
  {
    id: '6',
    type: 'info',
    title: 'Новая версия приложения Hub v2.4',
    body: 'Доступно обновление — улучшена скорость и стабильность',
    fullBody: 'Доступна новая версия приложения Hub v2.4!\n\nЧто нового:\n\n🚀 Производительность\n— Скорость подключения улучшена на 25%\n— Уменьшено потребление батареи на мобильных устройствах\n— Оптимизирован расход оперативной памяти\n\n🛡️ Безопасность\n— Обновлён протокол WireGuard\n— Добавлена защита от DNS-утечек\n— Улучшено обнаружение нестабильных соединений\n\n✨ Интерфейс\n— Новый виджет быстрого подключения\n— Статус серверов в реальном времени\n— Тёмная тема по умолчанию\n\nОбновите приложение через App Store или скачайте актуальную версию на сайте.',
    time: '2 дня назад',
    read: true,
  },
];

type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  dismiss: (id: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  toggleStar: (id: string) => void;
  addToast: (n: Omit<Notification, 'id' | 'read'>) => void;
};

const NotificationCtx = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  dismiss: () => {},
  markAllRead: () => {},
  markRead: () => {},
  toggleStar: () => {},
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

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const toggleStar = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n)));

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
    <NotificationCtx.Provider value={{ notifications, unreadCount, dismiss, markAllRead, markRead, toggleStar, addToast }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </NotificationCtx.Provider>
  );
};

/* ── Toast Stack ── */
const ToastStack = ({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) => {
  const { t, a } = useContext(ThemeContext);
  const isMobile = useIsMobile();

  return (
    <div
      className={cn('pointer-events-none fixed z-[100] flex flex-col-reverse gap-2', isMobile ? 'left-4 right-4' : 'right-6 w-80')}
      style={{ bottom: isMobile ? 'calc(24px + var(--safe-bottom, 0px))' : '24px' }}
    >
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
                'pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl',
                isMobile ? 'w-full' : 'w-80',
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
                className={cn('shrink-0 rounded-full p-2 transition-colors', t.textSubtle, 'hover:bg-white/10')}
              >
                <X weight="bold" className="h-3.5 w-3.5" />
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
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Close on outside click/tap */
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    if (open && !isMobile) {
      document.addEventListener('mousedown', handler);
      document.addEventListener('touchstart', handler);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open, isMobile]);

  /* Lock body scroll on mobile */
  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open, isMobile]);

  const dropdown = (
    <AnimatePresence>
      {open ? (
        <>
          {isMobile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
          ) : null}
          <motion.div
            ref={panelRef}
            initial={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, y: 8, scale: 0.96 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={isMobile ? { type: 'spring', bounce: 0.15, duration: 0.4 } : { duration: 0.2 }}
            className={cn(
              isMobile
                ? 'fixed inset-x-0 bottom-0 z-[61] overflow-hidden rounded-t-2xl border-t shadow-2xl'
                : 'absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border shadow-2xl',
              a.border, t.panel, 'backdrop-blur-xl'
            )}
            style={isMobile ? { maxHeight: 'calc(85vh - var(--safe-top, 0px))', paddingBottom: 'var(--safe-bottom, 0px)' } : undefined}
          >
            {/* Header */}
            <div className={cn('flex shrink-0 items-center justify-between border-b px-4 py-3', t.border)}>
              <span className={cn('text-xs font-medium', t.textStrong)}>Уведомления</span>
              <div className="flex items-center gap-3">
                {notifications.length > 0 ? (
                  <button
                    onClick={markAllRead}
                    className={cn('text-[10px] font-medium transition-opacity hover:opacity-70', a.text)}
                  >
                    Прочитать все
                  </button>
                ) : null}
                {isMobile ? (
                  <button onClick={() => setOpen(false)} className={cn('rounded-full p-1.5', t.textSubtle, t.navHover)}>
                    <X weight="bold" className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* List */}
            <div className={cn('overflow-y-auto', isMobile ? 'max-h-[60vh]' : 'max-h-80', isMobile && 'overscroll-contain')}>
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
                                'rounded-full p-1 transition-all',
                                isMobile ? 'opacity-60' : 'opacity-0 group-hover:opacity-100',
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
        </>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative rounded-full p-2 transition-all duration-300',
          open
            ? cn(a.text, a.bgSoft)
            : unreadCount > 0
              ? a.text
              : t.textMuted,
        )}
      >
        <motion.div
          animate={unreadCount > 0 && !open ? { rotate: [0, 12, -12, 8, -8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2.5 }}
        >
          <Bell weight={unreadCount > 0 ? 'fill' : (open ? 'fill' : ICON_WEIGHT)} className="h-[18px] w-[18px]" />
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

      {isMobile ? createPortal(dropdown, document.body) : dropdown}
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
    panel: 'bg-[#161616]',
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
    panel: 'bg-[#f3f0eb]',
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
  setHasSubscription: (v: boolean) => void;
  setTheme: (theme: ThemeType) => void;
  setAccent: (accent: AccentType) => void;
  navigateTab: (tab: TabType, scrollTo?: string) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark' as ThemeType,
  accent: 'emerald' as AccentType,
  t: THEMES.dark,
  a: ACCENTS.emerald,
  hasSubscription: false,
  setHasSubscription: () => {},
  setTheme: (_theme: ThemeType) => { },
  setAccent: (_accent: AccentType) => { },
  navigateTab: () => {},
});

const VPN_MAIN_DEVICES = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    os: 'macOS',
    location: 'Франкфурт, Германия',
    ip: '192.168.1.12',
  },
  {
    id: 2,
    name: 'iPhone 14 Pro',
    os: 'iOS',
    location: 'Лондон, Великобритания',
    ip: '10.0.0.5',
  },
  {
    id: 3,
    name: 'Windows Desktop',
    os: 'Windows 11',
    location: 'Нью-Йорк, США',
    ip: '172.16.0.8',
  },
];

const WL_DEVICES = [
  {
    id: 4,
    name: 'iPhone 14 Pro',
    os: 'iOS',
    location: 'Лондон, Великобритания',
    ip: '10.0.0.5',
  },
  {
    id: 5,
    name: 'MacBook Pro 16"',
    os: 'macOS',
    location: 'Франкфурт, Германия',
    ip: '192.168.1.12',
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
  billing: 'Настройка VPN',
  bonuses: 'Бонусы',
  referral: 'Рефералы',
  notifications: 'Уведомления',
  history: 'История операций',
  install: 'Установить приложение',
  preferences: 'Настройки',
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
        'relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group min-h-[44px]',
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
      <div className="relative z-10 flex items-center gap-3 whitespace-nowrap">
        <Icon weight={ICON_WEIGHT} className={cn('h-5 w-5 shrink-0 transition-colors', active ? a.textLight : t.textMuted)} />
        <span className="truncate">{label}</span>
      </div>
    </button>
  );
};

const GlowCard = ({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => {
  const { t, a } = useContext(ThemeContext);

  return (
    <div
      id={id}
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

/* ── Device Row with hover unlink ── */
const DeviceRow = ({ device, onUnlink }: { device: { id: number; name: string; os: string; location: string; ip: string }; onUnlink: (id: number) => void }) => {
  const { t, a } = useContext(ThemeContext);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors sm:p-4',
        t.card, t.border, t.borderHover
      )}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full border', t.cardSolid, t.border)}>
          {device.os.includes('mac') || device.os.includes('Windows') ? (
            <Laptop weight={ICON_WEIGHT} className={cn('h-5 w-5', t.textMuted)} />
          ) : (
            <DeviceMobile weight={ICON_WEIGHT} className={cn('h-5 w-5', t.textMuted)} />
          )}
        </div>
        <div className="min-w-0">
          <h4 className={cn('truncate text-sm font-medium', t.textStrong)}>{device.name}</h4>
          <div className={cn('mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs', t.textSubtle)}>
            <span className="truncate">{device.location}</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-mono">{device.ip}</span>
          </div>
        </div>
      </div>

      <div
        className="relative cursor-pointer select-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AnimatePresence mode="wait">
          {hovered ? (
            <motion.button
              key="unlink"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              onClick={() => onUnlink(device.id)}
              className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              <X weight="bold" className="h-3 w-3" />
              Отвязать
            </motion.button>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <div className={cn('h-2 w-2 rounded-full', a.color)} />
              <span className={cn('text-xs font-medium', a.text)}>Активно</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ── Devices Card (split: VPN / whitelist) ── */
const DevicesCard = () => {
  const { t, a, theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const handleUnlink = (id: number) => {
    setConfirmId(id);
  };

  const allDevices = [...VPN_MAIN_DEVICES, ...WL_DEVICES];
  const deviceToUnlink = allDevices.find((d) => d.id === confirmId);

  return (
    <>
      <div className={cn('relative overflow-hidden rounded-3xl border', t.cardSolid, t.border)}>
        <div className={cn('pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-15 blur-[120px]', a.blur1)} />
        <div className={cn('pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full opacity-10 blur-[100px]', a.blur1)} />

        {/* Section title */}
        <div className={cn('relative z-10 flex items-center gap-2.5 px-6 pt-6 pb-1')}>
          <Devices weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
          <span className={cn('text-sm font-medium', t.textStrong)}>Активные устройства</span>
        </div>

        <div className={cn('relative z-10 flex', isMobile ? 'flex-col' : 'flex-row')}>
          {/* ─ Left: Main VPN devices ─ */}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className={cn('flex items-center gap-2 text-xs font-medium uppercase tracking-wider', t.textSubtle)}>
                <ShieldCheck weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
                <span>Основная подписка</span>
              </div>
              <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px]', t.border, t.textMuted)}>
                {VPN_MAIN_DEVICES.length} из 5
              </span>
            </div>

            <div className="space-y-3">
              {VPN_MAIN_DEVICES.map((device) => (
                <DeviceRow key={device.id} device={device} onUnlink={handleUnlink} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className={cn('items-center self-stretch py-8', isMobile ? 'hidden' : 'flex')}>
            <div className={cn('w-px h-full rounded-full', theme === 'dark' ? 'bg-gradient-to-b from-transparent via-white/50 to-transparent' : 'bg-gradient-to-b from-transparent via-black/30 to-transparent')} />
          </div>
          <div className={cn('mx-6 h-px', isMobile ? '' : 'hidden', theme === 'dark' ? 'bg-gradient-to-r from-transparent via-white/50 to-transparent' : 'bg-gradient-to-r from-transparent via-black/30 to-transparent')} />

          {/* ─ Right: Whitelist devices ─ */}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe weight={ICON_WEIGHT} className="h-4 w-4 text-blue-400" />
                <span className={cn('text-xs font-medium uppercase tracking-wider', t.textSubtle)}>Белые списки</span>
              </div>
              <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px]', t.border, t.textMuted)}>
                {WL_DEVICES.length} из 5
              </span>
            </div>

            <div className="space-y-3">
              {WL_DEVICES.map((device) => (
                <DeviceRow key={device.id} device={device} onUnlink={handleUnlink} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation overlay ── */}
      {createPortal(
        <AnimatePresence>
          {confirmId !== null ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setConfirmId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className={cn('mx-4 w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl', t.cardSolid, t.border)}
              >
                <div className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
                    <WarningCircle weight={ICON_WEIGHT} className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className={cn('text-base font-medium', t.textStrong)}>Отвязать устройство?</h3>
                  <p className={cn('mt-2 text-sm leading-relaxed', t.textMuted)}>
                    Вы уверены, что хотите отвязать{' '}
                    <span className={cn('font-medium', t.textStrong)}>{deviceToUnlink?.name}</span>?
                  </p>
                </div>
                <div className={cn('flex gap-3 border-t px-6 py-4', t.border)}>
                  <button
                    onClick={() => setConfirmId(null)}
                    className={cn(
                      'flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                      t.border, t.textStrong, t.cardHover
                    )}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="flex-1 rounded-xl bg-red-500/15 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/25"
                  >
                    Отвязать
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

const OverviewTab = () => {
  const { t, a, hasSubscription, theme, navigateTab } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const planSectionRef = useRef<HTMLDivElement>(null);

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

  /* New subscription payment modal animation */
  const [newSubModalOpen, setNewSubModalOpen] = useState(false);
  const [newSubActivating, setNewSubActivating] = useState(false);
  const [newSubActivationStep, setNewSubActivationStep] = useState(0);
  const [newSubActivationDone, setNewSubActivationDone] = useState(false);
  const [newSubResultData, setNewSubResultData] = useState<{ planLabel: string; price: string; bonusGb: number; endDate: string } | null>(null);

  const handleNewSubPurchase = (data: { planLabel: string; price: string; bonusGb: number; endDate: string }) => {
    setNewSubResultData(data);
    setNewSubModalOpen(true);
    setNewSubActivating(true);
    setNewSubActivationStep(0);
    setNewSubActivationDone(false);

    let stepIdx = 0;
    const runStep = () => {
      if (stepIdx >= NEW_SUB_PAYMENT_STEPS.length) {
        setNewSubActivationDone(true);
        return;
      }
      setNewSubActivationStep(stepIdx);
      setTimeout(() => { stepIdx++; runStep(); }, NEW_SUB_PAYMENT_STEPS[stepIdx].duration);
    };
    runStep();
  };

  const [wlInfoOpen, setWlInfoOpen] = useState(false);
  const wlInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wlInfoOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (wlInfoRef.current?.contains(e.target as Node)) return;
      setWlInfoOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [wlInfoOpen]);

  if (!hasSubscription) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* ── Welcome ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={cn('relative overflow-hidden rounded-2xl border', t.card, a.border)}
        >
          <div className={cn('pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full opacity-15 blur-[100px]', a.blur1)} />
          <div className={cn('pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full opacity-10 blur-[80px]', a.blur1)} />

          <div className="relative z-10 p-6 sm:p-8">
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className={cn('text-2xl font-light tracking-tight', t.textStrong)}
            >
              Добро пожаловать в <span className={a.text}>WW.pro</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={cn('mt-2 max-w-lg text-sm leading-relaxed', t.text)}
            >
              Ваш интернет — без ограничений, без слежки, без рекламы.
              Протокол Xray, различные типы транспорта, двойная маскировка
              и отсутствие логов — всё это от <span className={cn('font-medium', a.text)}>99 ₽/мес</span>.
            </motion.p>

            {/* ── Separator ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className={cn('my-6 mx-auto h-px rounded-full', theme === 'dark' ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent' : 'bg-gradient-to-r from-transparent via-black/15 to-transparent')}
            />

            {/* ── Intro ── */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.58 }}
              className={cn('mb-4 text-sm', t.text)}
            >
              Одна подписка — <span className={cn('font-medium', t.textStrong)}>две услуги</span>
            </motion.p>

            {/* ── Two services ── */}
            <div className={cn('grid gap-6', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
              {/* VPN */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.65 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
                  <span className={cn('text-sm font-medium', t.textStrong)}>VPN-подписка</span>
                </div>
                <p className={cn('text-xs leading-relaxed', t.textMuted)}>
                  Все заблокированные сервисы работают — Instagram, ChatGPT, Spotify и остальное.
                  Протокол <span className={cn('font-medium', t.text)}>Xray</span> с продвинутой маскировкой. Доступ к 4 серверам:
                </p>
                <div className="space-y-1.5">
                  {[
                    { flag: '🇩🇪', name: 'Германия', desc: 'самый быстрый сервер' },
                    { flag: '🇦🇲', name: 'Армения', desc: 'YouTube без рекламы' },
                    { flag: '🇫🇮', name: 'Финляндия', desc: 'стабильность + YouTube без рекламы' },
                    { flag: '🇺🇸', name: 'США', desc: 'любой сервис доступен' },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="text-sm leading-none">{s.flag}</span>
                      <span className={cn('text-xs', t.textStrong)}>{s.name}</span>
                      <span className={cn('text-[11px]', t.textSubtle)}>— {s.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* White Lists */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.75 }}
                className="space-y-2.5"
              >
                <div className="relative flex items-center gap-2">
                  <Globe weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
                  <span className={cn('text-sm font-medium', t.textStrong)}>Белые списки</span>
                  <button
                    onClick={() => setWlInfoOpen((v) => !v)}
                    className={cn(
                      'inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors',
                      wlInfoOpen ? cn(a.color, 'text-black') : cn(theme === 'dark' ? 'bg-white/10 text-white/50 hover:bg-white/15' : 'bg-black/8 text-black/40 hover:bg-black/12')
                    )}
                  >
                    <Info weight="bold" className="h-2.5 w-2.5" />
                  </button>

                  {/* Desktop popup */}
                  <AnimatePresence>
                    {wlInfoOpen && !isMobile && (
                      <motion.div
                        ref={wlInfoRef}
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className={cn('absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border p-4 shadow-xl', t.cardSolid, t.border)}
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <span className={cn('text-xs font-medium', t.textStrong)}>Как работают белые списки?</span>
                          <button onClick={() => setWlInfoOpen(false)} className={cn('rounded-full p-0.5', t.textSubtle, 'hover:bg-white/5')}>
                            <X weight="bold" className="h-3 w-3" />
                          </button>
                        </div>
                        <p className={cn('text-xs leading-relaxed', t.textMuted)}>
                          <span className={cn('font-medium', t.text)}>Обычный VPN</span> обходит блокировки отдельных сайтов — когда интернет работает, но часть ресурсов недоступна.
                        </p>
                        <p className={cn('mt-2 text-xs leading-relaxed', t.textMuted)}>
                          <span className={cn('font-medium', t.text)}>Белые списки</span> — на случай полного отключения интернета в стране. Доступ к нужным ресурсам через мобильную сеть (LTE) по зашифрованному каналу, даже когда всё остальное недоступно.
                        </p>
                        <div className={cn('mt-3 rounded-lg border p-2.5', a.border, a.bgSoft)}>
                          <p className={cn('text-[11px] leading-relaxed', t.text)}>
                            <span className={cn('font-medium', a.text)}>3 ГБ бесплатно</span> в каждой подписке для теста. Дополнительный трафик — всего <span className={cn('font-medium', a.text)}>4 ₽/ГБ</span>.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className={cn('text-xs leading-relaxed', t.textMuted)}>
                  Отдельная услуга на случай полного отключения интернета в стране.
                  Доступ к нужным ресурсам через мобильную сеть (LTE) по зашифрованному каналу — работает даже в шатдаун.
                </p>
                <p className={cn('text-xs leading-relaxed', t.text)}>
                  <span className={cn('font-medium', a.text)}>3 ГБ входят в каждую подписку бесплатно</span> — протестируйте прямо сейчас.
                  Нужно больше? Дополнительный трафик — всего <span className={cn('font-medium', a.text)}>4 ₽/ГБ</span>.
                </p>
              </motion.div>
            </div>

            {/* ── Separator ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className={cn('my-6 mx-auto h-px rounded-full', theme === 'dark' ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent' : 'bg-gradient-to-r from-transparent via-black/15 to-transparent')}
            />

            {/* ── Value block ── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 1.0 }}
              className="space-y-4"
            >
              <div className="flex items-baseline gap-2">
                <span className={cn('text-3xl font-light tracking-tight', a.text)}>99 ₽</span>
                <span className={cn('text-sm', t.textMuted)}>/ мес</span>
              </div>
              <div className={cn('space-y-2 text-xs', t.textMuted)}>
                <div className="flex items-center gap-2">
                  <Lightning weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5 shrink-0', a.text)} />
                  <span>Безлимитный VPN — трафик и скорость без ограничений</span>
                </div>
                <div className="flex items-center gap-2">
                  <Devices weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5 shrink-0', a.text)} />
                  <span>До <span className={cn('font-medium', t.text)}>5 устройств</span> одновременно</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5 shrink-0', a.text)} />
                  <span>4 страны, YouTube без рекламы, все сервисы работают</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5 shrink-0', a.text)} />
                  <span>Белые списки — <span className={cn('font-medium', t.text)}>3 ГБ в подарок</span>, дополнительный трафик 4 ₽/ГБ</span>
                </div>
              </div>
            </motion.div>

            {/* ── Separator ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.15 }}
              className={cn('my-6 mx-auto h-px rounded-full', theme === 'dark' ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent' : 'bg-gradient-to-r from-transparent via-black/15 to-transparent')}
            />

            {/* ── Quick start + CTA ── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.25 }}
              className="space-y-4"
            >
              <div className={cn('flex items-center gap-3 text-xs', t.textMuted, isMobile ? 'flex-col items-start gap-2' : '')}>
                <span className="flex items-center gap-1.5">
                  <span className={cn('flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-semibold', a.bgSoft, a.text)}>1</span>
                  <span>Выберите тариф</span>
                </span>
                {!isMobile && <span className={cn('text-[8px]', t.textSubtle)}>→</span>}
                <span className="flex items-center gap-1.5">
                  <span className={cn('flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-semibold', a.bgSoft, a.text)}>2</span>
                  <span>Установите приложение</span>
                </span>
                {!isMobile && <span className={cn('text-[8px]', t.textSubtle)}>→</span>}
                <span className="flex items-center gap-1.5">
                  <span className={cn('flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-semibold', a.bgSoft, a.text)}>3</span>
                  <span>Подключитесь из кабинета</span>
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.975 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => planSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className={cn(
                  'group flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-semibold transition-shadow duration-300',
                  a.button
                )}
              >
                <HandPeace weight="fill" className="h-4 w-4" />
                Всё нравится, давайте приступим
                <ArrowRight weight="bold" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile white-list info bottom sheet */}
        <AnimatePresence>
          {wlInfoOpen && isMobile && createPortal(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-end justify-center"
            >
              <motion.div className="fixed inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setWlInfoOpen(false)} />
              <motion.div
                ref={wlInfoRef}
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                className={cn('relative z-10 w-full max-w-lg rounded-t-2xl border-t p-6', t.cardSolid, t.border)}
                style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
                <div className="flex items-center justify-between mb-3">
                  <span className={cn('text-sm font-medium', t.textStrong)}>Как работают белые списки?</span>
                  <button onClick={() => setWlInfoOpen(false)} className={cn('rounded-full p-1.5', t.textMuted, 'hover:bg-white/5')}>
                    <X weight="bold" className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <p className={cn('text-sm leading-relaxed', t.text)}>
                    <span className={cn('font-medium', t.textStrong)}>Обычный VPN</span> обходит блокировки отдельных сайтов — когда интернет работает, но часть ресурсов недоступна.
                  </p>
                  <p className={cn('text-sm leading-relaxed', t.text)}>
                    <span className={cn('font-medium', t.textStrong)}>Белые списки</span> — на случай полного отключения интернета в стране. Доступ к нужным ресурсам через мобильную сеть (LTE) по зашифрованному каналу, даже когда всё остальное недоступно.
                  </p>
                  <div className={cn('rounded-xl border p-3', a.border, a.bgSoft)}>
                    <p className={cn('text-sm leading-relaxed', t.text)}>
                      <span className={cn('font-medium', a.text)}>3 ГБ бесплатно</span> в каждой подписке. Дополнительный трафик — всего <span className={cn('font-medium', a.text)}>4 ₽/ГБ</span>.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>,
            document.body
          )}
        </AnimatePresence>

        {/* ── Step 2: Pick a plan ── */}
        <motion.div
          ref={planSectionRef}
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
                    <span className={cn('text-xs', t.textMuted)}>В подарок на белые списки</span>
                    <span className={cn('text-xs font-medium', a.text)}>{activePlan.months * 3} GB</span>
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
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className={cn('text-center text-xs leading-relaxed', t.textMuted)}
              >
                <RocketLaunch weight="fill" className={cn('mb-0.5 mr-1 inline h-3.5 w-3.5', a.text)} />
                Подписка активируется мгновенно. Если что-то пойдёт не&nbsp;так&nbsp;— нажмите «Проверить оплату»
              </motion.p>

              {/* Buttons */}
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleNewSubPurchase({
                    planLabel: activePlan.label,
                    price: `${activePlan.price} ₽`,
                    bonusGb: activePlan.months * 3,
                    endDate: formatDate(accessDate),
                  });
                }}
                className={cn(
                  'group flex w-full items-center justify-between rounded-2xl border px-5 py-4 transition-all duration-300',
                  a.border, a.bgSoft, 'hover:shadow-lg'
                )}
              >
                <span className={cn('text-sm font-semibold', a.text)}>Перейти к оплате</span>
                <CaretRight weight="bold" className={cn('h-4 w-4 transition-transform group-hover:translate-x-0.5', a.text)} />
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

        {/* ── New Subscription Payment Modal ── */}
        {createPortal(
          <AnimatePresence>
            {newSubModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 16 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  onClick={(e) => e.stopPropagation()}
                  className={cn('mx-4 w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl', t.cardSolid, t.border)}
                >
                  {/* Modal header */}
                  <div className={cn('flex items-center gap-3 border-b px-6 py-4', t.border)}>
                    <RocketLaunch weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
                    <div>
                      <h3 className={cn('text-sm font-medium', t.textStrong)}>Оформление подписки</h3>
                      <p className={cn('text-xs', t.textMuted)}>Оплата и активация доступа</p>
                    </div>
                  </div>

                  {/* Modal body */}
                  <div className="px-6 py-5">
                    <AnimatePresence mode="wait">
                      {/* ── Processing ── */}
                      {newSubActivating && !newSubActivationDone && (
                        <motion.div
                          key="newsub-progress"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-5 py-4"
                        >
                          <div className="flex justify-center">
                            <motion.div
                              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                              className={cn('flex h-16 w-16 items-center justify-center rounded-full', a.bgSoft)}
                            >
                              <Parachute weight="fill" className={cn('h-8 w-8', a.text)} />
                            </motion.div>
                          </div>

                          <div className="space-y-3">
                            {NEW_SUB_PAYMENT_STEPS.map((step, i) => {
                              const isActive = i === newSubActivationStep;
                              const isDone = i < newSubActivationStep;
                              return (
                                <motion.div
                                  key={step.label}
                                  initial={{ opacity: 0, x: -12 }}
                                  animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
                                  transition={{ delay: i * 0.1, duration: 0.3 }}
                                  className="flex items-center gap-3"
                                >
                                  <div className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300',
                                    isDone || isActive ? a.bgSoft : theme === 'dark' ? 'bg-white/[0.04]' : 'bg-black/[0.04]'
                                  )}>
                                    {isDone ? (
                                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
                                        <CheckCircle weight="fill" className={cn('h-4 w-4', a.text)} />
                                      </motion.div>
                                    ) : (
                                      <step.icon weight={ICON_WEIGHT} className={cn('h-4 w-4', isActive ? a.text : t.textSubtle)} />
                                    )}
                                  </div>
                                  <span className={cn(
                                    'text-sm transition-all duration-300',
                                    isDone ? cn('font-medium', a.text) : isActive ? cn('font-medium', t.textStrong) : t.textSubtle
                                  )}>
                                    {step.label}
                                  </span>
                                  {isActive && (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                      className={cn('ml-auto h-4 w-4 rounded-full border-2 border-t-transparent', a.border)}
                                    />
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>

                          <div className={cn('h-1 w-full overflow-hidden rounded-full', theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.05]')}>
                            <motion.div
                              initial={{ width: '0%' }}
                              animate={{ width: `${((newSubActivationStep + 1) / NEW_SUB_PAYMENT_STEPS.length) * 100}%` }}
                              transition={{ duration: 0.4, ease: 'easeOut' }}
                              className={cn('h-full rounded-full', a.color)}
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* ── Success ── */}
                      {newSubActivationDone && newSubResultData && (
                        <motion.div
                          key="newsub-done"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', bounce: 0.3 }}
                          className="space-y-5 py-4"
                        >
                          {/* Success icon + confetti */}
                          <div className="relative flex justify-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
                            >
                              <SealCheck weight="fill" className={cn('h-16 w-16', a.text)} />
                            </motion.div>
                            {Array.from({ length: 12 }).map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0, 1, 0.5],
                                  x: Math.cos((i * Math.PI) / 6) * 70,
                                  y: Math.sin((i * Math.PI) / 6) * 70,
                                }}
                                transition={{ duration: 0.9, delay: 0.2 + i * 0.04 }}
                                className={cn('absolute h-2 w-2 rounded-full', i % 3 === 0 ? a.color : i % 3 === 1 ? (theme === 'dark' ? 'bg-white/40' : 'bg-black/20') : 'bg-amber-400/60')}
                              />
                            ))}
                          </div>

                          <div className="text-center">
                            <h3 className={cn('text-lg font-medium', t.textStrong)}>Подписка оформлена!</h3>
                            <p className={cn('mt-1 text-xs', t.textMuted)}>Оплата прошла успешно</p>
                          </div>

                          {/* Details card */}
                          <div className={cn('space-y-3 rounded-xl border p-4', t.border, theme === 'dark' ? 'bg-white/[0.02]' : 'bg-black/[0.02]')}>
                            <div className="flex items-center justify-between">
                              <span className={cn('text-xs', t.textMuted)}>Тариф</span>
                              <span className={cn('text-sm font-medium', t.textStrong)}>{newSubResultData.planLabel}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={cn('text-xs', t.textMuted)}>Оплачено</span>
                              <span className={cn('text-sm font-medium', a.text)}>{newSubResultData.price}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={cn('text-xs', t.textMuted)}>Активна до</span>
                              <span className={cn('text-sm font-medium', a.text)}>{newSubResultData.endDate}</span>
                            </div>
                            {newSubResultData.bonusGb > 0 && (
                              <div className="flex items-center justify-between">
                                <span className={cn('text-xs', t.textMuted)}>Белые списки</span>
                                <span className={cn('text-sm font-medium', a.text)}>+ {newSubResultData.bonusGb} GB</span>
                              </div>
                            )}
                          </div>

                          {/* Next step prompt */}
                          <div className={cn('flex items-start gap-3 rounded-xl border p-4', a.border, a.bgSoft)}>
                            <Info weight={ICON_WEIGHT} className={cn('mt-0.5 h-4 w-4 shrink-0', a.text)} />
                            <p className={cn('text-xs leading-relaxed', t.text)}>
                              Вы просто великолепны, но это ещё не финал. Осталось зайти в настройки, выбрать устройство и подключиться. Минута — и весь интернет ваш.
                            </p>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { setNewSubModalOpen(false); navigateTab('billing'); }}
                            className={cn('flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-medium transition-all', a.button)}
                          >
                            <Compass weight={ICON_WEIGHT} className="h-4 w-4" />
                            Перейти к настройке VPN
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </motion.div>
    );
  }

  /* ── Active subscription view ── */
  const [activeSubIdx, setActiveSubIdx] = useState(0);
  const [selectedGb, setSelectedGb] = useState<number | null>(null);
  const [customGb, setCustomGb] = useState('');
  const [gbPayment, setGbPayment] = useState<PaymentMethod | null>(null);
  const [gbPurchaseState, setGbPurchaseState] = useState<'idle' | 'processing' | 'success'>('idle');
  const buyGbRef = useRef<HTMLDivElement>(null);
  const gbPaymentRef = useRef<HTMLDivElement>(null);
  const gbReceiptRef = useRef<HTMLDivElement>(null);
  const renewRef = useRef<HTMLDivElement>(null);
  const renewPlanRef = useRef<HTMLDivElement>(null);
  const renewPaymentRef = useRef<HTMLDivElement>(null);
  const renewReceiptRef = useRef<HTMLDivElement>(null);
  const [renewMode, setRenewMode] = useState<'renew' | 'new' | null>(null);
  const [renewPlan, setRenewPlan] = useState<string | null>(null);
  const [renewPayment, setRenewPayment] = useState<PaymentMethod | null>(null);
  const [showRenewBlock, setShowRenewBlock] = useState(false);
  const [showGbBlock, setShowGbBlock] = useState(false);
  const scrollToRenew = useRef(false);
  const scrollToGb = useRef(false);
  const { addToast } = useNotifications();

  /* Renewal payment modal animation */
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewActivating, setRenewActivating] = useState(false);
  const [renewActivationStep, setRenewActivationStep] = useState(0);
  const [renewActivationDone, setRenewActivationDone] = useState(false);
  const [renewResultData, setRenewResultData] = useState<{ planLabel: string; price: string; bonusGb: number; startDate: string; endDate: string; txId: string; isRenew: boolean } | null>(null);

  const handleRenewPurchase = (data: { planLabel: string; price: string; bonusGb: number; startDate: string; endDate: string; txId: string; isRenew: boolean }) => {
    setRenewResultData(data);
    setRenewModalOpen(true);
    setRenewActivating(true);
    setRenewActivationStep(0);
    setRenewActivationDone(false);

    const steps = data.isRenew ? RENEW_PAYMENT_STEPS : NEW_SUB_PAYMENT_STEPS;
    let stepIdx = 0;
    const runStep = () => {
      if (stepIdx >= steps.length) {
        setRenewActivationDone(true);
        return;
      }
      setRenewActivationStep(stepIdx);
      setTimeout(() => { stepIdx++; runStep(); }, steps[stepIdx].duration);
    };
    runStep();
  };

  const handleRenewModalClose = () => {
    setRenewModalOpen(false);
    setRenewActivating(false);
    setRenewActivationStep(0);
    setRenewActivationDone(false);
    setRenewResultData(null);
    setRenewMode(null);
    setRenewPlan(null);
    setRenewPayment(null);
    setShowRenewBlock(false);
  };

  useEffect(() => {
    if (showRenewBlock && scrollToRenew.current) {
      scrollToRenew.current = false;
      setTimeout(() => {
        renewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 450);
    }
  }, [showRenewBlock]);

  useEffect(() => {
    if (showGbBlock && scrollToGb.current) {
      scrollToGb.current = false;
      setTimeout(() => {
        buyGbRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 450);
    }
  }, [showGbBlock]);

  const USER_SUBS = [
    { id: 'main', label: 'Основная', plan: 'Pro', daysLeft: 243, startDate: '22.06.2025', endDate: '18.02.2026', price: '249 ₽', period: '3 мес', devices: 5, usedDevices: 3 },
  ];

  const activeSub = USER_SUBS[activeSubIdx];

  /* White list mock data */
  const whitelistActive = true;
  const wlUsed = 29.83;
  const wlTotal = 70.50;
  const wlPercent = Math.round((wlUsed / wlTotal) * 100);
  const GB_QUICK = [5, 10, 20, 50] as const;
  const pricePerGb = 19; // ₽ per GB

  const strokeColor = a.color === 'bg-emerald-500' ? 'stroke-emerald-500' : a.color === 'bg-orange-500' ? 'stroke-orange-500' : a.color === 'bg-blue-500' ? 'stroke-blue-500' : 'stroke-pink-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* ── Profile + Subscription + White Lists (single card) ── */}
      <div className={cn('relative overflow-hidden rounded-3xl border', t.cardSolid, t.border)}>
        <div className={cn('pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-15 blur-[120px]', a.blur1)} />
        <div className={cn('pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full opacity-10 blur-[100px]', a.blur1)} />

        {/* ─ Profile header ─ */}
        <div className={cn('relative z-10 flex items-center gap-4 px-6 pt-5 pb-4')}>
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-full border-2', a.border)}>
            <span className={cn('text-base font-semibold', t.textStrong)}>В</span>
          </div>
          <div className="flex-1">
            <div className={cn('text-sm font-medium', t.textStrong)}>Влад</div>
            <div className={cn('mt-0.5 flex items-center gap-3 text-xs', t.textMuted)}>
              <span className="flex items-center gap-1">
                <TelegramLogo weight={ICON_WEIGHT} className="h-3 w-3" />
                @vlad_dev
              </span>
              <span className="flex items-center gap-1">
                <span className="font-mono text-[11px]">ID: 865413405</span>
              </span>
            </div>
          </div>
        </div>

        {/* ─ Divider ─ */}
        <div className="relative z-10 mx-6">
          <div className={cn('h-px', t.border)} style={{ opacity: 0.5 }} />
        </div>

        <div className={cn('relative z-10 flex', isMobile ? 'flex-col' : 'flex-row')}>
          {/* ─ Left: Main subscription ─ */}
          <div className="flex flex-1 flex-col justify-between p-6">
            <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className={cn('flex items-center gap-2 text-xs font-medium uppercase tracking-wider', t.textSubtle)}>
                <Crown weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
                <span>Тариф {activeSub.plan}</span>
              </div>
              <div className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1', a.border, a.bgSoft)}>
                <div className={cn('h-1.5 w-1.5 rounded-full', a.color)} />
                <span className={cn('text-[11px] font-semibold', a.text)}>Активна</span>
              </div>
            </div>

            {/* Days hero */}
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className={cn('text-4xl font-light tracking-tighter sm:text-5xl lg:text-6xl', t.textStrong)}>{activeSub.daysLeft}</h2>
                <span className={cn('text-lg font-light', t.textMuted)}>дней</span>
              </div>
            </div>

            {/* Date info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Начало', value: activeSub.startDate, icon: CalendarBlank },
                { label: 'Окончание', value: activeSub.endDate, icon: Clock },
                { label: 'Стоимость', value: activeSub.price, icon: Wallet },
                { label: 'Устройства', value: `${activeSub.usedDevices} из ${activeSub.devices}`, icon: Laptop },
              ].map((item) => (
                <div key={item.label} className={cn('rounded-xl border p-3', t.card, t.border)}>
                  <div className={cn('mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider', t.textSubtle)}>
                    <item.icon weight={ICON_WEIGHT} className="h-3 w-3" />
                    {item.label}
                  </div>
                  <div className={cn('text-sm font-medium', t.textStrong)}>{item.value}</div>
                </div>
              ))}
            </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2.5">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => {
                  const next = !showRenewBlock;
                  if (next) scrollToRenew.current = true;
                  setShowRenewBlock(next);
                }}
                className={cn(
                  'group flex w-full items-center justify-between rounded-xl px-5 py-3.5 text-sm font-semibold transition-shadow duration-300',
                  a.button
                )}
              >
                Продлить подписку
                <motion.div animate={{ rotate: showRenewBlock ? 90 : 0 }} transition={{ duration: 0.25 }}>
                  <CaretRight weight="bold" className="h-4 w-4" />
                </motion.div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => navigateTab('billing')}
                className={cn(
                  'group flex w-full items-center justify-between rounded-xl border px-5 py-3.5 text-sm font-medium transition-all duration-300',
                  'border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.06]',
                  t.textStrong
                )}
              >
                Настроить VPN
                <CaretRight weight="bold" className={cn('h-4 w-4 transition-all duration-300 group-hover:translate-x-1', t.textSubtle)} />
              </motion.button>
            </div>
          </div>

          {/* Divider */}
          <div className={cn('items-center self-stretch py-8', isMobile ? 'hidden' : 'flex')}>
            <div className={cn('w-px h-full rounded-full', theme === 'dark' ? 'bg-gradient-to-b from-transparent via-white/50 to-transparent' : 'bg-gradient-to-b from-transparent via-black/30 to-transparent')} />
          </div>
          <div className={cn('mx-6 h-px', isMobile ? '' : 'hidden', theme === 'dark' ? 'bg-gradient-to-r from-transparent via-white/50 to-transparent' : 'bg-gradient-to-r from-transparent via-black/30 to-transparent')} />

          {/* ─ Right: White Lists ─ */}
          <div className="flex flex-1 flex-col justify-between p-6">
            <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe weight={ICON_WEIGHT} className="h-5 w-5 text-blue-400" />
                <span className={cn('text-sm font-medium', t.textStrong)}>Белые списки</span>
              </div>
              <div className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1', whitelistActive ? cn(a.border, a.bgSoft) : cn(t.border, 'bg-white/[0.04]'))}>
                <div className={cn('h-1.5 w-1.5 rounded-full', whitelistActive ? a.color : 'bg-zinc-500')} />
                <span className={cn('text-[11px] font-semibold', whitelistActive ? a.text : t.textSubtle)}>{whitelistActive ? 'Активны' : 'Неактивны'}</span>
              </div>
            </div>

            {/* Ring + traffic stats */}
            <div className="flex items-center gap-6">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" className={theme === 'dark' ? 'stroke-white/[0.06]' : 'stroke-black/[0.06]'} strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none"
                    className={strokeColor}
                    strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray="97.4" strokeDashoffset={97.4 * (wlPercent / 100)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={cn('text-sm font-semibold', a.text)}>{(wlTotal - wlUsed).toFixed(0)}</span>
                  <span className={cn('text-[9px] uppercase', t.textSubtle)}>GB</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs', t.textMuted)}>Использовано</span>
                  <span className={cn('text-xs font-medium', t.textStrong)}>{wlUsed} GB</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${wlPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', a.color)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs', t.textMuted)}>Всего</span>
                  <span className={cn('text-xs font-medium', t.textStrong)}>{wlTotal} GB</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className={cn('text-xs leading-relaxed', t.textMuted)}>
              Доступ к ресурсам при полном отключении интернета (шатдаун).
              Трафик идёт через зашифрованный канал по мобильной сети (LTE).
            </p>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <CellSignalFull weight={ICON_WEIGHT} className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className={cn('text-xs', t.text)}>Работает через LTE / мобильную сеть</span>
              </div>
              <div className="flex items-center gap-2.5">
                <WifiSlash weight={ICON_WEIGHT} className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                <span className={cn('text-xs', t.text)}>Через Wi-Fi не используется</span>
              </div>
            </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2.5">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => {
                  const next = !showGbBlock;
                  if (next) scrollToGb.current = true;
                  setShowGbBlock(next);
                }}
                className={cn(
                  'group flex w-full items-center justify-between rounded-xl px-5 py-3.5 text-sm font-semibold transition-shadow duration-300',
                  a.button
                )}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCartSimple weight={ICON_WEIGHT} className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  Купить гигабайты
                </div>
                <motion.div animate={{ rotate: showGbBlock ? 90 : 0 }} transition={{ duration: 0.25 }}>
                  <CaretRight weight="bold" className="h-4 w-4" />
                </motion.div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => navigateTab('billing', 'whitelist-section')}
                className={cn(
                  'group flex w-full items-center justify-between rounded-xl border px-5 py-3.5 text-sm font-medium transition-all duration-300',
                  'border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.06]',
                  t.textStrong
                )}
              >
                Настроить белые списки
                <CaretRight weight="bold" className={cn('h-4 w-4 transition-all duration-300 group-hover:translate-x-1', t.textSubtle)} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Devices (split card) ── */}
      <DevicesCard />

      {/* ── Buy GB — full purchase flow ── */}
      <div ref={buyGbRef}>
      <AnimatePresence>
        {showGbBlock ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
      <div className={cn('relative overflow-hidden rounded-3xl border', t.cardSolid, t.border)}>
        <div className={cn('pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-15 blur-[120px]', a.blur1)} />
        <div className={cn('pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full opacity-10 blur-[100px]', a.blur1)} />

        <div className="relative z-10 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className={cn('flex items-center gap-2 text-xs font-medium uppercase tracking-wider', t.textSubtle)}>
              <Globe weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
              <span>Покупка трафика</span>
            </div>
            <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-medium', a.border, a.text)}>
              {pricePerGb} ₽ / GB
            </span>
          </div>

          {/* Description */}
          <div className={cn('rounded-xl border p-4 space-y-3', t.card, t.border)}>
            <p className={cn('text-sm leading-relaxed', t.text)}>
              Белые списки — это доступ к определённым сайтам и сервисам, когда весь остальной интернет заблокирован.
              Используйте во время <span className={cn('font-medium', t.textStrong)}>шатдауна</span>, когда глушат мобильный интернет.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <CellSignalFull weight={ICON_WEIGHT} className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className={cn('text-xs', t.text)}>Работает через мобильную сеть (LTE) — основной режим</span>
              </div>
              <div className="flex items-center gap-2.5">
                <WifiSlash weight={ICON_WEIGHT} className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                <span className={cn('text-xs', t.text)}>Не используйте через Wi-Fi, исключение — если Wi-Fi раздаётся с модема</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Info weight={ICON_WEIGHT} className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                <span className={cn('text-xs', t.text)}>Трафик расходуется только когда белые списки активны</span>
              </div>
            </div>
          </div>

          {/* Step 1: Select traffic */}
          <div className="space-y-4">
            <h3 className={cn('text-sm font-medium', t.textMuted)}>Шаг 1 — Выберите объём</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {GB_QUICK.map((gb, idx) => {
                const isActive = selectedGb === gb && customGb === '';
                const isBest = idx === 2;
                return (
                  <motion.button
                    key={gb}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={() => { setSelectedGb(gb); setCustomGb(''); setGbPayment(null); setTimeout(() => gbPaymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
                    className={cn(
                      'group relative flex flex-col items-center overflow-hidden rounded-2xl border py-5 px-3 transition-all duration-300',
                      isActive
                        ? cn(a.border, t.cardSolid, 'shadow-lg')
                        : cn(t.border, t.card, t.borderHover, 'hover:shadow-md')
                    )}
                  >
                    {/* Glow */}
                    <div className={cn(
                      'pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-opacity duration-300',
                      a.glowCard,
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                    )} />

                    {/* Best badge */}
                    {isBest ? (
                      <div className={cn('absolute right-2 top-2 z-10 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider', a.color, 'text-black')}>
                        хит
                      </div>
                    ) : null}

                    {/* Value */}
                    <span className={cn('relative z-10 text-3xl font-light tracking-tight', isActive ? a.text : t.textStrong)}>{gb}</span>
                    <span className={cn('relative z-10 -mt-0.5 text-[10px] font-medium uppercase tracking-widest', isActive ? a.text : t.textSubtle)}>GB</span>

                    {/* Divider */}
                    <div className={cn('relative z-10 my-3 h-px w-8 rounded-full', isActive ? a.color : theme === 'dark' ? 'bg-white/10' : 'bg-black/10')} />

                    {/* Price */}
                    <span className={cn('relative z-10 text-sm font-semibold', isActive ? a.text : t.textStrong)}>{gb * pricePerGb} ₽</span>
                    <span className={cn('relative z-10 mt-0.5 text-[10px]', t.textSubtle)}>{pricePerGb} ₽/GB</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Custom amount */}
            <div>
              <span className={cn('text-xs font-medium uppercase tracking-wider', t.textSubtle)}>Или введите вручную</span>
              <div className="mt-2.5 flex items-center gap-3">
                <div className={cn('flex flex-1 items-center overflow-hidden rounded-xl border transition-colors', customGb ? cn(a.border) : t.border, t.card)}>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    placeholder="Количество GB"
                    value={customGb}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '' || (Number(v) >= 0 && Number(v) <= 500)) {
                        setCustomGb(v);
                        setSelectedGb(null);
                        setGbPayment(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customGb && Number(customGb) > 0) {
                        setTimeout(() => gbPaymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                      }
                    }}
                    className={cn(
                      'w-full bg-transparent px-4 py-3 text-sm font-medium outline-none placeholder:opacity-40',
                      t.textStrong
                    )}
                  />
                  <span className={cn('pr-4 text-sm', t.textMuted)}>GB</span>
                </div>
                {customGb && Number(customGb) > 0 ? (
                  <span className={cn('whitespace-nowrap text-sm font-medium', a.text)}>
                    {Number(customGb) * pricePerGb} ₽
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Step 2: Payment method */}
          <AnimatePresence>
            {(selectedGb || (customGb && Number(customGb) > 0)) ? (
              <motion.div
                ref={gbPaymentRef}
                key="gb-payment"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <h3 className={cn('text-sm font-medium', t.textMuted)}>Шаг 2 — Способ оплаты</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { setGbPayment('yukassa'); setTimeout(() => gbReceiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
                    className={cn(
                      'group relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300',
                      gbPayment === 'yukassa'
                        ? cn(t.cardSolid, a.border)
                        : cn(t.card, t.border, t.borderHover)
                    )}
                  >
                    <div className={cn(
                      'pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-opacity duration-500',
                      a.glowCard,
                      gbPayment === 'yukassa' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )} />
                    <div className="relative z-10 flex w-full items-center gap-3">
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', a.bgSoft)}>
                        <CreditCard weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
                      </div>
                      <div className="flex-1">
                        <div className={cn('text-sm font-medium', t.textStrong)}>ЮKassa</div>
                        <div className={cn('text-[11px]', t.textMuted)}>Карта, СБП, кошельки</div>
                      </div>
                      {gbPayment === 'yukassa' ? (
                        <div className={cn('h-2.5 w-2.5 rounded-full', a.color)} />
                      ) : null}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { setGbPayment('cryptobot'); setTimeout(() => gbReceiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
                    className={cn(
                      'group relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300',
                      gbPayment === 'cryptobot'
                        ? cn(t.cardSolid, a.border)
                        : cn(t.card, t.border, t.borderHover)
                    )}
                  >
                    <div className={cn(
                      'pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-opacity duration-500',
                      a.glowCard,
                      gbPayment === 'cryptobot' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )} />
                    <div className="relative z-10 flex w-full items-center gap-3">
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-medium', a.bgSoft, a.text)}>BTC</div>
                      <div className="flex-1">
                        <div className={cn('text-sm font-medium', t.textStrong)}>Cryptobot</div>
                        <div className={cn('text-[11px]', t.textMuted)}>Крипто через Telegram</div>
                      </div>
                      {gbPayment === 'cryptobot' ? (
                        <div className={cn('h-2.5 w-2.5 rounded-full', a.color)} />
                      ) : null}
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Step 3: Receipt + Payment flow */}
          <AnimatePresence mode="wait">
            {gbPayment && (selectedGb || (customGb && Number(customGb) > 0)) ? (
              <motion.div
                ref={gbReceiptRef}
                key={`gb-receipt-${gbPurchaseState}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {(() => {
                  const gbAmount = customGb && Number(customGb) > 0 ? Number(customGb) : selectedGb!;
                  const gbTotal = gbAmount * pricePerGb;
                  const gbTxId = 'wl-' + mockTxId.slice(3);

                  const handlePurchase = () => {
                    setGbPurchaseState('processing');
                    setTimeout(() => {
                      setGbPurchaseState('success');
                      addToast({
                        type: 'success',
                        title: `+${gbAmount} GB зачислено`,
                        body: `Оплата ${gbTotal} ₽ прошла успешно. Трафик добавлен к белым спискам. Транзакция: ${gbTxId.slice(0, 12)}…`,
                        time: 'Только что',
                      });
                      setTimeout(() => {
                        setGbPurchaseState('idle');
                        setSelectedGb(null);
                        setCustomGb('');
                        setGbPayment(null);
                      }, 4000);
                    }, 2500);
                  };

                  /* ── Processing state ── */
                  if (gbPurchaseState === 'processing') {
                    return (
                      <div className="flex flex-col items-center justify-center py-12">
                        {/* Spinner ring */}
                        <div className="relative mb-6">
                          <svg className="h-16 w-16 animate-spin" viewBox="0 0 50 50">
                            <circle cx="25" cy="25" r="20" fill="none" className={theme === 'dark' ? 'stroke-white/[0.08]' : 'stroke-black/[0.08]'} strokeWidth="3" />
                            <circle cx="25" cy="25" r="20" fill="none" className={strokeColor} strokeWidth="3" strokeLinecap="round" strokeDasharray="80 126" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Globe weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
                          </div>
                        </div>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className={cn('text-sm font-medium', t.textStrong)}
                        >
                          Обработка платежа…
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className={cn('mt-1.5 text-xs', t.textMuted)}
                        >
                          Начисляем {gbAmount} GB на ваш аккаунт
                        </motion.p>
                      </div>
                    );
                  }

                  /* ── Success state ── */
                  if (gbPurchaseState === 'success') {
                    return (
                      <div className="flex flex-col items-center justify-center py-12">
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                          className={cn('mb-5 flex h-16 w-16 items-center justify-center rounded-full', a.bgSoft)}
                        >
                          <CheckCircle weight="fill" className={cn('h-8 w-8', a.text)} />
                        </motion.div>
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className={cn('text-base font-semibold', t.textStrong)}
                        >
                          +{gbAmount} GB зачислено
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className={cn('mt-1.5 text-xs', t.textMuted)}
                        >
                          Транзакция {gbTxId.slice(0, 18)}… • {gbTotal} ₽
                        </motion.p>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className={cn('mt-4 rounded-full px-4 py-1.5 text-[11px] font-medium', a.bgSoft, a.text)}
                        >
                          Гигабайты добавлены к балансу
                        </motion.div>
                      </div>
                    );
                  }

                  /* ── Idle — receipt view ── */
                  return (
                    <>
                      <div className={cn('overflow-hidden rounded-2xl border', t.card, a.border)}>
                        <div className={cn('flex items-center gap-2.5 border-b px-5 py-4', a.border, a.bgSoft)}>
                          <div className={cn('flex h-5 w-5 items-center justify-center rounded-full', a.color)}>
                            <Globe weight="fill" className="h-3 w-3 text-black" />
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
                            <span className={cn('break-all text-right font-mono text-[11px]', a.text)}>{gbTxId}</span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className={cn('text-xs', t.textMuted)}>Тип</span>
                            <span className={cn('text-xs', t.textStrong)}>Трафик белых списков</span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className={cn('text-xs', t.textMuted)}>Объём</span>
                            <span className={cn('text-sm font-medium', a.text)}>{gbAmount} GB</span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className={cn('text-xs', t.textMuted)}>Цена за GB</span>
                            <span className={cn('text-xs', t.textStrong)}>{pricePerGb} ₽</span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className={cn('text-xs', t.textMuted)}>Итого</span>
                            <span className={cn('text-sm font-semibold', a.text)}>{gbTotal} ₽</span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className={cn('text-xs', t.textMuted)}>Оплата</span>
                            <span className={cn('text-xs', t.textStrong)}>
                              {gbPayment === 'yukassa' ? 'Карта / СБП' : 'Криптовалюта'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={cn('flex items-center gap-3 rounded-xl border p-4', a.border, a.bgSoft)}>
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', a.color)}>
                          <RocketLaunch weight="fill" className="h-4 w-4 text-black" />
                        </div>
                        <div>
                          <p className={cn('text-xs font-medium leading-relaxed', t.textStrong)}>
                            GB зачислятся мгновенно после оплаты
                          </p>
                          <p className={cn('text-[11px] leading-relaxed', t.textMuted)}>
                            Если доступ был прерван — серверы обновятся в течение 5–10 минут
                          </p>
                        </div>
                      </div>

                      <motion.button
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.1 }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handlePurchase}
                        className={cn(
                          'group flex w-full items-center justify-between rounded-xl px-5 py-4 text-sm font-semibold transition-shadow duration-300',
                          a.button
                        )}
                      >
                        Перейти к оплате — {gbTotal} ₽
                        <CaretRight weight="bold" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </motion.button>

                      <motion.button
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.2 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'w-full rounded-xl border py-3 text-center text-xs font-medium transition-all',
                          a.buttonOutline
                        )}
                      >
                        Проверить оплату
                      </motion.button>
                    </>
                  );
                })()}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      </div>

      {/* ── Renew / New subscription flow ── */}
      <div ref={renewRef}>
      <AnimatePresence>
        {showRenewBlock ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
      <div className={cn('relative overflow-hidden rounded-3xl border', t.cardSolid, t.border)}>
        <div className={cn('pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-15 blur-[120px]', a.blur1)} />
        <div className={cn('pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full opacity-10 blur-[100px]', a.blur1)} />

        <div className="relative z-10 p-6 space-y-6">
          {/* Header — floating */}
          <div>
            <div className={cn('mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>
              <Crown weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
              Что дальше?
            </div>
            <p className={cn('text-sm leading-relaxed', t.text)}>
              У вас активная подписка — и это прекрасно. Но всё хорошее можно сделать ещё лучше.
              Выберите один из двух путей:
            </p>
          </div>

          {/* Two options — floating descriptions */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg', a.bgSoft)}>
                <Spiral weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5', a.text)} />
              </div>
              <div>
                <div className={cn('text-sm font-medium', t.textStrong)}>Продлить текущую подписку</div>
                <p className={cn('mt-1 text-xs leading-relaxed', t.textMuted)}>
                  Самый удобный вариант — особенно если делаете это заранее.
                  Дата окончания сдвинется вперёд, гигабайты на белые списки начислятся автоматически,
                  а все ваши конфиги и устройства останутся на месте.
                  Скорее всего вам даже не придётся ничего менять в приложении — просто продолжайте пользоваться.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg', a.bgSoft)}>
                <Meteor weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5', a.text)} />
              </div>
              <div>
                <div className={cn('text-sm font-medium', t.textStrong)}>Создать новую подписку</div>
                <p className={cn('mt-1 text-xs leading-relaxed', t.textMuted)}>
                  Нужно подключить ещё одно устройство? Хотите сделать VPN в подарок другу, коту или бабушке?
                  Этот вариант для вас. Создавайте столько подписок, сколько захотите — ограничений нет,
                  есть только ваши желания и возможности (ну и немного рублей).
                </p>
              </div>
            </div>
          </div>

          {/* Mode selector */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { mode: 'renew' as const, icon: Spiral, title: 'Продлить текущую', desc: 'Все данные сохранятся' },
              { mode: 'new' as const, icon: Meteor, title: 'Создать новую', desc: 'Отдельная подписка' },
            ].map((opt) => (
              <motion.button
                key={opt.mode}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setRenewMode(opt.mode);
                  setRenewPlan(null);
                  setRenewPayment(null);
                  setTimeout(() => renewPlanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                }}
                className={cn(
                  'group relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300',
                  renewMode === opt.mode
                    ? cn(t.cardSolid, a.border)
                    : cn(t.card, t.border, t.borderHover)
                )}
              >
                <div className={cn(
                  'pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-opacity duration-500',
                  a.glowCard,
                  renewMode === opt.mode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )} />
                <div className="relative z-10 flex w-full items-center gap-3">
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', a.bgSoft)}>
                    <opt.icon weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
                  </div>
                  <div className="flex-1">
                    <div className={cn('text-sm font-medium', t.textStrong)}>{opt.title}</div>
                    <div className={cn('text-[11px]', t.textMuted)}>{opt.desc}</div>
                  </div>
                  {renewMode === opt.mode ? (
                    <div className={cn('h-2.5 w-2.5 rounded-full', a.color)} />
                  ) : null}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Step 1: Plan selection */}
          <AnimatePresence>
            {renewMode ? (
              <motion.div
                ref={renewPlanRef}
                key="renew-plan"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <h3 className={cn('text-sm font-medium', t.textMuted)}>Шаг 1 — Выберите тариф</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {SUB_PLANS.map((plan) => {
                    const isSelected = renewPlan === plan.id;
                    const discount = Math.round((1 - plan.price / plan.oldPrice) * 100);
                    return (
                      <motion.button
                        key={plan.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setRenewPlan(plan.id);
                          setRenewPayment(null);
                          setTimeout(() => renewPaymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                        }}
                        className={cn(
                          'group relative flex flex-col items-start overflow-hidden rounded-2xl border p-6 text-left transition-all duration-500',
                          isSelected
                            ? cn(t.cardSolid, a.border, 'shadow-[0_0_30px_rgba(0,0,0,0.12)]')
                            : cn(t.card, t.border, t.borderHover)
                        )}
                      >
                        <div className={cn(
                          'pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-opacity duration-500',
                          a.glowCard,
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        )} />
                        <div className="relative z-10 flex w-full flex-1 flex-col">
                          <span className={cn('mb-3 text-sm font-medium', t.textStrong)}>{plan.label}</span>
                          <span className={cn('text-xs line-through', t.textSubtle)}>{plan.oldPrice}₽</span>
                          <span className={cn('text-3xl font-light tracking-tight', t.textStrong)}>{plan.price}₽</span>
                          <span className={cn('mt-1 text-xs', t.textMuted)}>{plan.perMonth}₽ / мес</span>
                          <div className={cn('mt-3 w-fit rounded-full border px-2 py-0.5 text-[10px] font-medium', a.bgSoft, a.text, a.border)}>
                            −{discount}%
                          </div>
                        </div>
                        {plan.badge === 'optimal' ? (
                          <span className={cn('absolute bottom-2.5 right-2.5 rounded-full px-2 py-0.5 text-[9px] font-medium', a.bgSoft, a.text)}>
                            Оптимальный
                          </span>
                        ) : plan.badge === 'best' ? (
                          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-medium text-amber-500">
                            Лучшее предложение
                          </span>
                        ) : null}
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
            ) : null}
          </AnimatePresence>

          {/* Step 2: Payment method */}
          <AnimatePresence>
            {renewPlan ? (
              <motion.div
                ref={renewPaymentRef}
                key="renew-payment"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <h3 className={cn('text-sm font-medium', t.textMuted)}>Шаг 2 — Способ оплаты</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { setRenewPayment('yukassa'); setTimeout(() => renewReceiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
                    className={cn(
                      'group relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300',
                      renewPayment === 'yukassa'
                        ? cn(t.cardSolid, a.border)
                        : cn(t.card, t.border, t.borderHover)
                    )}
                  >
                    <div className={cn(
                      'pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-opacity duration-500',
                      a.glowCard,
                      renewPayment === 'yukassa' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )} />
                    <div className="relative z-10 flex w-full items-center gap-3">
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', a.bgSoft)}>
                        <CreditCard weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
                      </div>
                      <div className="flex-1">
                        <div className={cn('text-sm font-medium', t.textStrong)}>ЮKassa</div>
                        <div className={cn('text-[11px]', t.textMuted)}>Карта, СБП, кошельки</div>
                      </div>
                      {renewPayment === 'yukassa' ? (
                        <div className={cn('h-2.5 w-2.5 rounded-full', a.color)} />
                      ) : null}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { setRenewPayment('cryptobot'); setTimeout(() => renewReceiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
                    className={cn(
                      'group relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300',
                      renewPayment === 'cryptobot'
                        ? cn(t.cardSolid, a.border)
                        : cn(t.card, t.border, t.borderHover)
                    )}
                  >
                    <div className={cn(
                      'pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent transition-opacity duration-500',
                      a.glowCard,
                      renewPayment === 'cryptobot' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )} />
                    <div className="relative z-10 flex w-full items-center gap-3">
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-medium', a.bgSoft, a.text)}>BTC</div>
                      <div className="flex-1">
                        <div className={cn('text-sm font-medium', t.textStrong)}>Cryptobot</div>
                        <div className={cn('text-[11px]', t.textMuted)}>Крипто через Telegram</div>
                      </div>
                      {renewPayment === 'cryptobot' ? (
                        <div className={cn('h-2.5 w-2.5 rounded-full', a.color)} />
                      ) : null}
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Step 3: Receipt + Pay */}
          <AnimatePresence>
            {renewPayment && renewPlan ? (() => {
              const rPlan = SUB_PLANS.find((p) => p.id === renewPlan)!;
              const rBonusGb = rPlan.months * 3;
              const isRenew = renewMode === 'renew';
              /* For renew: start from current sub end date; for new: start from today */
              const rStartDate = isRenew
                ? (() => { const parts = activeSub.endDate.split('.'); return new Date(+parts[2], +parts[1] - 1, +parts[0]); })()
                : new Date();
              const rAccessDate = new Date(rStartDate);
              rAccessDate.setDate(rAccessDate.getDate() + rPlan.months * 30);
              const rTxId = 'sub-' + mockTxId.slice(4);
              const today = new Date();
              const isExpiringSoon = activeSub.daysLeft <= 30;
              /* Month names for calendar */
              const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
              const MONTHS_FULL = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
              const newDays = rPlan.months * 30;
              return (
                <motion.div
                  ref={renewReceiptRef}
                  key="renew-receipt"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
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
                        <span className={cn('break-all text-right font-mono text-[11px]', a.text)}>{rTxId}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className={cn('text-xs', t.textMuted)}>Тип</span>
                        <span className={cn('text-xs', t.textStrong)}>{renewMode === 'renew' ? 'Продление подписки' : 'Новая подписка'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className={cn('text-xs', t.textMuted)}>Тариф</span>
                        <span className={cn('text-xs', t.textStrong)}>{rPlan.label} ({rPlan.months * 30} дн.)</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className={cn('text-xs', t.textMuted)}>Сумма оплаты</span>
                        <span className={cn('text-sm font-medium', a.text)}>{rPlan.price} ₽</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className={cn('text-xs', t.textMuted)}>В подарок на белые списки</span>
                        <span className={cn('text-xs font-medium', a.text)}>{rBonusGb} GB</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className={cn('text-xs', t.textMuted)}>Оплата</span>
                        <span className={cn('text-xs', t.textStrong)}>
                          {renewPayment === 'yukassa' ? 'Карта / СБП' : 'Криптовалюта'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className={cn('text-xs', t.textMuted)}>Начало</span>
                        <span className={cn('text-xs', t.textStrong)}>{formatDate(isRenew ? rStartDate : today)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className={cn('text-xs', t.textMuted)}>Доступ до</span>
                        <span className={cn('text-xs font-semibold', a.text)}>{formatDate(rAccessDate)}</span>
                      </div>
                    </div>
                  </div>

                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className={cn('text-center text-xs leading-relaxed', t.textMuted)}
                  >
                    <RocketLaunch weight="fill" className={cn('mb-0.5 mr-1 inline h-3.5 w-3.5', a.text)} />
                    Подписка активируется мгновенно. Если что-то пойдёт не&nbsp;так&nbsp;— нажмите «Проверить оплату»
                  </motion.p>

                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleRenewPurchase({
                        planLabel: rPlan.label,
                        price: `${rPlan.price} ₽`,
                        bonusGb: rBonusGb,
                        startDate: formatDate(isRenew ? rStartDate : today),
                        endDate: formatDate(rAccessDate),
                        txId: rTxId,
                        isRenew,
                      });
                    }}
                    className={cn(
                      'group flex w-full items-center justify-between rounded-2xl border px-5 py-4 transition-all duration-300',
                      a.border, a.bgSoft, 'hover:shadow-lg'
                    )}
                  >
                    <span className={cn('text-sm font-semibold', a.text)}>Перейти к оплате</span>
                    <CaretRight weight="bold" className={cn('h-4 w-4 transition-transform group-hover:translate-x-0.5', a.text)} />
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
              );
            })() : null}
          </AnimatePresence>
        </div>
      </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      </div>

      {/* ── Renewal Payment Modal ── */}
      {createPortal(
        <AnimatePresence>
          {renewModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => { if (renewActivationDone && renewResultData?.isRenew) handleRenewModalClose(); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 16 }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
                className={cn('mx-4 w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl', t.cardSolid, t.border)}
              >
                {/* Modal header */}
                <div className={cn('flex items-center justify-between border-b px-6 py-4', t.border)}>
                  <div className="flex items-center gap-3">
                    {renewResultData?.isRenew ? (
                      <Crown weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
                    ) : (
                      <RocketLaunch weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
                    )}
                    <div>
                      <h3 className={cn('text-sm font-medium', t.textStrong)}>
                        {renewResultData?.isRenew ? 'Продление подписки' : 'Оформление подписки'}
                      </h3>
                      <p className={cn('text-xs', t.textMuted)}>
                        {renewResultData?.isRenew ? 'Оплата и продление доступа' : 'Оплата и активация доступа'}
                      </p>
                    </div>
                  </div>
                  {renewResultData?.isRenew ? (
                    <button
                      onClick={handleRenewModalClose}
                      className={cn('rounded-lg p-1.5 transition-colors', t.navHover, !renewActivationDone && 'pointer-events-none opacity-0')}
                    >
                      <X weight="bold" className={cn('h-4 w-4', t.textMuted)} />
                    </button>
                  ) : null}
                </div>

                {/* Modal body */}
                <div className="px-6 py-5">
                  <AnimatePresence mode="wait">
                    {/* ── Processing ── */}
                    {renewActivating && !renewActivationDone && (
                      <motion.div
                        key="renew-progress"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-5 py-4"
                      >
                        <div className="flex justify-center">
                          <motion.div
                            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            className={cn('flex h-16 w-16 items-center justify-center rounded-full', a.bgSoft)}
                          >
                            <CreditCard weight="fill" className={cn('h-8 w-8', a.text)} />
                          </motion.div>
                        </div>

                        <div className="space-y-3">
                          {(renewResultData?.isRenew ? RENEW_PAYMENT_STEPS : NEW_SUB_PAYMENT_STEPS).map((step, i) => {
                            const isActive = i === renewActivationStep;
                            const isDone = i < renewActivationStep;
                            return (
                              <motion.div
                                key={step.label}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.3 }}
                                className="flex items-center gap-3"
                              >
                                <div className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300',
                                  isDone || isActive ? a.bgSoft : theme === 'dark' ? 'bg-white/[0.04]' : 'bg-black/[0.04]'
                                )}>
                                  {isDone ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
                                      <CheckCircle weight="fill" className={cn('h-4 w-4', a.text)} />
                                    </motion.div>
                                  ) : (
                                    <step.icon weight={ICON_WEIGHT} className={cn('h-4 w-4', isActive ? a.text : t.textSubtle)} />
                                  )}
                                </div>
                                <span className={cn(
                                  'text-sm transition-all duration-300',
                                  isDone ? cn('font-medium', a.text) : isActive ? cn('font-medium', t.textStrong) : t.textSubtle
                                )}>
                                  {step.label}
                                </span>
                                {isActive && (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className={cn('ml-auto h-4 w-4 rounded-full border-2 border-t-transparent', a.border)}
                                  />
                                )}
                              </motion.div>
                            );
                          })}
                        </div>

                        <div className={cn('h-1 w-full overflow-hidden rounded-full', theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.05]')}>
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${((renewActivationStep + 1) / (renewResultData?.isRenew ? RENEW_PAYMENT_STEPS : NEW_SUB_PAYMENT_STEPS).length) * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className={cn('h-full rounded-full', a.color)}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* ── Success ── */}
                    {renewActivationDone && renewResultData && (
                      <motion.div
                        key="renew-done"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.3 }}
                        className="space-y-5 py-4"
                      >
                        {/* Success icon + confetti */}
                        <div className="relative flex justify-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
                            {... (renewResultData.isRenew ? { className: cn('flex h-20 w-20 items-center justify-center rounded-full', a.bgSoft) } : {})}
                          >
                            <SealCheck weight="fill" className={cn(renewResultData.isRenew ? 'h-10 w-10' : 'h-16 w-16', a.text)} />
                          </motion.div>
                          {Array.from({ length: renewResultData.isRenew ? 10 : 12 }).map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0.5],
                                x: Math.cos((i * Math.PI) / (renewResultData.isRenew ? 5 : 6)) * (renewResultData.isRenew ? 65 : 70),
                                y: Math.sin((i * Math.PI) / (renewResultData.isRenew ? 5 : 6)) * (renewResultData.isRenew ? 65 : 70),
                              }}
                              transition={{ duration: renewResultData.isRenew ? 0.8 : 0.9, delay: 0.2 + i * 0.04 }}
                              className={cn('absolute h-2 w-2 rounded-full', i % 3 === 0 ? a.color : i % 3 === 1 ? (theme === 'dark' ? 'bg-white/40' : 'bg-black/20') : 'bg-amber-400/60')}
                            />
                          ))}
                        </div>

                        <div className="text-center">
                          <h3 className={cn('text-lg font-medium', t.textStrong)}>
                            {renewResultData.isRenew ? 'Подписка продлена!' : 'Подписка оформлена!'}
                          </h3>
                          <p className={cn('mt-1 text-xs', t.textMuted)}>Оплата прошла успешно</p>
                        </div>

                        {/* Details card */}
                        <div className={cn('space-y-3 rounded-xl border p-4', t.border, theme === 'dark' ? 'bg-white/[0.02]' : 'bg-black/[0.02]')}>
                          <div className="flex items-center justify-between">
                            <span className={cn('text-xs', t.textMuted)}>Тариф</span>
                            <span className={cn('text-sm font-medium', t.textStrong)}>{renewResultData.planLabel}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={cn('text-xs', t.textMuted)}>Оплачено</span>
                            <span className={cn('text-sm font-medium', a.text)}>{renewResultData.price}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={cn('text-xs', t.textMuted)}>{renewResultData.isRenew ? 'Новая дата окончания' : 'Активна до'}</span>
                            <span className={cn('text-sm font-medium', a.text)}>{renewResultData.endDate}</span>
                          </div>
                          {renewResultData.bonusGb > 0 && (
                            <div className="flex items-center justify-between">
                              <span className={cn('text-xs', t.textMuted)}>Белые списки</span>
                              <span className={cn('text-sm font-medium', a.text)}>+ {renewResultData.bonusGb} GB</span>
                            </div>
                          )}
                        </div>

                        {/* Help / info note */}
                        {renewResultData.isRenew ? (
                          <div className={cn('flex items-start gap-3 rounded-xl border p-4', t.border, theme === 'dark' ? 'bg-white/[0.02]' : 'bg-black/[0.02]')}>
                            <Info weight={ICON_WEIGHT} className={cn('mt-0.5 h-4 w-4 shrink-0', a.text)} />
                            <p className={cn('text-xs leading-relaxed', t.textMuted)}>
                              Если после продления что-то не работает — попробуйте переподключить VPN
                              или повторно настройте подписку в приложении.
                            </p>
                          </div>
                        ) : (
                          <div className={cn('flex items-start gap-3 rounded-xl border p-4', a.border, a.bgSoft)}>
                            <Info weight={ICON_WEIGHT} className={cn('mt-0.5 h-4 w-4 shrink-0', a.text)} />
                            <p className={cn('text-xs leading-relaxed', t.text)}>
                              Вы просто великолепны, но это ещё не финал. Осталось зайти в настройки, выбрать устройство и подключиться. Минута — и весь интернет ваш.
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-3">
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { handleRenewModalClose(); navigateTab('billing'); }}
                            className={cn('flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all', a.button)}
                          >
                            <Compass weight={ICON_WEIGHT} className="h-4 w-4" />
                            Перейти к настройке VPN
                          </motion.button>
                          {renewResultData.isRenew && (
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={handleRenewModalClose}
                              className={cn(
                                'w-full rounded-xl border py-3 text-center text-xs font-medium transition-all',
                                t.border, t.text, t.borderHover
                              )}
                            >
                              Продолжить
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

const VPN_DEVICES = [
  { id: 'ios', label: 'iPhone', icon: DeviceMobile },
  { id: 'macos', label: 'macOS', icon: Laptop },
  { id: 'android', label: 'Android', icon: DeviceMobile },
  { id: 'windows', label: 'Windows', icon: Desktop },
  { id: 'tv', label: 'TV', icon: Television },
];

const VpnSetupTab = () => {
  const { t, a, theme } = useContext(ThemeContext);
  const [selectedDevice, setSelectedDevice] = useState('ios');

  const deviceInstructions: Record<string, { steps: string[]; stores: { label: string; icon: any; href: string }[] }> = {
    ios: {
      steps: [
        'Откройте страницу в App Store и установите приложение',
        'Запустите приложение',
        'В окне «Разрешение VPN-конфигурации» нажмите «Разрешить» и введите свой пароль',
      ],
      stores: [
        { label: 'App Store RU', icon: AppleLogo, href: '#' },
        { label: 'App Store Global', icon: AppleLogo, href: '#' },
      ],
    },
    macos: {
      steps: [
        'Скачайте приложение из App Store или по ссылке',
        'Установите и запустите приложение',
        'Разрешите установку VPN-конфигурации',
      ],
      stores: [
        { label: 'App Store RU', icon: AppleLogo, href: '#' },
        { label: 'App Store Global', icon: AppleLogo, href: '#' },
      ],
    },
    android: {
      steps: [
        'Скачайте APK-файл или установите из Google Play',
        'Разрешите установку из неизвестных источников при необходимости',
        'Запустите приложение и подключитесь',
      ],
      stores: [
        { label: 'Google Play', icon: GooglePlayLogo, href: '#' },
        { label: 'Скачать APK', icon: DownloadSimple, href: '#' },
      ],
    },
    windows: {
      steps: [
        'Скачайте установщик по ссылке',
        'Запустите установку и следуйте инструкциям',
        'После установки запустите приложение и подключитесь',
      ],
      stores: [
        { label: 'Скачать для Windows', icon: DownloadSimple, href: '#' },
      ],
    },
    tv: {
      steps: [
        'Установите приложение из магазина вашего ТВ',
        'Откройте приложение и введите код авторизации',
        'Подключение произойдёт автоматически',
      ],
      stores: [
        { label: 'Инструкция для ТВ', icon: Television, href: '#' },
      ],
    },
  };

  const current = deviceInstructions[selectedDevice] ?? deviceInstructions.ios;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10"
    >
      {/* ── 1. Device picker ── */}
      <div>
        <p className={cn('mb-5 text-xs uppercase tracking-widest', t.textMuted)}>Устройство</p>
        <div className="flex flex-wrap gap-2">
          {VPN_DEVICES.map((device) => {
            const isActive = selectedDevice === device.id;
            const Icon = device.icon;
            return (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                className={cn(
                  'relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-300',
                  isActive
                    ? cn(a.bgSoft, a.text, 'shadow-sm')
                    : cn(t.textMuted, theme === 'dark' ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]')
                )}
              >
                <Icon weight={isActive ? 'fill' : ICON_WEIGHT} className="h-4 w-4" />
                {device.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. App badge ── */}
      <div className="flex items-center gap-4">
        <img src="/happ-icon.webp" alt="Happ" className="h-12 w-12 rounded-xl" />
        <div>
          <p className={cn('text-sm font-medium', t.textStrong)}>Happ</p>
          <p className={cn('text-xs', t.textMuted)}>Рекомендуемое VPN-приложение</p>
        </div>
        <span className={cn('ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-medium', a.bgSoft, a.text)}>Доступно</span>
      </div>

      {/* thin accent divider */}
      <div className={cn('h-px w-full', theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.06]')} />

      {/* ── 3. Installation steps — floating text ── */}
      <div>
        <p className={cn('mb-1 text-xs uppercase tracking-widest', t.textMuted)}>Установка</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDevice}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-4 space-y-4"
          >
            {current.steps.map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold', a.bgSoft, a.text)}>
                  {i + 1}
                </span>
                <p className={cn('text-sm leading-relaxed', t.text)}>{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Store buttons */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDevice + '-stores'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="mt-6 flex flex-col gap-2 sm:flex-row"
          >
            {current.stores.map((store) => {
              const SIcon = store.icon;
              return (
                <a
                  key={store.label}
                  href={store.href}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs font-medium transition-all duration-300',
                    theme === 'dark' ? 'bg-white/[0.06] hover:bg-white/[0.1]' : 'bg-black/[0.05] hover:bg-black/[0.08]',
                    t.textStrong
                  )}
                >
                  <SIcon weight="fill" className="h-3.5 w-3.5" />
                  {store.label}
                </a>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* thin divider */}
      <div className={cn('h-px w-full', theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.06]')} />

      {/* ── 4. Main Subscription ── */}
      <div>
        <div className="flex items-center gap-3">
          <ShieldCheck weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
          <p className={cn('text-sm font-medium', t.textStrong)}>Основная подписка</p>
        </div>
        <p className={cn('mt-2 text-xs leading-relaxed', t.textMuted)}>
          Нажмите кнопку — ссылка откроется и добавит безлимитную подписку автоматически.
        </p>
        <button className={cn(
          'group mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all duration-300',
          a.color, 'text-white hover:opacity-90 active:scale-[0.98]'
        )}>
          Добавить подписку
          <CaretRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* thin divider */}
      <div className={cn('h-px w-full', theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.06]')} />

      {/* ── 5. White List Subscription ── */}
      <div id="whitelist-section">
        <div className="flex items-center gap-3">
          <Globe weight={ICON_WEIGHT} className="h-5 w-5 text-blue-400" />
          <p className={cn('text-sm font-medium', t.textStrong)}>Белые списки</p>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
            активны
          </span>
        </div>
        <p className={cn('mt-2 text-xs leading-relaxed', t.textMuted)}>
          Отдельная подписка для полного шатдауна. Используйте через LTE, не через Wi-Fi.
        </p>

        {/* Traffic bar */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className={cn('text-xs', t.textMuted)}>Трафик</span>
            <span className={cn('text-lg font-light tabular-nums', a.text)}>40.67 <span className={cn('text-xs font-normal', t.textMuted)}>/ 70.50 GB</span></span>
          </div>
          <div className={cn('mt-2 h-1 w-full overflow-hidden rounded-full', theme === 'dark' ? 'bg-white/[0.08]' : 'bg-black/[0.06]')}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '42%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn('h-full rounded-full', a.color)}
            />
          </div>
        </div>

        {/* Inline tips */}
        <div className={cn('mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs', t.textMuted)}>
          <span className="inline-flex items-center gap-1.5">
            <WifiSlash weight={ICON_WEIGHT} className="h-3.5 w-3.5 text-orange-400" />
            Wi-Fi не используйте
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CellSignalFull weight={ICON_WEIGHT} className="h-3.5 w-3.5 text-emerald-400" />
            Только LTE / мобильная сеть
          </span>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button className={cn(
            'group flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all duration-300',
            a.color, 'text-white hover:opacity-90 active:scale-[0.98]'
          )}>
            Добавить белые списки
            <CaretRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-all duration-300',
            theme === 'dark' ? 'bg-white/[0.06] hover:bg-white/[0.1]' : 'bg-black/[0.05] hover:bg-black/[0.08]',
            t.textStrong
          )}>
            Купить GB
          </button>
        </div>
      </div>

      {/* thin divider */}
      <div className={cn('h-px w-full', theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.06]')} />

      {/* ── 6. Connection ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <Plugs weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
          <p className={cn('text-sm font-medium', t.textStrong)}>Подключение</p>
        </div>
        <p className={cn('mt-2 text-xs leading-relaxed', t.textMuted)}>
          После добавления подписок вернитесь в приложение Hub. Нажмите «Подключить» — всё заработает автоматически.
        </p>
      </motion.div>
    </motion.div>
  );
};

/* ── Referral Tab ── */

const REFERRAL_LEVELS = [
  { min: 0,  label: 'Стажёр',     Icon: Fingerprint },
  { min: 2,  label: 'Информатор', Icon: Ear },
  { min: 5,  label: 'Агент',      Icon: Detective },
  { min: 10, label: 'Спецагент',  Icon: Binoculars },
  { min: 20, label: 'Резидент',   Icon: Eye },
  { min: 35, label: 'Куратор',    Icon: ShieldCheck },
  { min: 50, label: 'Призрак',    Icon: Ghost },
];

const LevelIcon = ({ Icon, size = 'md' }: { Icon: any; size?: 'md' | 'sm' }) => {
  const { t, a, theme } = useContext(ThemeContext);
  const isMd = size === 'md';
  return (
    <div className={cn('relative', isMd ? 'h-14 w-14' : 'h-5 w-5')}>
      {isMd && (
        <div className={cn('absolute -inset-2 rounded-full opacity-40 blur-2xl', a.color)} />
      )}
      <div className={cn(
        'relative flex h-full w-full items-center justify-center rounded-full',
        isMd
          ? cn('ring-1', a.border, theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.04]')
          : ''
      )}>
        <Icon weight="fill" className={cn(isMd ? 'h-8 w-8' : 'h-3.5 w-3.5', a.text)} />
      </div>
    </div>
  );
};

const ReferralTab = () => {
  const { t, a, theme } = useContext(ThemeContext);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [bonusActivated, setBonusActivated] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const referralCode = 'VLAD-WW2026';
  const referralLink = `https://ww.pro/ref/${referralCode}`;
  const totalReferrals = 5;
  const activeReferrals = 3;
  const totalEarnedDays = 50;
  const bonusDays = 15;
  const currentLevel = [...REFERRAL_LEVELS].reverse().find((l) => totalReferrals >= l.min) || REFERRAL_LEVELS[0];
  const nextLevel = REFERRAL_LEVELS.find((l) => l.min > totalReferrals);
  const progressToNext = nextLevel ? ((totalReferrals - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

  useEffect(() => {
    if (!showShare) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShowShare(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showShare]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleApplyPromo = () => {
    if (promoInput.trim().length > 0) {
      setPromoApplied(true);
      setTimeout(() => setPromoApplied(false), 3000);
      setPromoInput('');
    }
  };

  /* Animated counter */
  const AnimatedNumber = ({ value }: { value: number }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = 0;
      const duration = 1200;
      const startTime = Date.now();
      const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, [value]);
    return <>{display}</>;
  };

  /* Simple QR code SVG */
  const QRBlock = () => {
    const size = 21;
    const cells: boolean[][] = [];
    let seed = 0;
    for (let i = 0; i < referralCode.length; i++) seed = (seed * 31 + referralCode.charCodeAt(i)) & 0xffff;
    for (let y = 0; y < size; y++) {
      cells[y] = [];
      for (let x = 0; x < size; x++) {
        const inFinderTL = x < 7 && y < 7;
        const inFinderTR = x >= size - 7 && y < 7;
        const inFinderBL = x < 7 && y >= size - 7;
        if (inFinderTL || inFinderTR || inFinderBL) {
          const lx = inFinderTR ? x - (size - 7) : x;
          const ly = inFinderBL ? y - (size - 7) : y;
          cells[y][x] = lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
        } else {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff;
          cells[y][x] = (seed >> 16) % 3 !== 0;
        }
      }
    }
    const cellSize = 6;
    const padding = 12;
    const total = size * cellSize + padding * 2;
    return (
      <svg viewBox={`0 0 ${total} ${total}`} className="h-full w-full">
        <rect x="0" y="0" width={total} height={total} rx="8" fill="white" />
        {cells.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <rect
                key={`${x}-${y}`}
                x={padding + x * cellSize}
                y={padding + y * cellSize}
                width={cellSize - 0.5}
                height={cellSize - 0.5}
                rx={1}
                fill={theme === 'dark' ? '#0a0a0a' : '#18181b'}
              />
            ) : null
          )
        )}
      </svg>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* ── Referral Intro ── */}
      <div className="relative px-1">
        {/* Subtle accent glow behind intro */}
        <div className={cn('pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full opacity-[0.07] blur-[100px]', a.color)} />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative"
        >
          <h2 className={cn('text-lg font-medium', t.textStrong)}>
            Приглашайте друзей — зарабатывайте вместе
          </h2>
          <p className={cn('mt-2 max-w-xl text-sm leading-relaxed', t.textMuted)}>
            Делитесь своей реферальной ссылкой в Telegram-каналах, соцсетях или лично.
            За каждого приглашённого друга вы получаете{' '}
            <span className={cn('font-medium', a.text)}>бонусные дни</span>
            {' '}и{' '}
            <span className={cn('font-medium', a.text)}>дополнительные гигабайты трафика</span>.
            Чем больше друзей — тем выше ваш уровень и больше наград.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2"
        >
          {[
            { Icon: ShareNetwork, text: 'Размещайте ссылку в своих каналах' },
            { Icon: Gift, text: '+10 дней за каждого друга' },
            { Icon: Lightning, text: 'Бонусный трафик за активных рефералов' },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              className="flex items-center gap-2"
            >
              <item.Icon weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5 shrink-0', a.textLight)} />
              <span className={cn('text-xs', t.textSubtle)}>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Hero Block ── */}
      <div className={cn('relative overflow-hidden rounded-3xl border', t.cardSolid, t.border)}>
        <div className={cn('pointer-events-none absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full opacity-20 blur-[140px]', a.blur1)} />
        <div className={cn('pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full opacity-10 blur-[100px]', a.blur1)} />

        <div className="relative z-10 p-6 pb-0">
          {/* Top row: level + bonus days */}
          <div className="flex items-start justify-between">
            {/* Level */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.3, delay: 0.1 }}
              >
                <LevelIcon Icon={currentLevel.Icon} />
              </motion.div>
              <div>
                <div className={cn('text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>Ваш уровень</div>
                <h2 className={cn('text-lg font-medium', t.textStrong)}>{currentLevel.label}</h2>
              </div>
            </div>

            {/* Bonus days */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.2 }}
              className="relative text-right"
            >
              {/* Glow pulse */}
              <div className={cn('absolute -inset-4 rounded-full opacity-20 blur-2xl animate-pulse', a.color)} />
              <div className="relative">
                <div className={cn('text-3xl font-light tabular-nums sm:text-4xl', a.text)}>
                  <AnimatedNumber value={bonusDays} />
                </div>
                <div className={cn('text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>бонус-дней</div>
              </div>
            </motion.div>
          </div>

          {/* Level progress */}
          {nextLevel && (
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LevelIcon Icon={currentLevel.Icon} size="sm" />
                  <span className={cn('text-[11px]', t.textSubtle)}>{currentLevel.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-[11px]', t.textSubtle)}>{nextLevel.label}</span>
                  <LevelIcon Icon={nextLevel.Icon} size="sm" />
                </div>
              </div>
              <div className={cn('mt-1.5 h-1.5 w-full overflow-hidden rounded-full', theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.05]')}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  className={cn('h-full rounded-full', a.color)}
                />
              </div>
              <div className={cn('mt-1 text-center text-[10px]', t.textSubtle)}>
                {totalReferrals} / {nextLevel.min}
              </div>
            </div>
          )}

          {/* Floating stats */}
          <div className={cn('mt-5 flex items-end justify-between border-t pt-5', t.border)}>
            {[
              { value: totalReferrals, label: 'Рефералов', Icon: Users },
              { value: activeReferrals, label: 'Активных', Icon: CheckCircle },
              { value: totalEarnedDays, label: 'Заработано дней', Icon: CalendarBlank },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex-1 py-4 text-center"
              >
                <stat.Icon weight={ICON_WEIGHT} className={cn('mx-auto mb-1 h-4 w-4', a.textLight)} />
                <div className={cn('text-xl font-light tabular-nums', t.textStrong)}>
                  <AnimatedNumber value={stat.value} />
                </div>
                <div className={cn('text-[10px]', t.textMuted)}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activate bonus button */}
        <div className={cn('border-t px-6 py-4', t.border)}>
          <button
            onClick={() => setBonusActivated(true)}
            className={cn(
              'group flex w-full items-center justify-between rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300',
              bonusActivated
                ? cn('border', a.border, a.bgSoft, a.text)
                : a.button
            )}
          >
            <span className="flex items-center gap-2">
              {bonusActivated ? (
                <><CheckCircle weight="fill" className="h-4 w-4" /> Бонусы активированы</>
              ) : (
                <><RocketLaunch weight={ICON_WEIGHT} className="h-4 w-4" /> Активировать {bonusDays} бонусных дней</>
              )}
            </span>
            {!bonusActivated && (
              <CaretRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Link + QR Grid ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: link, share, code */}
        <div className={cn('lg:col-span-2 relative overflow-hidden rounded-3xl border', t.cardSolid, t.border)}>
          <div className="p-6 space-y-5">
            {/* Referral link */}
            <div>
              <div className={cn('mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>
                <ShareNetwork weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
                Реферальная ссылка
              </div>
              <div className={cn('flex items-center gap-2 rounded-xl border p-1', t.border, theme === 'dark' ? 'bg-white/[0.03]' : 'bg-black/[0.02]')}>
                <div className={cn('flex-1 truncate rounded-lg px-4 py-2.5 font-mono text-sm', a.text)}>
                  {referralLink}
                </div>
                <button
                  onClick={handleCopy}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                    copied ? 'bg-emerald-500 text-black' : a.button
                  )}
                >
                  {copied ? (
                    <><CheckCircle weight="bold" className="h-4 w-4" /> Скопировано</>
                  ) : (
                    <><Copy weight={ICON_WEIGHT} className="h-4 w-4" /> Копировать</>
                  )}
                </button>
              </div>

              {/* Share row */}
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Присоединяйся к WW.pro VPN — получи 5 бонусных дней!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                    t.border, t.textStrong, t.cardHover, 'hover:shadow-lg'
                  )}
                >
                  <TelegramLogo weight="fill" className="h-4 w-4 text-[#2AABEE]" />
                  Telegram
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent('Присоединяйся к WW.pro VPN — получи 5 бонусных дней! ' + referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                    t.border, t.textStrong, t.cardHover, 'hover:shadow-lg'
                  )}
                >
                  <WhatsappLogo weight="fill" className="h-4 w-4 text-[#25D366]" />
                  WhatsApp
                </a>
                <div className="relative" ref={shareRef}>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'WW.pro VPN', text: 'Присоединяйся к WW.pro — получи 5 бонусных дней!', url: referralLink });
                      } else {
                        setShowShare(!showShare);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                      t.border, t.textStrong, t.cardHover, 'hover:shadow-lg'
                    )}
                  >
                    <ShareNetwork weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
                    Ещё
                  </button>
                  <AnimatePresence>
                    {showShare && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'absolute bottom-full left-0 z-50 mb-2 w-56 overflow-hidden rounded-xl border-2 shadow-[0_8px_40px_rgba(0,0,0,0.5)]',
                          a.border, t.cardSolid, 'backdrop-blur-xl'
                        )}
                      >
                        {[
                          { label: 'Скопировать ссылку', icon: Copy, action: handleCopy },
                          { label: 'Email', icon: Envelope, action: () => window.open(`mailto:?subject=WW.pro VPN&body=${encodeURIComponent('Присоединяйся: ' + referralLink)}`) },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => { item.action(); setShowShare(false); }}
                            className={cn(
                              'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors',
                              t.textStrong, t.cardHover
                            )}
                          >
                            <item.icon weight={ICON_WEIGHT} className={cn('h-4 w-4', t.textMuted)} />
                            {item.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className={cn('h-px w-full', t.divider)} />

            {/* Your code */}
            <div>
              <div className={cn('mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>
                <ClipboardText weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
                Ваш реферальный код
              </div>
              <div className="flex items-center gap-3">
                <span className={cn('font-mono text-xl font-medium tracking-[0.15em]', a.text)}>{referralCode}</span>
                <button
                  onClick={handleCopyCode}
                  className={cn(
                    'rounded-lg p-2 transition-all',
                    codeCopied ? 'text-emerald-400' : cn(t.textSubtle, t.navHover)
                  )}
                >
                  {codeCopied ? <CheckCircle weight="fill" className="h-4 w-4" /> : <Copy weight={ICON_WEIGHT} className="h-4 w-4" />}
                </button>
              </div>
              <p className={cn('mt-1.5 text-xs', t.textMuted)}>Друзья вводят этот код при регистрации и получают +5 дней</p>
            </div>
          </div>
        </div>

        {/* Right: QR */}
        <div className={cn('relative overflow-hidden rounded-3xl border flex flex-col items-center p-6', t.cardSolid, t.border)}>
          <div className={cn('mb-3 flex items-center gap-2 self-start text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>
            <QrCode weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
            QR-код
          </div>
          <div className={cn('w-full max-w-[180px] rounded-2xl p-2', theme === 'dark' ? 'bg-white/[0.04]' : 'bg-black/[0.03]')}>
            <div className="aspect-square w-full overflow-hidden rounded-xl">
              <QRBlock />
            </div>
          </div>
          <p className={cn('mt-3 text-center text-[11px] leading-relaxed', t.textMuted)}>
            Покажите QR-код — друзья перейдут по вашей ссылке
          </p>
        </div>
      </div>

      {/* ── Enter code (floating, no card wrapper) ── */}
      <div className="px-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className={cn('mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>
            <Gift weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
            Есть код друга?
          </div>
          <div className={cn('flex items-center gap-2 rounded-xl border p-1', t.border, theme === 'dark' ? 'bg-white/[0.03]' : 'bg-black/[0.02]')}>
            <input
              type="text"
              placeholder="Вставьте реферальный код"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              className={cn(
                'flex-1 bg-transparent px-4 py-2.5 font-mono text-sm uppercase tracking-wider outline-none placeholder:normal-case placeholder:font-sans placeholder:tracking-normal',
                t.text, 'placeholder:text-zinc-500'
              )}
            />
            <button
              onClick={handleApplyPromo}
              disabled={!promoInput.trim()}
              className={cn(
                'shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                promoInput.trim() ? a.button : cn('opacity-30 cursor-not-allowed', a.button)
              )}
            >
              Применить
            </button>
          </div>
          <AnimatePresence>
            {promoApplied && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-400"
              >
                <CheckCircle weight="fill" className="h-3.5 w-3.5" />
                Код активирован! +5 бонусных дней
              </motion.p>
            )}
          </AnimatePresence>
          {!promoApplied && (
            <p className={cn('mt-2 text-xs', t.textMuted)}>
              Введите код друга — вы оба получите бонусные дни
            </p>
          )}
        </motion.div>
      </div>

      {/* ── How it works (floating steps, no card frames) ── */}
      <div className="px-1">
        <div className={cn('mb-6 h-px w-full', t.divider)} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn('mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}
        >
          <RocketLaunch weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
          Как это работает
        </motion.div>

        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-3">
          {[
            {
              step: '01',
              Icon: TelegramLogo,
              title: 'Привяжите Telegram',
              desc: 'Подключите свой Telegram-аккаунт и мгновенно получите 5 бонусных дней бесплатного VPN.',
            },
            {
              step: '02',
              Icon: ShareNetwork,
              title: 'Поделитесь ссылкой',
              desc: 'Отправьте вашу реферальную ссылку друзьям — каждый из них получит +5 дней при регистрации.',
            },
            {
              step: '03',
              Icon: Gift,
              title: 'Получайте бонусы',
              desc: 'За каждого друга с активной подпиской вы получаете 10 бонусных дней на свой счёт.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={cn('font-mono text-xs font-bold', a.text)}>{item.step}</span>
                <item.Icon weight={ICON_WEIGHT} className={cn('h-5 w-5', t.textMuted)} />
              </div>
              <h4 className={cn('text-sm font-medium', t.textStrong)}>{item.title}</h4>
              <p className={cn('mt-1 text-xs leading-relaxed', t.textMuted)}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Bonus Tab ── */
const ACTIVATION_STEPS = [
  { label: 'Подготовка серверов', icon: Planet, duration: 1200 },
  { label: 'Настройка конфигурации', icon: Compass, duration: 1000 },
  { label: 'Выдача доступа', icon: SealCheck, duration: 800 },
  { label: 'Готово!', icon: CheckCircle, duration: 600 },
];

const EXTEND_STEPS = [
  { label: 'Применяем бонусы', icon: Feather, duration: 1000 },
  { label: 'Обновляем подписку', icon: Spiral, duration: 800 },
  { label: 'Готово!', icon: CheckCircle, duration: 600 },
];

const RENEW_PAYMENT_STEPS = [
  { label: 'Обработка платежа', icon: CreditCard, duration: 1200 },
  { label: 'Проверка оплаты', icon: ShieldCheck, duration: 1000 },
  { label: 'Обновляем подписку', icon: Spiral, duration: 900 },
  { label: 'Готово!', icon: CheckCircle, duration: 600 },
];

const NEW_SUB_PAYMENT_STEPS = [
  { label: 'Обработка платежа', icon: CreditCard, duration: 1200 },
  { label: 'Проверка оплаты', icon: ShieldCheck, duration: 1000 },
  { label: 'Подготовка серверов', icon: Planet, duration: 1100 },
  { label: 'Создание подписки', icon: SealCheck, duration: 900 },
  { label: 'Готово!', icon: CheckCircle, duration: 600 },
];

const BonusTab = () => {
  const { t, a, hasSubscription, theme, navigateTab } = useContext(ThemeContext);

  /* Mock bonus data */
  const bonusDays = 15;
  const bonusGb = bonusDays >= 10 ? +(bonusDays / 10).toFixed(1) : 0;

  /* Mock existing subscriptions */
  const existingSubs = hasSubscription
    ? [
        { id: 'main', label: 'Основная', plan: 'Pro', endDate: '18.02.2026', daysLeft: 243 },
        { id: 'second', label: 'Рабочая', plan: 'Pro', endDate: '04.09.2025', daysLeft: 80 },
      ]
    : [];

  const [showModal, setShowModal] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(
    existingSubs.length === 1 ? existingSubs[0].id : null
  );
  const [activating, setActivating] = useState(false);
  const [activationStep, setActivationStep] = useState(0);
  const [activationDone, setActivationDone] = useState(false);

  const steps = hasSubscription ? EXTEND_STEPS : ACTIVATION_STEPS;

  const selectedSub = existingSubs.find((s) => s.id === selectedSubId) || null;

  const today = new Date();
  const bonusEndDate = new Date(today);
  bonusEndDate.setDate(bonusEndDate.getDate() + bonusDays);
  const formatDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;

  const newEndDate = selectedSub
    ? (() => {
        const parts = selectedSub.endDate.split('.');
        const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        d.setDate(d.getDate() + bonusDays);
        return formatDate(d);
      })()
    : formatDate(bonusEndDate);

  const handleActivate = () => {
    setActivating(true);
    setActivationStep(0);
    setActivationDone(false);

    let stepIdx = 0;
    const runStep = () => {
      if (stepIdx >= steps.length) {
        setActivationDone(true);
        return;
      }
      setActivationStep(stepIdx);
      setTimeout(() => {
        stepIdx++;
        runStep();
      }, steps[stepIdx].duration);
    };
    runStep();
  };

  const handleClose = () => {
    setShowModal(false);
    setActivating(false);
    setActivationStep(0);
    setActivationDone(false);
    setSelectedSubId(existingSubs.length === 1 ? existingSubs[0].id : null);
  };

  if (bonusDays <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* ── Hero card ── */}
      <div className={cn('relative overflow-hidden rounded-3xl border', t.cardSolid, t.border)}>
        <div className={cn('pointer-events-none absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full opacity-20 blur-[140px]', a.blur1)} />
        <div className={cn('pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full opacity-10 blur-[100px]', a.blur1)} />

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.3, delay: 0.1 }}
                className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', a.bgSoft)}
              >
                <Gift weight="fill" className={cn('h-6 w-6', a.text)} />
              </motion.div>
              <div>
                <div className={cn('text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>Ваши бонусы</div>
                <h2 className={cn('text-lg font-medium', t.textStrong)}>Бонусные дни</h2>
              </div>
            </div>

            {/* Bonus days counter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.2 }}
              className="relative text-right"
            >
              <div className={cn('absolute -inset-4 rounded-full opacity-20 blur-2xl animate-pulse', a.color)} />
              <div className="relative">
                <div className={cn('text-3xl font-light tabular-nums sm:text-4xl', a.text)}>{bonusDays}</div>
                <div className={cn('text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>дней</div>
              </div>
            </motion.div>
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 space-y-4"
          >
            <p className={cn('text-sm leading-relaxed', t.text)}>
              У вас накоплено <span className={cn('font-medium', a.text)}>{bonusDays} бонусных дней</span>.
              Сейчас они не активны — вы можете применить их в любой удобный момент.
              {!hasSubscription
                ? ' При активации будет создана полноценная бонусная подписка с доступом ко всем серверам.'
                : ' Выберите одну из ваших подписок, и бонусные дни продлят её срок действия.'
              }
            </p>

            {bonusGb > 0 && (
              <div className={cn('rounded-xl border p-3', t.border, theme === 'dark' ? 'bg-white/[0.02]' : 'bg-black/[0.02]')}>
                <div className="flex items-start gap-3">
                  <Hexagon weight={ICON_WEIGHT} className={cn('mt-0.5 h-4 w-4 shrink-0', a.textLight)} />
                  <div className={cn('text-sm leading-relaxed', t.text)}>
                    За каждые 10 бонусных дней начисляется <span className={cn('font-medium', a.text)}>1 ГБ</span> трафика
                    на белые списки. Ваши <span className={cn('font-medium', a.text)}>{bonusDays} дней</span> дадут{' '}
                    <span className={cn('font-medium', a.text)}>{bonusGb} ГБ</span> бонусного трафика.
                    <span className={cn('block mt-1.5 text-xs', t.textMuted)}>
                      Подписка белых списков входит в бонусную активацию. Если понадобится больше — гигабайты можно докупить отдельно.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className={cn('text-xs leading-relaxed', t.textMuted)}>
              Бонусные дни копятся за приглашённых друзей, промокоды и участие в акциях.
              Чем больше накопите — тем больше трафика и дней подписки получите при активации.
            </p>
          </motion.div>

          {/* Stats row */}
          <div className={cn('mt-5 flex items-end justify-between border-t pt-5', t.border)}>
            {[
              { value: `${bonusDays}`, label: 'Бонус-дней', Icon: Feather },
              { value: bonusGb > 0 ? `${bonusGb} ГБ` : '—', label: 'Трафик', Icon: Hexagon },
              { value: hasSubscription ? 'Продление' : 'Новая', label: 'Тип активации', Icon: hasSubscription ? Spiral : Meteor },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex-1 py-3 text-center"
              >
                <stat.Icon weight={ICON_WEIGHT} className={cn('mx-auto mb-1 h-4 w-4', a.textLight)} />
                <div className={cn('text-base font-light', t.textStrong)}>{stat.value}</div>
                <div className={cn('text-[10px]', t.textMuted)}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA button */}
        <div className={cn('border-t px-6 py-4', t.border)}>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className={cn('group flex w-full items-center justify-between rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300', a.button)}
          >
            <span className="flex items-center gap-2">
              <MagicWand weight={ICON_WEIGHT} className="h-4 w-4" />
              {hasSubscription ? `Применить ${bonusDays} бонусных дней` : `Активировать ${bonusDays} бонусных дней`}
            </span>
            <CaretRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </motion.button>
        </div>
      </div>

      {/* ── Activation Modal ── */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => { if (!activating && !activationDone) handleClose(); }}
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className={cn('mx-4 w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl', t.cardSolid, t.border)}
            >
              {/* Modal header */}
              <div className={cn('flex items-center justify-between border-b px-6 py-4', t.border)}>
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', a.bgSoft)}>
                    {hasSubscription
                      ? <Spiral weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
                      : <Meteor weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
                    }
                  </div>
                  <div>
                    <h3 className={cn('text-sm font-medium', t.textStrong)}>
                      {hasSubscription ? 'Продление подписки' : 'Бонусная подписка'}
                    </h3>
                    <p className={cn('text-xs', t.textMuted)}>
                      {hasSubscription ? 'Применить бонусы к подписке' : 'Создание новой подписки'}
                    </p>
                  </div>
                </div>
                <button onClick={handleClose} className={cn('rounded-lg p-1.5 transition-colors', t.navHover, (activating || activationDone) && 'pointer-events-none opacity-0')}>
                  <X weight="bold" className={cn('h-4 w-4', t.textMuted)} />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5">
                <AnimatePresence mode="wait">
                  {!activating && !activationDone && (
                    <motion.div
                      key="config"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      {/* Subscription selector (when has subscriptions) */}
                      {hasSubscription && existingSubs.length > 1 && (
                        <div>
                          <div className={cn('mb-2 text-xs font-medium', t.textMuted)}>Выберите подписку</div>
                          <div className="space-y-2">
                            {existingSubs.map((sub) => (
                              <motion.button
                                key={sub.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedSubId(sub.id)}
                                className={cn(
                                  'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                                  selectedSubId === sub.id
                                    ? cn(a.border, a.bgSoft)
                                    : cn(t.border, theme === 'dark' ? 'bg-white/[0.02] hover:bg-white/[0.04]' : 'bg-black/[0.02] hover:bg-black/[0.04]')
                                )}
                              >
                                <div>
                                  <div className={cn('text-sm font-medium', selectedSubId === sub.id ? a.text : t.textStrong)}>
                                    {sub.label}
                                  </div>
                                  <div className={cn('text-xs', t.textMuted)}>
                                    {sub.plan} · до {sub.endDate}
                                  </div>
                                </div>
                                <div className={cn(
                                  'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all',
                                  selectedSubId === sub.id ? cn(a.border, a.color) : t.border
                                )}>
                                  {selectedSubId === sub.id && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="h-2 w-2 rounded-full bg-white"
                                    />
                                  )}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      <div className={cn('space-y-3 rounded-xl border p-4', t.border, theme === 'dark' ? 'bg-white/[0.02]' : 'bg-black/[0.02]')}>
                        <div className="flex items-center justify-between">
                          <span className={cn('text-xs', t.textMuted)}>Бонусных дней</span>
                          <span className={cn('text-sm font-medium', a.text)}>{bonusDays}</span>
                        </div>
                        {bonusGb > 0 && (
                          <div className="flex items-center justify-between">
                            <span className={cn('text-xs', t.textMuted)}>Бонусный трафик</span>
                            <span className={cn('text-sm font-medium', a.text)}>{bonusGb} ГБ</span>
                          </div>
                        )}
                        {hasSubscription && selectedSub && (
                          <>
                            <div className={cn('h-px', t.border)} />
                            <div className="flex items-center justify-between">
                              <span className={cn('text-xs', t.textMuted)}>Подписка</span>
                              <span className={cn('text-sm font-medium', t.textStrong)}>{selectedSub.label} ({selectedSub.plan})</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={cn('text-xs', t.textMuted)}>Текущее окончание</span>
                              <span className={cn('text-sm', t.text)}>{selectedSub.endDate}</span>
                            </div>
                          </>
                        )}
                        <div className={cn('h-px', t.border)} />
                        {hasSubscription && selectedSub ? (
                          <div className="flex items-center justify-between">
                            <span className={cn('text-xs font-medium', t.textMuted)}>Новая дата окончания</span>
                            <span className={cn('text-sm font-medium', a.text)}>{newEndDate}</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <span className={cn('text-xs', t.textMuted)}>Тип подписки</span>
                              <span className={cn('text-sm font-medium', t.textStrong)}>Бонусная</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={cn('text-xs', t.textMuted)}>Начало</span>
                              <span className={cn('text-sm', t.text)}>{formatDate(today)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={cn('text-xs font-medium', t.textMuted)}>Окончание</span>
                              <span className={cn('text-sm font-medium', a.text)}>{newEndDate}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Activate button */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleActivate}
                        disabled={hasSubscription && !selectedSubId}
                        className={cn(
                          'flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all',
                          hasSubscription && !selectedSubId ? 'cursor-not-allowed opacity-40' : '',
                          a.button
                        )}
                      >
                        <MagicWand weight={ICON_WEIGHT} className="h-4 w-4" />
                        {hasSubscription ? 'Применить бонусы' : 'Создать подписку'}
                      </motion.button>
                    </motion.div>
                  )}

                  {activating && !activationDone && (
                    <motion.div
                      key="progress"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-5 py-4"
                    >
                      {/* Center pulsing icon */}
                      <div className="flex justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className={cn('flex h-16 w-16 items-center justify-center rounded-full', a.bgSoft)}
                        >
                          {hasSubscription
                            ? <Spiral weight="fill" className={cn('h-8 w-8', a.text)} />
                            : <Parachute weight="fill" className={cn('h-8 w-8', a.text)} />
                          }
                        </motion.div>
                      </div>

                      {/* Progress steps */}
                      <div className="space-y-3">
                        {steps.map((step, i) => {
                          const isActive = i === activationStep;
                          const isDone = i < activationStep;
                          return (
                            <motion.div
                              key={step.label}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{
                                opacity: isDone || isActive ? 1 : 0.3,
                                x: 0,
                              }}
                              transition={{ delay: i * 0.1, duration: 0.3 }}
                              className="flex items-center gap-3"
                            >
                              <div className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300',
                                isDone ? cn(a.bgSoft) : isActive ? cn(a.bgSoft) : theme === 'dark' ? 'bg-white/[0.04]' : 'bg-black/[0.04]'
                              )}>
                                {isDone ? (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
                                    <CheckCircle weight="fill" className={cn('h-4 w-4', a.text)} />
                                  </motion.div>
                                ) : (
                                  <step.icon
                                    weight={ICON_WEIGHT}
                                    className={cn('h-4 w-4', isActive ? a.text : t.textSubtle)}
                                  />
                                )}
                              </div>
                              <span className={cn(
                                'text-sm transition-all duration-300',
                                isDone ? cn('font-medium', a.text) : isActive ? cn('font-medium', t.textStrong) : t.textSubtle
                              )}>
                                {step.label}
                              </span>
                              {isActive && (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  className={cn('ml-auto h-4 w-4 rounded-full border-2 border-t-transparent', a.border)}
                                />
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Progress bar */}
                      <div className={cn('h-1 w-full overflow-hidden rounded-full', theme === 'dark' ? 'bg-white/[0.06]' : 'bg-black/[0.05]')}>
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: `${((activationStep + 1) / steps.length) * 100}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          className={cn('h-full rounded-full', a.color)}
                        />
                      </div>
                    </motion.div>
                  )}

                  {activationDone && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.3 }}
                      className="space-y-5 py-4"
                    >
                      {/* Success animation */}
                      <div className="relative flex justify-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
                          className={cn('flex h-20 w-20 items-center justify-center rounded-full', a.bgSoft)}
                        >
                          <SealCheck weight="fill" className={cn('h-10 w-10', a.text)} />
                        </motion.div>
                        {/* Confetti particles */}
                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0.5],
                              x: Math.cos((i * Math.PI) / 4) * 60,
                              y: Math.sin((i * Math.PI) / 4) * 60,
                            }}
                            transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                            className={cn('absolute h-2 w-2 rounded-full', i % 2 === 0 ? a.color : theme === 'dark' ? 'bg-white/40' : 'bg-black/20')}
                          />
                        ))}
                      </div>

                      <div className="text-center">
                        <h3 className={cn('text-lg font-medium', t.textStrong)}>
                          {hasSubscription ? 'Подписка продлена!' : 'Подписка создана!'}
                        </h3>
                      </div>

                      {/* Subscription details card */}
                      <div className={cn('space-y-3 rounded-xl border p-4', t.border, theme === 'dark' ? 'bg-white/[0.02]' : 'bg-black/[0.02]')}>
                        <div className="flex items-center justify-between">
                          <span className={cn('text-xs', t.textMuted)}>Тип</span>
                          <span className={cn('text-sm font-medium', t.textStrong)}>{hasSubscription && selectedSub ? selectedSub.label : 'Бонусная'}</span>
                        </div>
                        {!hasSubscription && (
                          <div className="flex items-center justify-between">
                            <span className={cn('text-xs', t.textMuted)}>Начало</span>
                            <span className={cn('text-sm', t.text)}>{formatDate(today)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={cn('text-xs', t.textMuted)}>{hasSubscription ? 'Новая дата окончания' : 'Активна до'}</span>
                          <span className={cn('text-sm font-medium', a.text)}>{newEndDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={cn('text-xs', t.textMuted)}>Бонусных дней</span>
                          <span className={cn('text-sm font-medium', a.text)}>{bonusDays}</span>
                        </div>
                        {bonusGb > 0 && (
                          <div className="flex items-center justify-between">
                            <span className={cn('text-xs', t.textMuted)}>Белые списки</span>
                            <span className={cn('text-sm font-medium', a.text)}>+ {bonusGb} ГБ</span>
                          </div>
                        )}
                      </div>

                      {/* Redirect prompt */}
                      <div className="space-y-3">
                        <p className={cn('text-center text-xs leading-relaxed', t.textMuted)}>
                          {hasSubscription
                            ? 'Бонусы успешно применены. Перейдите в настройки VPN, чтобы проверить обновлённую подписку.'
                            : 'Перейдите к настройке VPN, чтобы добавить подписку в приложение и подключиться к серверам.'
                          }
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { handleClose(); navigateTab('billing'); }}
                          className={cn('flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all', a.button)}
                        >
                          <Compass weight={ICON_WEIGHT} className="h-4 w-4" />
                          Перейти к настройке VPN
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </motion.div>
  );
};

/* ── Notifications Tab ── */
const NotificationsTab = () => {
  const { t, a, theme, navigateTab } = useContext(ThemeContext);
  const { notifications, unreadCount, dismiss, markAllRead, markRead, toggleStar } = useNotifications();
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [search, setSearch] = useState('');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'starred' && !n.starred) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.body.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selected = notifications.find((n) => n.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    markRead(id);
  };

  const filterTabs: { key: 'all' | 'unread' | 'starred'; label: string; count: number }[] = [
    { key: 'all', label: 'Все', count: notifications.length },
    { key: 'unread', label: 'Непрочитанные', count: unreadCount },
    { key: 'starred', label: 'Избранные', count: notifications.filter((n) => !!n.starred).length },
  ];

  const TYPE_LABELS: Record<NotificationType, string> = {
    promo: 'Акция',
    info: 'Информация',
    success: 'Успех',
    system: 'Система',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Main Inbox ── */}
      <div className={cn('relative overflow-hidden rounded-3xl border', t.cardSolid, t.border)}>
        {/* Toolbar */}
        <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b py-3', isMobile ? 'px-3' : 'px-5', t.border)}>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  filter === tab.key ? cn(a.bgSoft, a.text) : cn(t.textMuted, t.navHover)
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px]',
                      filter === tab.key ? cn(theme === 'dark' ? 'bg-white/10' : 'bg-black/10') : t.card
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-1.5', t.border, t.card)}>
              <MagnifyingGlass weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5', t.textSubtle)} />
              <input
                type="text"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn('w-32 bg-transparent text-xs outline-none placeholder:text-zinc-500', t.text)}
              />
            </div>

            {/* Mark all read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-all', a.bgSoft, a.text, 'hover:opacity-80')}
              >
                Прочитать все
              </button>
            )}

            {/* Navigate to notification settings in Preferences */}
            <button
              onClick={() => navigateTab('preferences', 'notifications-section')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                t.border, t.card, 'hover:opacity-80', t.borderHover
              )}
            >
              <GearSix
                weight={ICON_WEIGHT}
                className={cn('h-3.5 w-3.5', t.textMuted)}
              />
              <span className={cn(t.textMuted, 'hidden sm:inline')}>Настроить</span>
            </button>
          </div>
        </div>

        {/* Two-panel layout (stacks on mobile) */}
        <div className={cn('flex', isMobile ? 'flex-col' : 'flex-row')} style={{ minHeight: '520px' }}>
          {/* Left: notification list — full width on mobile when no detail selected, or always visible on desktop */}
          <div className={cn(
            'shrink-0 overflow-y-auto',
            isMobile ? 'border-b' : 'w-[340px] border-r',
            t.border,
            selectedId && isMobile && 'hidden'
          )} style={{ maxHeight: '520px' }}>
            {filteredNotifications.length === 0 ? (
              <div className={cn('flex flex-col items-center justify-center py-16 text-center', t.textSubtle)}>
                <EnvelopeOpen weight={ICON_WEIGHT} className="mb-3 h-8 w-8 opacity-30" />
                <p className="text-xs">Нет уведомлений</p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const IconComp = NOTIFICATION_ICONS[n.type];
                const isSelected = selectedId === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleSelect(n.id)}
                    className={cn(
                      'group relative flex w-full items-start gap-3 border-b px-4 py-3.5 text-left transition-all',
                      t.border,
                      isSelected ? a.bgSoft : t.cardHover,
                      !n.read && !isSelected && (theme === 'dark' ? 'bg-white/[0.02]' : 'bg-black/[0.02]')
                    )}
                  >
                    {/* Accent left bar for selected */}
                    {isSelected && (
                      <div className={cn('absolute bottom-2 left-0 top-2 w-0.5 rounded-full', a.color)} />
                    )}
                    <div
                      className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        n.type === 'promo' ? a.bgSoft : t.card
                      )}
                    >
                      <IconComp
                        weight={n.type === 'promo' ? 'fill' : ICON_WEIGHT}
                        className={cn('h-4 w-4', n.type === 'promo' ? a.text : t.textMuted)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-xs',
                            !n.read ? cn('font-semibold', t.textStrong) : cn('font-medium', t.text)
                          )}
                        >
                          {n.title}
                        </span>
                        {!n.read && <div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', a.color)} />}
                      </div>
                      <p className={cn('mt-0.5 truncate text-[11px] leading-relaxed', t.textMuted)}>{n.body}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={cn('text-[10px]', t.textSubtle)}>{n.time}</span>
                        {n.starred && <Star weight="fill" className="h-2.5 w-2.5 text-amber-400" />}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: detail view — hidden on mobile when nothing selected */}
          <div className={cn('flex-1 overflow-y-auto', !selectedId && isMobile && 'hidden')} style={{ maxHeight: '520px' }}>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={isMobile ? 'p-4' : 'p-6'}
                >
                  {/* Mobile back button */}
                  <button
                    onClick={() => setSelectedId(null)}
                    className={cn('mb-3 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors', isMobile ? '' : 'hidden', t.textMuted, t.navHover)}
                  >
                    <CaretRight weight="bold" className="h-3 w-3 rotate-180" />
                    Назад к списку
                  </button>
                  {/* Detail header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', a.bgSoft)}>
                        {(() => {
                          const IC = NOTIFICATION_ICONS[selected.type];
                          return <IC weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />;
                        })()}
                      </div>
                      <div>
                        <h2 className={cn('text-lg font-medium leading-tight', t.textStrong)}>{selected.title}</h2>
                        <div className={cn('mt-1.5 flex items-center gap-3 text-xs', t.textSubtle)}>
                          <span>{selected.time}</span>
                          <span>•</span>
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', a.bgSoft, a.text)}>
                            {TYPE_LABELS[selected.type]}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleStar(selected.id)}
                        className={cn('rounded-lg p-2 transition-all', t.navHover)}
                        title={selected.starred ? 'Убрать из избранного' : 'В избранное'}
                      >
                        <Star
                          weight={selected.starred ? 'fill' : ICON_WEIGHT}
                          className={cn('h-4 w-4', selected.starred ? 'text-amber-400' : t.textSubtle)}
                        />
                      </button>
                      <button
                        onClick={() => {
                          dismiss(selected.id);
                          setSelectedId(null);
                        }}
                        className={cn('rounded-lg p-2 transition-all', t.navHover)}
                        title="Удалить"
                      >
                        <Trash weight={ICON_WEIGHT} className={cn('h-4 w-4', t.textSubtle)} />
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className={cn('my-5 h-px w-full', t.divider)} />

                  {/* Body */}
                  <div className={cn('text-sm leading-relaxed whitespace-pre-line', t.text)}>
                    {selected.fullBody || selected.body}
                  </div>

                  {/* Action */}
                  {selected.action && (
                    <div className="mt-6">
                      <a
                        href={selected.action.href}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all',
                          a.button
                        )}
                      >
                        {selected.action.label}
                        <CaretRight weight="bold" className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn('flex h-full flex-col items-center justify-center text-center', t.textSubtle)}
                >
                  <Envelope weight={ICON_WEIGHT} className="mb-3 h-12 w-12 opacity-20" />
                  <p className={cn('text-sm font-medium', t.textMuted)}>Выберите уведомление</p>
                  <p className="mt-1 max-w-xs text-xs">
                    Нажмите на уведомление слева, чтобы прочитать полное содержание
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Preferences Tab ── */
const PreferencesTab = () => {
  const { t, a, theme } = useContext(ThemeContext);

  /* ── profile state ── */
  const [editingField, setEditingField] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('Влад');
  const [tempValue, setTempValue] = useState('');

  /* ── telegram data (read-only from linked account) ── */
  const tgLinked = true;
  const tgNickname = '@vlad_dev';
  const tgId = '829104571';

  /* ── email data ── */
  const [emailLinked, setEmailLinked] = useState(false);
  const [emailAddr, setEmailAddr] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [showEmailConnect, setShowEmailConnect] = useState(false);

  /* ── notification settings ── */
  const [tgNotify, setTgNotify] = useState(true);
  const [emailNotify, setEmailNotify] = useState(false);
  const [pushNotify, setPushNotify] = useState(true);
  const [soundNotify, setSoundNotify] = useState(true);
  const [promoCategory, setPromoCategory] = useState(true);
  const [infoCategory, setInfoCategory] = useState(true);
  const [systemCategory, setSystemCategory] = useState(true);

  /* ── security ── */
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSessions, setShowSessions] = useState(false);

  const sessions = [
    { id: 1, device: 'MacBook Pro 16"', os: 'macOS Sequoia', browser: 'Safari 18.2', location: 'Москва, Россия', ip: '185.220.xx.xx', current: true, time: 'Сейчас активна' },
    { id: 2, device: 'iPhone 14 Pro', os: 'iOS 19.1', browser: 'WW.pro App', location: 'Москва, Россия', ip: '185.220.xx.xx', current: false, time: '2 часа назад' },
    { id: 3, device: 'Windows Desktop', os: 'Windows 11', browser: 'Chrome 124', location: 'Санкт-Петербург, Россия', ip: '91.108.xx.xx', current: false, time: '3 дня назад' },
  ];

  /* ── copy feedback ── */
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const startEdit = (field: string, value: string) => { setEditingField(field); setTempValue(value); };
  const cancelEdit = () => { setEditingField(null); setTempValue(''); };
  const saveEdit = (setter: (v: string) => void) => { setter(tempValue); setEditingField(null); setTempValue(''); };

  /* ── inline toggle ── */
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300',
        checked ? a.color : theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
      )}
    >
      <div className={cn(
        'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300',
        checked ? 'translate-x-4' : 'translate-x-0.5'
      )} />
    </button>
  );

  return (
    <motion.div
      key="preferences"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* ═══════════ PROFILE ═══════════ */}
      <section>
        <div className={cn('mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider', t.textSubtle)}>
          <User weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
          <span>Профиль</span>
        </div>

        <GlowCard>
          <div className="p-6">
            {/* Avatar row */}
            <div className="flex items-center gap-4 mb-6">
              <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-full', a.bgSoft)}>
                <User weight={ICON_WEIGHT} className={cn('h-6 w-6', a.text)} />
              </div>
              <div className="min-w-0">
                <div className={cn('text-lg font-medium leading-tight', t.textStrong)}>{displayName}</div>
                <div className={cn('text-xs mt-0.5', t.textMuted)}>Так к вам будет обращаться служба поддержки</div>
              </div>
            </div>

            {/* profile fields */}
            <div className={cn('divide-y', t.divide)}>
              {/* Display name */}
              <div className="py-3.5 first:pt-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className={cn('text-xs mb-0.5', t.textMuted)}>Отображаемое имя</div>
                    {editingField === 'name' ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          autoFocus
                          className={cn(
                            'flex-1 rounded-xl border bg-transparent px-3 py-1.5 text-sm outline-none transition-colors',
                            t.border, t.textStrong
                          )}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(setDisplayName);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <button onClick={() => saveEdit(setDisplayName)} className={cn('rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors', a.bgSoft, a.text)}>Ок</button>
                        <button onClick={cancelEdit} className={cn('rounded-lg px-2.5 py-1.5 text-xs transition-colors', t.textMuted, t.cardHover)}>Отмена</button>
                      </div>
                    ) : (
                      <div className={cn('text-sm font-medium', t.textStrong)}>{displayName}</div>
                    )}
                  </div>
                  {editingField !== 'name' && (
                    <button onClick={() => startEdit('name', displayName)} className={cn('rounded-lg p-1.5 transition-colors', t.cardHover)}>
                      <PencilSimple weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5', t.textSubtle)} />
                    </button>
                  )}
                </div>
              </div>

              {/* Telegram info */}
              {tgLinked && (
                <>
                  <div className="py-3.5">
                    <div className={cn('text-xs mb-0.5', t.textMuted)}>Telegram никнейм</div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(tgNickname); setCopiedField('tg-nick'); setTimeout(() => setCopiedField(null), 1500); }}
                      className={cn('group flex items-center gap-2 rounded-lg -mx-1.5 px-1.5 py-0.5 transition-colors', t.cardHover)}
                    >
                      <TelegramLogo weight="fill" className="h-3.5 w-3.5 text-[#2AABEE]" />
                      <span className={cn('text-sm font-medium', t.textStrong)}>{tgNickname}</span>
                      {copiedField === 'tg-nick'
                        ? <CheckCircle weight="fill" className="h-3.5 w-3.5 text-emerald-400" />
                        : <Copy weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100', t.textSubtle)} />}
                    </button>
                  </div>
                  <div className="py-3.5">
                    <div className={cn('text-xs mb-0.5', t.textMuted)}>Telegram ID</div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(tgId); setCopiedField('tg-id'); setTimeout(() => setCopiedField(null), 1500); }}
                      className={cn('group flex items-center gap-2 rounded-lg -mx-1.5 px-1.5 py-0.5 transition-colors', t.cardHover)}
                    >
                      <TelegramLogo weight="fill" className="h-3.5 w-3.5 text-[#2AABEE]" />
                      <span className={cn('font-mono text-sm', t.textStrong)}>{tgId}</span>
                      {copiedField === 'tg-id'
                        ? <CheckCircle weight="fill" className="h-3.5 w-3.5 text-emerald-400" />
                        : <Copy weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100', t.textSubtle)} />}
                    </button>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="py-3.5">
                <div className={cn('text-xs mb-0.5', t.textMuted)}>Электронная почта</div>
                {emailLinked ? (
                  <div className={cn('text-sm font-medium', t.textStrong)}>{emailAddr}</div>
                ) : (
                  <div className={cn('text-sm', t.textSubtle)}>Не указана</div>
                )}
              </div>

              {/* Member since */}
              <div className="py-3.5 last:pb-0">
                <div className={cn('text-xs mb-0.5', t.textMuted)}>Дата регистрации</div>
                <span className={cn('text-sm', t.textStrong)}>14 марта 2026</span>
              </div>
            </div>
          </div>
        </GlowCard>
      </section>

      {/* ═══════════ CONNECTED ACCOUNTS ═══════════ */}
      <section>
        <div className={cn('mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider', t.textSubtle)}>
          <Plugs weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
          <span>Привязанные аккаунты</span>
        </div>

        <div className="space-y-3">
          {/* Telegram */}
          <GlowCard>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2AABEE]/10">
                  <TelegramLogo weight="fill" className="h-5 w-5 text-[#2AABEE]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium', t.textStrong)}>Telegram</span>
                    {tgLinked && (
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', a.bgSoft, a.text)}>
                        Подключено
                      </span>
                    )}
                  </div>
                  {tgLinked ? (
                    <div className={cn('text-xs mt-0.5', t.textMuted)}>{tgNickname} · ID {tgId}</div>
                  ) : (
                    <div className={cn('text-xs mt-0.5', t.textSubtle)}>Привяжите для быстрого входа и уведомлений</div>
                  )}
                </div>
                {tgLinked ? (
                  <button className={cn('rounded-xl px-3 py-1.5 text-xs font-medium transition-colors', t.textMuted, t.cardHover)}>
                    Отвязать
                  </button>
                ) : (
                  <button className={cn('rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors', a.bgSoft, a.text, a.border)}>
                    Привязать
                  </button>
                )}
              </div>
            </div>
          </GlowCard>

          {/* Email */}
          <GlowCard>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', emailLinked ? a.bgSoft : (theme === 'dark' ? 'bg-white/[0.04]' : 'bg-black/[0.04]'))}>
                  <Envelope weight={emailLinked ? 'fill' : ICON_WEIGHT} className={cn('h-5 w-5', emailLinked ? a.text : t.textSubtle)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium', t.textStrong)}>Электронная почта</span>
                    {emailLinked && (
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', a.bgSoft, a.text)}>
                        Подключено
                      </span>
                    )}
                  </div>
                  {emailLinked ? (
                    <div className={cn('text-xs mt-0.5', t.textMuted)}>{emailAddr}</div>
                  ) : (
                    <div className={cn('text-xs mt-0.5', t.textSubtle)}>Для восстановления доступа и уведомлений</div>
                  )}
                </div>
                {emailLinked ? (
                  <button onClick={() => { setEmailLinked(false); setEmailAddr(''); }} className={cn('rounded-xl px-3 py-1.5 text-xs font-medium transition-colors', t.textMuted, t.cardHover)}>
                    Отвязать
                  </button>
                ) : (
                  <button onClick={() => setShowEmailConnect(!showEmailConnect)} className={cn('rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors', a.bgSoft, a.text, a.border)}>
                    Привязать
                  </button>
                )}
              </div>

              {/* Email connect form */}
              <AnimatePresence>
                {showEmailConnect && !emailLinked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={cn('mt-4 flex items-center gap-2 border-t pt-4', t.border)}>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        autoFocus
                        className={cn(
                          'flex-1 rounded-xl border bg-transparent px-3 py-2 text-sm outline-none transition-colors',
                          t.border, t.textStrong, 'placeholder:' + t.textSubtle
                        )}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && emailInput.includes('@')) {
                            setEmailAddr(emailInput);
                            setEmailLinked(true);
                            setShowEmailConnect(false);
                            setEmailInput('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (emailInput.includes('@')) {
                            setEmailAddr(emailInput);
                            setEmailLinked(true);
                            setShowEmailConnect(false);
                            setEmailInput('');
                          }
                        }}
                        className={cn('rounded-xl px-3.5 py-2 text-xs font-medium transition-colors', a.button)}
                      >
                        Подтвердить
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlowCard>
        </div>
      </section>

      {/* ═══════════ NOTIFICATIONS ═══════════ */}
      <section id="notifications-section">
        <div className={cn('mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider', t.textSubtle)}>
          <Bell weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
          <span>Уведомления</span>
        </div>

        <GlowCard>
          <div className="p-6">
            {/* Channels */}
            <div className={cn('mb-2 text-xs font-medium', t.textMuted)}>Каналы доставки</div>
            <div className={cn('divide-y mb-6', t.divide)}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <TelegramLogo weight={ICON_WEIGHT} className={cn('h-4 w-4', tgNotify ? 'text-[#2AABEE]' : t.textSubtle)} />
                  <div>
                    <div className={cn('text-sm', t.textStrong)}>Telegram</div>
                    <div className={cn('text-xs', t.textMuted)}>{tgNotify ? 'Уведомления через бота' : 'Отключены'}</div>
                  </div>
                </div>
                <Toggle checked={tgNotify} onChange={setTgNotify} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Envelope weight={ICON_WEIGHT} className={cn('h-4 w-4', emailNotify ? a.text : t.textSubtle)} />
                  <div>
                    <div className={cn('text-sm', t.textStrong)}>Email</div>
                    <div className={cn('text-xs', t.textMuted)}>{emailNotify ? (emailAddr || 'Укажите почту выше') : 'Отключены'}</div>
                  </div>
                </div>
                <Toggle checked={emailNotify} onChange={setEmailNotify} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <DeviceMobile weight={ICON_WEIGHT} className={cn('h-4 w-4', pushNotify ? a.text : t.textSubtle)} />
                  <div>
                    <div className={cn('text-sm', t.textStrong)}>Push</div>
                    <div className={cn('text-xs', t.textMuted)}>{pushNotify ? 'Браузерные push-уведомления' : 'Отключены'}</div>
                  </div>
                </div>
                <Toggle checked={pushNotify} onChange={setPushNotify} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Bell weight={ICON_WEIGHT} className={cn('h-4 w-4', soundNotify ? a.text : t.textSubtle)} />
                  <div>
                    <div className={cn('text-sm', t.textStrong)}>Звук</div>
                    <div className={cn('text-xs', t.textMuted)}>{soundNotify ? 'Звуковое оповещение' : 'Без звука'}</div>
                  </div>
                </div>
                <Toggle checked={soundNotify} onChange={setSoundNotify} />
              </div>
            </div>

            {/* Categories */}
            <div className={cn('mb-2 text-xs font-medium', t.textMuted)}>Категории</div>
            <div className={cn('divide-y', t.divide)}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Gift weight={ICON_WEIGHT} className="h-4 w-4 text-amber-500" />
                  <div>
                    <div className={cn('text-sm', t.textStrong)}>Акции и бонусы</div>
                    <div className={cn('text-xs', t.textMuted)}>Скидки, промокоды, подарки</div>
                  </div>
                </div>
                <Toggle checked={promoCategory} onChange={setPromoCategory} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Info weight={ICON_WEIGHT} className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className={cn('text-sm', t.textStrong)}>Информационные</div>
                    <div className={cn('text-xs', t.textMuted)}>Обновления, новые серверы</div>
                  </div>
                </div>
                <Toggle checked={infoCategory} onChange={setInfoCategory} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck weight={ICON_WEIGHT} className="h-4 w-4 text-rose-500" />
                  <div>
                    <div className={cn('text-sm', t.textStrong)}>Системные</div>
                    <div className={cn('text-xs', t.textMuted)}>Безопасность, обслуживание</div>
                  </div>
                </div>
                <Toggle checked={systemCategory} onChange={setSystemCategory} />
              </div>
            </div>
          </div>
        </GlowCard>
      </section>

      {/* ═══════════ SECURITY ═══════════ */}
      <section>
        <div className={cn('mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider', t.textSubtle)}>
          <ShieldCheck weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
          <span>Безопасность</span>
        </div>

        <div className="space-y-3">
          {/* Change password */}
          <GlowCard>
            <div className="p-5">
              <button onClick={() => setShowChangePassword(!showChangePassword)} className="flex w-full items-center gap-3 text-left">
                <Lock weight={ICON_WEIGHT} className={cn('h-4.5 w-4.5 shrink-0', t.textMuted)} />
                <div className="min-w-0 flex-1">
                  <div className={cn('text-sm font-medium', t.textStrong)}>Сменить пароль</div>
                  <div className={cn('text-xs mt-0.5', t.textMuted)}>Последнее изменение: не задан</div>
                </div>
                <CaretRight weight="bold" className={cn('h-3.5 w-3.5 shrink-0 transition-transform', t.textSubtle, showChangePassword && 'rotate-90')} />
              </button>

              <AnimatePresence>
                {showChangePassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={cn('mt-4 space-y-3 border-t pt-4', t.border)}>
                      <div>
                        <label className={cn('mb-1 block text-xs', t.textMuted)}>Текущий пароль</label>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="••••••••"
                          className={cn(
                            'w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none transition-colors',
                            t.border, t.textStrong, 'placeholder:' + t.textSubtle
                          )}
                        />
                      </div>
                      <div>
                        <label className={cn('mb-1 block text-xs', t.textMuted)}>Новый пароль</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Минимум 8 символов"
                          className={cn(
                            'w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none transition-colors',
                            t.border, t.textStrong, 'placeholder:' + t.textSubtle
                          )}
                        />
                      </div>
                      <div>
                        <label className={cn('mb-1 block text-xs', t.textMuted)}>Подтвердите пароль</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Повторите новый пароль"
                          className={cn(
                            'w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none transition-colors',
                            t.border, t.textStrong, 'placeholder:' + t.textSubtle
                          )}
                        />
                      </div>
                      <button className={cn('mt-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors', a.button)}>
                        Обновить пароль
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlowCard>

          {/* Active sessions */}
          <GlowCard>
            <div className="p-5">
              <button onClick={() => setShowSessions(!showSessions)} className="flex w-full items-center gap-3 text-left">
                <Fingerprint weight={ICON_WEIGHT} className={cn('h-4.5 w-4.5 shrink-0', t.textMuted)} />
                <div className="min-w-0 flex-1">
                  <div className={cn('text-sm font-medium', t.textStrong)}>Активные сессии</div>
                  <div className={cn('text-xs mt-0.5', t.textMuted)}>{sessions.length} устройств</div>
                </div>
                <CaretRight weight="bold" className={cn('h-3.5 w-3.5 shrink-0 transition-transform', t.textSubtle, showSessions && 'rotate-90')} />
              </button>

              <AnimatePresence>
                {showSessions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={cn('mt-4 space-y-2 border-t pt-4', t.border)}>
                      {sessions.map((s) => (
                        <div key={s.id} className={cn('flex items-center gap-3 rounded-xl p-3 transition-colors', s.current ? a.bgSoft : '', t.cardHover.replace('hover:', ''))}>
                          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', s.current ? a.bgSoft : (theme === 'dark' ? 'bg-white/[0.04]' : 'bg-black/[0.04]'))}>
                            {s.os.includes('macOS') ? <Laptop weight={ICON_WEIGHT} className={cn('h-4 w-4', s.current ? a.text : t.textMuted)} /> :
                             s.os.includes('iOS') ? <DeviceMobile weight={ICON_WEIGHT} className={cn('h-4 w-4', s.current ? a.text : t.textMuted)} /> :
                             <Desktop weight={ICON_WEIGHT} className={cn('h-4 w-4', s.current ? a.text : t.textMuted)} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn('text-sm font-medium', t.textStrong)}>{s.device}</span>
                              {s.current && <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase', a.bgSoft, a.text)}>Текущая</span>}
                            </div>
                            <div className={cn('text-xs mt-0.5', t.textMuted)}>
                              {s.browser} · {s.location}
                            </div>
                            <div className={cn('text-[11px]', t.textSubtle)}>
                              {s.time} · <span className="font-mono">{s.ip}</span>
                            </div>
                          </div>
                          {!s.current && (
                            <button className={cn('rounded-lg p-1.5 transition-colors text-red-400 hover:bg-red-500/10')}>
                              <X weight="bold" className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button className={cn('mt-1 w-full rounded-xl py-2 text-center text-xs font-medium transition-colors text-red-400 hover:bg-red-500/10')}>
                        Завершить все сессии кроме текущей
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlowCard>
        </div>
      </section>

      {/* ═══════════ ACCOUNT ═══════════ */}
      <section>
        <div className={cn('mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider', t.textSubtle)}>
          <GearSix weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
          <span>Аккаунт</span>
        </div>

        <button className={cn(
          'flex w-full items-center gap-3 rounded-2xl border p-5 text-left transition-all',
          t.card, t.border, t.borderHover
        )}>
          <SignOut weight={ICON_WEIGHT} className={cn('h-4.5 w-4.5 shrink-0', t.textMuted)} />
          <div className="min-w-0 flex-1">
            <div className={cn('text-sm font-medium', t.textStrong)}>Выйти из аккаунта</div>
            <div className={cn('text-xs mt-0.5', t.textMuted)}>Завершить текущую сессию на этом устройстве</div>
          </div>
          <CaretRight weight="bold" className={cn('h-3.5 w-3.5 shrink-0', t.textSubtle)} />
        </button>
      </section>

      {/* bottom spacer */}
      <div className="h-4" />
    </motion.div>
  );
};

/* ── Operations History Tab ── */
type OperationType = 'purchase' | 'bonus' | 'refund' | 'renewal' | 'promo';

type Operation = {
  id: string;
  txId: string;
  type: OperationType;
  title: string;
  description: string;
  amount: string;
  date: string;
  time: string;
  status: 'success' | 'pending' | 'failed';
  userId: string;
  userName: string;
  method?: string;
  plan?: string;
  period?: string;
  bonusAmount?: string;
};

const OPERATION_TYPE_META: Record<OperationType, { label: string; icon: React.ElementType; color: string }> = {
  purchase: { label: 'Покупка', icon: ShoppingCartSimple, color: 'text-blue-400' },
  bonus: { label: 'Бонус', icon: Gift, color: 'text-amber-400' },
  refund: { label: 'Возврат', icon: ClockCounterClockwise, color: 'text-rose-400' },
  renewal: { label: 'Продление', icon: RocketLaunch, color: 'text-emerald-400' },
  promo: { label: 'Промокод', icon: Confetti, color: 'text-violet-400' },
};

const OPERATIONS_HISTORY: Operation[] = [
  {
    id: 'op-1',
    txId: 'TXN-20260310-7A3F',
    type: 'purchase',
    title: 'Подписка Pro — 3 месяца',
    description: 'Оплата подписки Pro на 3 месяца через ЮKassa',
    amount: '249 ₽',
    date: '10 мар 2026',
    time: '14:32',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
    method: 'ЮKassa (Visa ··4832)',
    plan: 'Pro',
    period: '10 мар — 10 июн 2026',
  },
  {
    id: 'op-2',
    txId: 'TXN-20260308-1B92',
    type: 'bonus',
    title: 'Реферальный бонус +7 дней',
    description: 'Начисление бонусных дней за приглашённого пользователя @anna_k',
    amount: '+7 дней',
    date: '8 мар 2026',
    time: '09:15',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
    bonusAmount: '7 дней VPN',
  },
  {
    id: 'op-3',
    txId: 'TXN-20260301-4E7D',
    type: 'promo',
    title: 'Промокод SPRING2026',
    description: 'Активация промокода — скидка 30% на годовой тариф',
    amount: '-30%',
    date: '1 мар 2026',
    time: '18:44',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
  },
  {
    id: 'op-4',
    txId: 'TXN-20260215-9C1A',
    type: 'renewal',
    title: 'Автопродление Pro — 1 месяц',
    description: 'Автоматическое продление подписки Pro',
    amount: '99 ₽',
    date: '15 фев 2026',
    time: '00:01',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
    method: 'ЮKassa (Visa ··4832)',
    plan: 'Pro',
    period: '15 фев — 15 мар 2026',
  },
  {
    id: 'op-5',
    txId: 'TXN-20260210-3F8B',
    type: 'purchase',
    title: 'Подписка Pro — 1 месяц',
    description: 'Первая оплата подписки через CryptoBot',
    amount: '99 ₽',
    date: '10 фев 2026',
    time: '11:20',
    status: 'failed',
    userId: '829104571',
    userName: '@vlad_dev',
    method: 'CryptoBot (USDT)',
    plan: 'Pro',
  },
  {
    id: 'op-6',
    txId: 'TXN-20260205-6D4E',
    type: 'bonus',
    title: 'Бонус привязка Telegram',
    description: 'Начисление 5 бесплатных дней за привязку Telegram-аккаунта',
    amount: '+5 дней',
    date: '5 фев 2026',
    time: '16:03',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
    bonusAmount: '5 дней VPN',
  },
  {
    id: 'op-7',
    txId: 'TXN-20260120-2A9F',
    type: 'refund',
    title: 'Возврат за подписку',
    description: 'Возврат средств за неиспользованный период подписки',
    amount: '149 ₽',
    date: '20 янв 2026',
    time: '13:47',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
    method: 'ЮKassa → Visa ··4832',
  },
];

type HistoryFilter = 'all' | 'purchase' | 'bonus' | 'refund';

const HistoryTab = ({ onSendToSupport }: { onSendToSupport: (text: string, receipt?: ChatReceipt) => void }) => {
  const { t, a, theme, navigateTab } = useContext(ThemeContext);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [expandedOp, setExpandedOp] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const filters: { key: HistoryFilter; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'purchase', label: 'Покупки' },
    { key: 'bonus', label: 'Бонусы' },
    { key: 'refund', label: 'Возвраты' },
  ];

  const filtered = OPERATIONS_HISTORY.filter((op) => {
    if (filter === 'all') return true;
    if (filter === 'purchase') return op.type === 'purchase' || op.type === 'renewal';
    if (filter === 'bonus') return op.type === 'bonus' || op.type === 'promo';
    return op.type === filter;
  });

  const statusMeta: Record<string, { label: string; cls: string }> = {
    success: { label: 'Успешно', cls: 'text-emerald-400 bg-emerald-400/10' },
    pending: { label: 'В обработке', cls: 'text-amber-400 bg-amber-400/10' },
    failed: { label: 'Ошибка', cls: 'text-rose-400 bg-rose-400/10' },
  };

  const buildReceiptText = (op: Operation) => {
    const lines = [
      `\u2501\u2501\u2501 \u0427\u0435\u043a \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0438 \u2501\u2501\u2501`,
      `ID: ${op.txId}`,
      `\u0422\u0438\u043f: ${OPERATION_TYPE_META[op.type].label}`,
      `${op.title}`,
      `\u0421\u0443\u043c\u043c\u0430: ${op.amount}`,
      `\u0414\u0430\u0442\u0430: ${op.date}, ${op.time}`,
      `\u0421\u0442\u0430\u0442\u0443\u0441: ${statusMeta[op.status].label}`,
      `\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c: ${op.userName} (${op.userId})`,
    ];
    if (op.method) lines.push(`\u041c\u0435\u0442\u043e\u0434: ${op.method}`);
    if (op.plan) lines.push(`\u0422\u0430\u0440\u0438\u0444: ${op.plan}`);
    if (op.period) lines.push(`\u041f\u0435\u0440\u0438\u043e\u0434: ${op.period}`);
    lines.push(`\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
    return lines.join('\n');
  };

  const handleReportProblem = (op: Operation) => {
    const receipt: ChatReceipt = {
      txId: op.txId,
      type: op.type,
      title: op.title,
      amount: op.amount,
      date: op.date,
      time: op.time,
      status: op.status,
      userName: op.userName,
      userId: op.userId,
      method: op.method,
      plan: op.plan,
    };
    onSendToSupport('Проблема с оплатой', receipt);
    navigateTab('support');
  };

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={cn('text-lg font-medium', t.textStrong)}>История операций</h1>
          <p className={cn('mt-1 text-sm', t.textMuted)}>Все транзакции, начисления и чеки</p>
        </div>
      </div>

      {/* Filters */}
      <div className={cn('flex items-center gap-1.5 rounded-xl border p-1', t.card, t.border)}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300',
              filter === f.key
                ? cn(a.bgSoft, a.text)
                : cn(t.textMuted, 'hover:' + t.textStrong)
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Operations list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <GlowCard>
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ClockCounterClockwise weight={ICON_WEIGHT} className={cn('mb-3 h-10 w-10', t.textSubtle)} />
              <p className={cn('text-sm font-medium', t.textMuted)}>Нет операций</p>
              <p className={cn('mt-1 text-xs', t.textSubtle)}>По выбранному фильтру операции не найдены</p>
            </div>
          </GlowCard>
        ) : (
          filtered.map((op) => {
            const meta = OPERATION_TYPE_META[op.type];
            const status = statusMeta[op.status];
            const isExpanded = expandedOp === op.id;
            const IconComp = meta.icon;

            return (
              <GlowCard key={op.id}>
                {/* Main row */}
                <button
                  onClick={() => setExpandedOp(isExpanded ? null : op.id)}
                  className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
                >
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', a.bgSoft)}>
                    <IconComp weight={ICON_WEIGHT} className={cn('h-5 w-5', meta.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn('truncate text-sm font-medium', t.textStrong)}>{op.title}</h3>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', status.cls)}>
                        {status.label}
                      </span>
                    </div>
                    <div className={cn('mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs', t.textSubtle)}>
                      <span>{op.date}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{op.time}</span>
                      <span>•</span>
                      <span className={cn('font-mono text-[11px]', t.textMuted)}>{op.txId}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={cn(
                      'text-sm font-medium tabular-nums',
                      op.type === 'refund' ? 'text-rose-400' : op.type === 'bonus' || op.type === 'promo' ? 'text-emerald-400' : t.textStrong
                    )}>
                      {op.type === 'refund' ? '+' : op.type === 'purchase' || op.type === 'renewal' ? '-' : ''}{op.amount}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CaretRight weight="bold" className={cn('h-3.5 w-3.5', t.textSubtle)} />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded receipt */}
                <AnimatePresence>
                  {isExpanded ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                      className="overflow-hidden"
                    >
                      <div className={cn('mx-4 mb-4 rounded-xl border p-4 sm:mx-5 sm:mb-5 sm:p-5', t.cardSolid, t.border)}>
                        {/* Receipt header */}
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Receipt weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
                            <span className={cn('text-xs font-medium uppercase tracking-wider', t.textSubtle)}>Чек операции</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(buildReceiptText(op), op.id + '-receipt'); }}
                            className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors', t.textMuted, t.borderHover, 'border', t.border)}
                          >
                            {copiedField === op.id + '-receipt' ? (
                              <><Check weight="bold" className="h-3 w-3" /> Скопировано</>
                            ) : (
                              <><Copy weight={ICON_WEIGHT} className="h-3 w-3" /> Скопировать</>
                            )}
                          </button>
                        </div>

                        {/* Receipt fields */}
                        <div className="space-y-2.5">
                          <ReceiptRow label="ID транзакции" value={op.txId} mono onCopy={() => handleCopy(op.txId, op.id + '-txid')} copied={copiedField === op.id + '-txid'} t={t} />
                          <ReceiptRow label="Тип операции" value={meta.label} t={t} />
                          <ReceiptRow label="Описание" value={op.description} t={t} />
                          <ReceiptRow label="Сумма" value={op.amount} t={t} />
                          <ReceiptRow label="Дата и время" value={`${op.date}, ${op.time}`} t={t} />
                          <ReceiptRow label="Статус" value={status.label} statusCls={status.cls} t={t} />
                          <ReceiptRow label="Пользователь" value={`${op.userName}`} t={t} />
                          <ReceiptRow label="ID пользователя" value={op.userId} mono onCopy={() => handleCopy(op.userId, op.id + '-uid')} copied={copiedField === op.id + '-uid'} t={t} />
                          {op.method ? <ReceiptRow label="Метод оплаты" value={op.method} t={t} /> : null}
                          {op.plan ? <ReceiptRow label="Тариф" value={op.plan} t={t} /> : null}
                          {op.period ? <ReceiptRow label="Период" value={op.period} t={t} /> : null}
                          {op.bonusAmount ? <ReceiptRow label="Начислено" value={op.bonusAmount} t={t} /> : null}
                        </div>

                        {/* Action buttons */}
                        <div className={cn('mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row', t.border)}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReportProblem(op); }}
                            className={cn(
                              'flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-300',
                              'text-rose-400 border-rose-400/20 bg-rose-400/5 hover:bg-rose-400/10'
                            )}
                          >
                            <WarningCircle weight={ICON_WEIGHT} className="h-4 w-4" />
                            Проблема с оплатой
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(buildReceiptText(op), op.id + '-receipt'); }}
                            className={cn(
                              'flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-300',
                              t.border, t.textMuted, t.borderHover, 'hover:' + t.textStrong
                            )}
                          >
                            <Copy weight={ICON_WEIGHT} className="h-4 w-4" />
                            Скопировать чек
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </GlowCard>
            );
          })
        )}
      </div>

      {/* bottom spacer */}
      <div className="h-4" />
    </motion.div>
  );
};

const ReceiptRow = ({
  label,
  value,
  mono,
  onCopy,
  copied,
  statusCls,
  t,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  statusCls?: string;
  t: (typeof THEMES)[ThemeType];
}) => (
  <div className="flex items-start justify-between gap-3">
    <span className={cn('shrink-0 text-xs', t.textSubtle)}>{label}</span>
    <div className="flex items-center gap-1.5 text-right">
      {statusCls ? (
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', statusCls)}>{value}</span>
      ) : (
        <span className={cn('text-xs font-medium', mono ? 'font-mono text-[11px]' : '', t.textStrong)}>{value}</span>
      )}
      {onCopy ? (
        <button onClick={(e) => { e.stopPropagation(); onCopy(); }} className={cn('rounded p-0.5 transition-colors', t.textSubtle)}>
          {copied ? <Check weight="bold" className="h-3 w-3 text-emerald-400" /> : <Copy weight={ICON_WEIGHT} className="h-3 w-3" />}
        </button>
      ) : null}
    </div>
  </div>
);

/* ── PWA Install Section ── */
/* ── Install App Tab ── */
const InstallTab = () => {
  const { t, a, theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const [canInstall, setCanInstall] = useState(!!deferredInstallPrompt);
  const [isInstalled, setIsInstalled] = useState(
    typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches,
  );
  const [installing, setInstalling] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setCanInstall(!!deferredInstallPrompt);
      if (!deferredInstallPrompt) setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    };
    pwaListeners.add(update);
    return () => { pwaListeners.delete(update); };
  }, []);

  const handleInstall = async () => {
    if (!deferredInstallPrompt) return;
    setInstalling(true);
    try {
      await deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        deferredInstallPrompt = null;
        setCanInstall(false);
      }
    } finally {
      setInstalling(false);
    }
  };

  const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  const currentPlatformId = isIos || isSafari ? 'ios' : isAndroid ? 'android' : 'chrome';

  const platforms = [
    {
      id: 'chrome',
      icon: Desktop,
      title: 'Компьютер',
      subtitle: 'Windows, macOS, Linux',
      relevant: !isIos && !isAndroid,
      canAutoInstall: canInstall && !isIos && !isAndroid,
      steps: [
        { title: 'Откройте сайт в браузере', desc: 'Перейдите на WW.pro в браузере Chrome, Edge или Brave. Firefox не поддерживает установку PWA — используйте один из перечисленных.' },
        { title: 'Найдите кнопку установки', desc: 'В правой части адресной строки появится иконка ⊕ или кнопка «Установить». Если вы видите кнопку «Установить» в нашем интерфейсе — можно нажать её напрямую.' },
        { title: 'Подтвердите установку', desc: 'Браузер покажет диалоговое окно — нажмите «Установить». Приложение скачается мгновенно (менее 1 МБ).' },
        { title: 'Запустите приложение', desc: 'Иконка WW.pro появится на рабочем столе и в панели задач. Откройте — приложение работает без адресной строки, как нативное.' },
      ],
      note: 'Firefox не поддерживает установку PWA. Используйте Chrome, Edge или Brave.',
    },
    {
      id: 'android',
      icon: GooglePlayLogo,
      title: 'Android',
      subtitle: 'Chrome, Samsung Internet',
      relevant: isAndroid,
      canAutoInstall: canInstall && isAndroid,
      steps: [
        { title: 'Откройте WW.pro в Chrome', desc: 'Зайдите на сайт через Chrome или Samsung Internet. Другие браузеры могут не поддерживать установку.' },
        { title: 'Откройте меню браузера', desc: 'Нажмите на три точки (⋮) в правом верхнем углу экрана. Откроется выпадающее меню Chrome.' },
        { title: 'Выберите «Установить приложение»', desc: 'В меню найдите пункт «Установить приложение» или «Добавить на главный экран». Нажмите на него.' },
        { title: 'Подтвердите установку', desc: 'Появится диалог — нажмите «Установить». Приложение загрузится за несколько секунд.' },
        { title: 'Найдите на домашнем экране', desc: 'Иконка WW.pro появится среди ваших приложений. Запускайте как обычное приложение.' },
      ],
      note: null,
    },
    {
      id: 'ios',
      icon: AppleLogo,
      title: 'iPhone / iPad',
      subtitle: 'Только через Safari',
      relevant: isIos || isSafari,
      canAutoInstall: false,
      steps: [
        { title: 'Откройте WW.pro в Safari', desc: 'Важно: используйте именно Safari. Chrome, Firefox и другие браузеры на iOS не поддерживают установку PWA.' },
        { title: 'Нажмите «Поделиться»', desc: 'Найдите кнопку «Поделиться» (⬆) — внизу экрана на iPhone, вверху справа на iPad. Нажмите на неё.' },
        { title: 'Выберите «На экран Домой»', desc: 'Прокрутите список действий и найдите пункт «На экран \u00abДомой\u00bb». Если не видите — прокрутите горизонтальный ряд иконок вправо.' },
        { title: 'Нажмите «Добавить»', desc: 'Откроется экран с названием и иконкой. Нажмите «Добавить» в правом верхнем углу. Готово!' },
        { title: 'Найдите иконку на экране', desc: 'Приложение WW.pro появится на домашнем экране. Работает полноэкранно, без элементов Safari.' },
      ],
      note: 'На iOS установка возможна только через Safari. Chrome и Firefox на iOS не поддерживают PWA.',
    },
  ];

  return (
    <motion.div
      key="install"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Hero + Status */}
      <GlowCard>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', a.bgSoft)}>
              <DownloadSimple weight="fill" className={cn('h-6 w-6', a.text)} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={cn('text-lg font-medium', t.textStrong)}>Установить WW.pro</h2>
              <p className={cn('mt-1 text-sm leading-relaxed', t.textMuted)}>
                Добавьте приложение на своё устройство вручную за пару шагов.
                Работает как нативное — без магазинов, без лишнего.
              </p>
            </div>
          </div>

          {isInstalled && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('mt-5 flex items-center gap-3 rounded-xl border px-4 py-3', a.bgSoft, a.border)}
            >
              <CheckCircle weight="fill" className={cn('h-5 w-5 shrink-0', a.text)} />
              <div>
                <div className={cn('text-sm font-medium', a.text)}>Приложение установлено</div>
                <div className={cn('text-xs', t.textMuted)}>Вы используете WW.pro как приложение</div>
              </div>
            </motion.div>
          )}

          {/* Benefits */}
          <div className={cn('mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs', t.textMuted)}>
            {[
              { icon: Lightning, title: 'Мгновенный запуск', desc: 'Без адресной строки' },
              { icon: WifiSlash, title: 'Работает оффлайн', desc: 'Базовый UI доступен без сети' },
              { icon: ShieldCheck, title: 'Безопасно', desc: 'Автообновления' },
              { icon: RocketLaunch, title: 'Без магазина', desc: 'За секунды' },
            ].map((b) => (
              <span key={b.title} className="flex items-center gap-1.5">
                <b.icon weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5', a.text)} />
                <span className={cn('font-medium', t.text)}>{b.title}</span>
                <span>— {b.desc}</span>
              </span>
            ))}
          </div>
        </div>
      </GlowCard>

      {/* ── Detailed Platform Instructions ── */}
      <div className="px-1">
        <div className={cn('mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>
          <Info weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
          Инструкция по установке
        </div>
        <p className={cn('mb-5 text-xs leading-relaxed', t.textMuted)}>
          Выберите вашу платформу — покажем подробно, куда нажать и что сделать
        </p>
      </div>

      <div className="space-y-3">
        {platforms.map((platform) => {
          const isOpen = expandedPlatform === platform.id;
          const isCurrentDevice = platform.id === currentPlatformId;
          /* Auto-expand current device platform on first render */
          if (expandedPlatform === null && isCurrentDevice) {
            setTimeout(() => setExpandedPlatform(platform.id), 0);
          }

          return (
            <GlowCard key={platform.id}>
              <div className="p-5">
                {/* Header row */}
                <button
                  onClick={() => setExpandedPlatform(isOpen ? null : platform.id)}
                  className="flex w-full items-center gap-4 text-left"
                >
                  <div className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    platform.relevant ? a.bgSoft : cn(theme === 'dark' ? 'bg-white/[0.04]' : 'bg-black/[0.03]', t.border, 'border'),
                  )}>
                    <platform.icon
                      weight={platform.relevant ? 'fill' : ICON_WEIGHT}
                      className={cn('h-5 w-5', platform.relevant ? a.text : t.textMuted)}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-medium', t.textStrong)}>{platform.title}</span>
                      {platform.relevant && (
                        <span className={cn('text-[10px] font-medium uppercase tracking-wider rounded-full px-2 py-0.5', a.bgSoft, a.text)}>
                          ваше устройство
                        </span>
                      )}
                    </div>
                    <div className={cn('text-xs', t.textSubtle)}>{platform.subtitle}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isInstalled && platform.relevant && (
                      <div className={cn('flex items-center gap-1.5 text-xs font-medium', a.text)}>
                        <CheckCircle weight="fill" className="h-4 w-4" />
                        <span>Готово</span>
                      </div>
                    )}
                    {platform.canAutoInstall && !isInstalled && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleInstall(); }}
                        disabled={installing}
                        className={cn(
                          'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                          a.button,
                          installing && 'opacity-70 pointer-events-none',
                        )}
                      >
                        <DownloadSimple weight="bold" className="h-4 w-4" />
                        {installing ? 'Установка…' : 'Установить'}
                      </button>
                    )}
                    <CaretDown
                      weight="bold"
                      className={cn('h-4 w-4 transition-transform duration-200', t.textSubtle, isOpen && 'rotate-180')}
                    />
                  </div>
                </button>

                {/* Expanded detailed steps */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className={cn('mt-4 h-px w-full', t.divider)} />
                      <div className="mt-5 space-y-4">
                        {platform.steps.map((step, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-start gap-3"
                          >
                            <span
                              className={cn(
                                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                a.bgSoft, a.text,
                              )}
                            >
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className={cn('text-sm font-medium', t.textStrong)}>{step.title}</div>
                              <p className={cn('mt-0.5 text-xs leading-relaxed', t.textMuted)}>{step.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {platform.note && (
                        <div className={cn('mt-5 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed', t.border, t.textMuted)}>
                          <WarningCircle weight={ICON_WEIGHT} className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', a.text)} />
                          <span>{platform.note}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlowCard>
          );
        })}
      </div>

      {/* What is PWA? */}
      <GlowCard>
        <div className="p-6">
          <div className={cn('mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider', t.textSubtle)}>
            <Question weight={ICON_WEIGHT} className="h-3.5 w-3.5" />
            <span>Что такое PWA?</span>
          </div>
          <p className={cn('text-sm leading-relaxed', t.text)}>
            PWA (Progressive Web App) — технология, которая позволяет использовать сайт как полноценное приложение.
            Устанавливается прямо из браузера, не занимает много места и всегда содержит последнюю версию.
          </p>
          <div className={cn('mt-4 grid gap-2', isMobile ? 'grid-cols-1' : 'grid-cols-3')}>
            {[
              { label: 'Размер', value: '< 1 МБ', icon: Feather },
              { label: 'Обновления', value: 'Автоматически', icon: Sparkle },
              { label: 'Платформы', value: 'Все устройства', icon: Globe },
            ].map((item) => (
              <div
                key={item.label}
                className={cn('flex items-center gap-3 rounded-xl border px-4 py-3', t.border, t.card)}
              >
                <item.icon weight={ICON_WEIGHT} className={cn('h-4 w-4 shrink-0', a.text)} />
                <div>
                  <div className={cn('text-xs', t.textSubtle)}>{item.label}</div>
                  <div className={cn('text-sm font-medium', t.textStrong)}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
};

/* ── Support Chat ── */
type ChatReceipt = {
  txId: string;
  type: OperationType;
  title: string;
  amount: string;
  date: string;
  time: string;
  status: 'success' | 'pending' | 'failed';
  userName: string;
  userId: string;
  method?: string;
  plan?: string;
};

type SupportMessage = {
  id: string;
  from: 'user' | 'support';
  text: string;
  time: string;
  receipt?: ChatReceipt;
};

const INITIAL_SUPPORT_MESSAGES: SupportMessage[] = [
  {
    id: '1',
    from: 'support',
    text: 'Здравствуйте! Чтобы мы могли максимально быстро помочь вам, пожалуйста, подробно опишите проблему и приложите скриншоты, если это возможно.',
    time: formatTime(),
  },
];

function formatTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/* ── Chat Receipt Card (compact mini-receipt for chat bubbles) ── */
const ChatReceiptCard = ({ receipt, label, compact }: { receipt: ChatReceipt; label: string; compact?: boolean }) => {
  const { t, a, theme } = useContext(ThemeContext);
  const meta = OPERATION_TYPE_META[receipt.type];
  const IconComp = meta.icon;

  const STATUS_DISPLAY: Record<string, { label: string; dot: string }> = {
    success: { label: 'Успешно', dot: 'bg-emerald-400' },
    pending: { label: 'Обработка', dot: 'bg-amber-400' },
    failed: { label: 'Ошибка', dot: 'bg-rose-400' },
  };

  const s = STATUS_DISPLAY[receipt.status];
  const subtleBg = theme === 'dark' ? 'bg-white/[0.04]' : 'bg-black/[0.03]';

  return (
    <div className={cn(
      'overflow-hidden rounded-2xl rounded-br-md border',
      theme === 'dark' ? 'bg-white/[0.06] border-white/[0.08]' : 'bg-black/[0.03] border-black/[0.06]',
    )}>
      {/* Header strip */}
      <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1.5">
        <WarningCircle weight="fill" className="h-3 w-3 text-rose-400" />
        <span className="text-[10px] font-semibold text-rose-400">{label}</span>
      </div>

      <div className="px-3 py-2 space-y-1.5">
        {/* Operation title + icon */}
        <div className="flex items-center gap-2">
          <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md', a.bgSoft)}>
            <IconComp weight={ICON_WEIGHT} className={cn('h-3 w-3', meta.color)} />
          </div>
          <span className={cn('text-[11px] font-medium leading-tight truncate', t.textStrong)}>{receipt.title}</span>
        </div>

        {compact ? (
          <>
            {/* Compact: 2×2 grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <MiniField label="Сумма" value={receipt.amount} t={t} />
              <MiniField label="Статус" t={t}>
                <span className="flex items-center gap-1">
                  <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
                  <span className={cn('text-[10px] font-medium', t.textStrong)}>{s.label}</span>
                </span>
              </MiniField>
              <MiniField label="Дата" value={`${receipt.date}, ${receipt.time}`} t={t} />
              {receipt.method ? <MiniField label="Метод" value={receipt.method} t={t} /> : receipt.plan ? <MiniField label="Тариф" value={receipt.plan} t={t} /> : null}
            </div>

            {/* User + TX combined */}
            <div className={cn('rounded-md px-2 py-1', subtleBg)}>
              <div className="flex items-center gap-1.5">
                <User weight={ICON_WEIGHT} className={cn('h-2.5 w-2.5 shrink-0', t.textSubtle)} />
                <span className={cn('text-[10px] font-medium truncate', t.textStrong)}>{receipt.userName}</span>
                <span className={cn('font-mono text-[9px] shrink-0', t.textMuted)}>{receipt.userId}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Receipt weight={ICON_WEIGHT} className={cn('h-2.5 w-2.5 shrink-0', t.textSubtle)} />
                <span className={cn('font-mono text-[9px] truncate', t.textMuted)}>{receipt.txId}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Full: 3×3 grid */}
            <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
              <MiniField label="Сумма" value={receipt.amount} t={t} />
              <MiniField label="Статус" t={t}>
                <span className="flex items-center gap-1">
                  <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
                  <span className={cn('text-[11px] font-medium', t.textStrong)}>{s.label}</span>
                </span>
              </MiniField>
              <MiniField label="Дата" value={receipt.date} t={t} />
              <MiniField label="Время" value={receipt.time} t={t} />
              {receipt.method ? <MiniField label="Метод" value={receipt.method} t={t} /> : null}
              {receipt.plan ? <MiniField label="Тариф" value={receipt.plan} t={t} /> : null}
            </div>

            {/* User section */}
            <div className={cn('rounded-lg px-2 py-1.5', subtleBg)}>
              <div className={cn('mb-0.5 text-[9px] font-medium uppercase tracking-wider', t.textSubtle)}>Пользователь</div>
              <div className="flex items-center gap-2">
                <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full', a.bgSoft)}>
                  <User weight={ICON_WEIGHT} className={cn('h-3 w-3', a.text)} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className={cn('text-[11px] font-medium', t.textStrong)}>{receipt.userName}</span>
                  <span className={cn('ml-1.5 font-mono text-[10px]', t.textMuted)}>ID {receipt.userId}</span>
                </div>
              </div>
            </div>

            {/* TX ID */}
            <div className={cn('flex items-center gap-1.5 rounded-lg px-2 py-1', subtleBg)}>
              <Receipt weight={ICON_WEIGHT} className={cn('h-3 w-3 shrink-0', t.textSubtle)} />
              <span className={cn('font-mono text-[10px]', t.textMuted)}>{receipt.txId}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const MiniField = ({ label, value, children, t }: { label: string; value?: string; children?: React.ReactNode; t: (typeof THEMES)[ThemeType] }) => (
  <div className="min-w-0">
    <div className={cn('text-[9px] uppercase tracking-wider', t.textSubtle)}>{label}</div>
    {children ?? <div className={cn('text-[11px] font-medium truncate', t.textStrong)}>{value}</div>}
  </div>
);

const SupportHeaderButton = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
  const { t, a } = useContext(ThemeContext);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        onClick={onToggle}
        className={cn(
          'relative rounded-full p-2 transition-all duration-300',
          isOpen
            ? cn(a.text, a.bgSoft)
            : hovered
              ? a.text
              : t.textMuted,
        )}
      >
        <ChatCircleDots weight={isOpen ? 'fill' : ICON_WEIGHT} className="h-[18px] w-[18px]" />
      </button>

      {/* Floating label — no container, just text */}
      <AnimatePresence>
        {hovered && !isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap"
          >
            <span className={cn('text-[11px] font-medium', a.text)}>Нужна помощь?</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const SupportChatPanel = ({
  isOpen,
  onClose,
  messages,
  onSend,
}: {
  isOpen: boolean;
  onClose: () => void;
  messages: SupportMessage[];
  onSend: (text: string) => void;
}) => {
  const { t, a, theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const miniChatMounted = useRef(false);

  /* Scroll to last message: instant on first open, smooth on new messages */
  useEffect(() => {
    if (!isOpen) { miniChatMounted.current = false; return; }
    const el = messagesEndRef.current;
    if (!el) return;
    if (!miniChatMounted.current) {
      miniChatMounted.current = true;
      const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 80);
      return () => clearTimeout(t);
    }
    el.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  /* Close on outside click/tap — handle both mouse and touch */
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const btn = (e.target as HTMLElement).closest('[data-support-toggle]');
        if (!btn) onClose();
      }
    };
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handler);
      document.addEventListener('touchstart', handler);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [isOpen, isMobile, onClose]);

  /* Lock body scroll when open on mobile */
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isMobile]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const panel = (
    <AnimatePresence>
      {isOpen ? (
        <>
          {/* Backdrop overlay on mobile */}
          {isMobile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
          ) : null}
          <motion.div
            ref={panelRef}
            initial={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, y: 8, scale: 0.96 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={isMobile ? { type: 'spring', bounce: 0.15, duration: 0.4 } : { duration: 0.2 }}
            className={cn(
              isMobile
                ? 'fixed inset-x-0 bottom-0 z-[61] flex flex-col overflow-hidden rounded-t-2xl border-t shadow-2xl backdrop-blur-xl'
                : 'absolute right-0 top-full z-50 mt-2 flex w-80 flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl',
              t.panel, a.border
            )}
            style={isMobile
              ? { maxHeight: 'calc(100vh - var(--safe-top, 0px) - 20px)', paddingBottom: 'var(--safe-bottom, 0px)' }
              : { maxHeight: 'min(500px, calc(100vh - 100px))' }
            }
          >
            {/* Header */}
            <div className={cn('flex shrink-0 items-center justify-between border-b px-4 py-3', t.border)}>
              <div className="flex items-center gap-3">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', a.bgSoft)}>
                  <ChatCircleDots weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
                </div>
                <div>
                  <div className={cn('text-sm font-medium', t.textStrong)}>Поддержка</div>
                  <div className={cn('text-[11px]', t.textMuted)}>Отвечаем по мере загруженности</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className={cn('rounded-full p-1.5 transition-colors', t.textSubtle, t.navHover)}
              >
                <X weight="bold" className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div
              className={cn('flex-1 overflow-y-auto px-4 py-4', isMobile && 'overscroll-contain')}
              style={isMobile ? { minHeight: 120 } : { minHeight: 200, maxHeight: 340 }}
            >
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('flex flex-col', msg.from === 'user' ? 'items-end' : 'items-start')}
                  >
                    {msg.receipt && msg.from === 'user' ? (
                      <div className="max-w-[85%]">
                        <ChatReceiptCard receipt={msg.receipt} label={msg.text} compact />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                          msg.from === 'support'
                            ? cn(a.bgSoft, t.text, 'rounded-bl-md')
                            : cn(a.color, 'text-black rounded-br-md')
                        )}
                      >
                        {msg.text}
                      </div>
                    )}
                    <span className={cn('mt-1 px-1 text-[10px]', t.textSubtle)}>{msg.time}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className={cn('shrink-0 border-t px-3 py-3', t.border)}>
              <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors', t.border, t.card)}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Напишите сообщение..."
                  rows={1}
                  className={cn(
                    'max-h-20 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-inherit',
                    t.text, t.textMuted
                  )}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
                    input.trim()
                      ? cn(a.color, 'text-black')
                      : cn(t.card, t.textSubtle)
                  )}
                >
                  <PaperPlaneTilt weight="fill" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );

  /* On mobile, render via portal to escape header overflow constraints */
  if (isMobile) return createPortal(panel, document.body);
  return panel;
};

/* ── Support Tab (page) ── */

type SupportTopicId = 'connection' | 'payment' | 'device' | 'security' | 'other';

type SupportAction =
  | { type: 'tab'; label: string; tab: TabType; scrollTo?: string }
  | { type: 'chat'; label: string };

type SupportSolution = {
  text: string;
  actions?: SupportAction[];
};

type SupportNode = {
  id: string;
  text: string;
  description?: string;
  options: {
    label: string;
    next?: SupportNode;
    solution?: SupportSolution;
  }[];
};

const SOLVED_NODE: SupportSolution = { text: 'Отлично! Рады, что помогли. Если возникнут другие вопросы — мы всегда на связи.' };

/* ─── Tree: Не подключается VPN ─── */
const CONNECTION_TREE: SupportNode = {
  id: 'conn-1',
  text: 'У вас есть активная подписка?',
  description: 'Проверьте в личном кабинете — подписка должна быть оплачена и не истекшей.',
  options: [
    {
      label: 'Да, есть',
      next: {
        id: 'conn-2',
        text: 'Какая подписка не работает?',
        options: [
          {
            label: 'Основная (безлимитная)',
            next: {
              id: 'conn-3a',
              text: 'Проверьте дату окончания подписки. Подписка ещё активна?',
              description: 'Дату можно посмотреть в личном кабинете на карточке подписки.',
              options: [
                {
                  label: 'Да, активна',
                  next: {
                    id: 'conn-4a',
                    text: 'Приложение Happ установлено на вашем устройстве?',
                    options: [
                      {
                        label: 'Да, установлено',
                        next: {
                          id: 'conn-5a',
                          text: 'Конфигурация VPN добавлена в приложение?',
                          description: 'Если вы не добавляли подписку в Happ — VPN не будет работать.',
                          options: [
                            {
                              label: 'Да, добавлена',
                              next: {
                                id: 'conn-6a',
                                text: 'Попробуйте сменить сервер в приложении Happ. Помогло?',
                                description: 'Иногда ближайший сервер бывает перегружен. Выберите другую страну.',
                                options: [
                                  { label: 'Да, помогло', solution: SOLVED_NODE },
                                  {
                                    label: 'Нет, не помогло',
                                    next: {
                                      id: 'conn-7a',
                                      text: 'Интернет работает без VPN?',
                                      description: 'Отключите VPN и проверьте, открываются ли сайты.',
                                      options: [
                                        {
                                          label: 'Нет, интернет не работает',
                                          solution: {
                                            text: 'Проблема в вашем интернет-соединении, а не в VPN. Проверьте Wi-Fi или мобильную сеть, перезагрузите роутер.',
                                          },
                                        },
                                        {
                                          label: 'Да, интернет работает',
                                          next: {
                                            id: 'conn-8a',
                                            text: 'Попробуйте полностью отключить VPN, подождать 10 секунд и включить заново. Помогло?',
                                            options: [
                                              { label: 'Да, помогло', solution: SOLVED_NODE },
                                              {
                                                label: 'Нет',
                                                solution: {
                                                  text: 'Вероятно, ваш провайдер блокирует VPN-протоколы. Попробуйте подключиться через мобильную сеть (LTE). Если проблема сохраняется — напишите нам, мы разберёмся.',
                                                  actions: [{ type: 'chat', label: 'Написать в чат' }],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              label: 'Нет, не добавлена',
                              solution: {
                                text: 'Перейдите в раздел «Настройка VPN», выберите ваше устройство и нажмите «Добавить подписку». Ссылка автоматически настроит VPN в приложении.',
                                actions: [{ type: 'tab', label: 'Перейти к настройке VPN', tab: 'billing' }],
                              },
                            },
                          ],
                        },
                      },
                      {
                        label: 'Нет, не установлено',
                        solution: {
                          text: 'Для работы VPN необходимо установить приложение Happ. Перейдите в раздел «Настройка VPN» — там есть инструкция и ссылки для скачивания под ваше устройство.',
                          actions: [{ type: 'tab', label: 'Перейти к установке', tab: 'billing' }],
                        },
                      },
                    ],
                  },
                },
                {
                  label: 'Нет, истекла',
                  solution: {
                    text: 'Ваша подписка истекла. Продлите её в личном кабинете, чтобы VPN снова заработал.',
                    actions: [{ type: 'tab', label: 'Продлить подписку', tab: 'overview' }],
                  },
                },
              ],
            },
          },
          {
            label: 'Белые списки',
            next: {
              id: 'conn-3b',
              text: 'Вы подключены через LTE / мобильную сеть?',
              description: 'Важно: белые списки работают ТОЛЬКО через мобильный интернет (LTE/5G). Через Wi-Fi они не работают.',
              options: [
                {
                  label: 'Да, через LTE',
                  next: {
                    id: 'conn-4b',
                    text: 'Проверьте остаток гигабайт. У вас есть доступные GB?',
                    description: 'Без гигабайт белые списки работать не будут. Баланс GB отображается в личном кабинете.',
                    options: [
                      {
                        label: 'Да, GB есть',
                        next: {
                          id: 'conn-5b',
                          text: 'Конфигурация белых списков добавлена в приложение Happ?',
                          options: [
                            {
                              label: 'Да, добавлена',
                              next: {
                                id: 'conn-6b',
                                text: 'Попробуйте отключить VPN, подождать 10 секунд и подключиться заново. Помогло?',
                                options: [
                                  { label: 'Да, помогло', solution: SOLVED_NODE },
                                  {
                                    label: 'Нет',
                                    solution: {
                                      text: 'Опишите вашу проблему в чате — мы разберёмся и поможем.',
                                      actions: [{ type: 'chat', label: 'Написать в чат' }],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              label: 'Нет, не добавлена',
                              solution: {
                                text: 'Перейдите в «Настройка VPN» → раздел «Белые списки» и добавьте конфигурацию в приложение. Помните: используйте только LTE, не Wi-Fi.',
                                actions: [{ type: 'tab', label: 'Настроить белые списки', tab: 'billing', scrollTo: 'whitelist-section' }],
                              },
                            },
                          ],
                        },
                      },
                      {
                        label: 'Нет, GB закончились',
                        solution: {
                          text: 'Для работы белых списков нужны гигабайты. Купите нужный объём в личном кабинете — GB зачислятся мгновенно.',
                          actions: [{ type: 'tab', label: 'Купить гигабайты', tab: 'overview' }],
                        },
                      },
                    ],
                  },
                },
                {
                  label: 'Нет, через Wi-Fi',
                  solution: {
                    text: 'Белые списки работают ТОЛЬКО через мобильный интернет (LTE/5G). Отключите Wi-Fi и используйте мобильные данные. Это техническое ограничение — через Wi-Fi белые списки не функционируют.',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      label: 'Нет подписки',
      solution: {
        text: 'Для работы VPN необходима активная подписка. Оформите её в личном кабинете — доступны тарифы от 1 до 12 месяцев.',
        actions: [{ type: 'tab', label: 'Оформить подписку', tab: 'overview' }],
      },
    },
    {
      label: 'Не знаю',
      solution: {
        text: 'Проверьте наличие подписки в личном кабинете. Если подписка активна — на карточке будет отображаться статус и дата окончания.',
        actions: [{ type: 'tab', label: 'Проверить подписку', tab: 'overview' }],
      },
    },
  ],
};

/* ─── Tree: Вопрос по оплате ─── */
const PAYMENT_TREE: SupportNode = {
  id: 'pay-1',
  text: 'Выберите вашу ситуацию:',
  options: [
    {
      label: 'Оплата не проходит',
      next: {
        id: 'pay-2a',
        text: 'Каким способом вы пытаетесь оплатить?',
        options: [
          {
            label: 'ЮKassa (карта / СБП)',
            solution: {
              text: 'Проверьте, достаточно ли средств на карте. Попробуйте другую карту или способ оплаты СБП. Как альтернативу — используйте CryptoBot (криптовалюта через Telegram). Если ни один способ не работает — напишите нам.',
              actions: [{ type: 'chat', label: 'Написать в чат' }],
            },
          },
          {
            label: 'CryptoBot (криптовалюта)',
            solution: {
              text: 'Проверьте баланс криптовалютного кошелька и доступность Telegram-бота @CryptoBot. Убедитесь, что вы подтвердили транзакцию в боте. Как альтернативу — попробуйте оплату через ЮKassa. Если проблема сохраняется — напишите нам.',
              actions: [{ type: 'chat', label: 'Написать в чат' }],
            },
          },
        ],
      },
    },
    {
      label: 'Хочу продлить подписку',
      solution: {
        text: 'Перейдите в личный кабинет и нажмите «Продлить подписку». Вы сможете выбрать тариф и способ оплаты. Дни добавятся к текущему сроку.',
        actions: [{ type: 'tab', label: 'Продлить подписку', tab: 'overview' }],
      },
    },
    {
      label: 'Хочу сменить тариф',
      solution: {
        text: 'При продлении подписки вы можете выбрать другой тариф. Текущая подписка будет действовать до конца оплаченного периода, после чего активируется новый план.',
        actions: [{ type: 'tab', label: 'Перейти к продлению', tab: 'overview' }],
      },
    },
    {
      label: 'Хочу купить гигабайты',
      solution: {
        text: 'Гигабайты нужны для работы белых списков. Перейдите в личный кабинет → раздел «Белые списки» → «Купить GB». Доступны пакеты 5, 10, 20, 50 GB по 19 ₽/GB. GB зачисляются мгновенно.',
        actions: [{ type: 'tab', label: 'Купить гигабайты', tab: 'overview' }],
      },
    },
    {
      label: 'Возврат средств',
      solution: {
        text: 'Для оформления возврата напишите в чат поддержки с указанием ID транзакции. ID транзакции можно найти в истории операций.',
        actions: [
          { type: 'tab', label: 'История операций', tab: 'history' },
          { type: 'chat', label: 'Написать в чат' },
        ],
      },
    },
  ],
};

/* ─── Tree: Настройка устройства ─── */
const DEVICE_TREE: SupportNode = {
  id: 'dev-1',
  text: 'Что вам нужно настроить?',
  options: [
    {
      label: 'Установить приложение',
      next: {
        id: 'dev-2a',
        text: 'На каком устройстве?',
        options: [
          {
            label: 'iOS (iPhone / iPad)',
            solution: {
              text: 'Скачайте приложение Happ из App Store. После установки откройте его и разрешите добавление VPN-конфигурации. Подробная инструкция — в разделе «Настройка VPN».',
              actions: [{ type: 'tab', label: 'Инструкция для iOS', tab: 'billing' }],
            },
          },
          {
            label: 'Android',
            solution: {
              text: 'Скачайте Happ из Google Play или APK-файл по ссылке. Если устанавливаете APK — разрешите установку из неизвестных источников в настройках устройства.',
              actions: [{ type: 'tab', label: 'Инструкция для Android', tab: 'billing' }],
            },
          },
          {
            label: 'macOS',
            solution: {
              text: 'Скачайте Happ из App Store или по прямой ссылке. После установки разрешите добавление VPN-конфигурации.',
              actions: [{ type: 'tab', label: 'Инструкция для macOS', tab: 'billing' }],
            },
          },
          {
            label: 'Windows',
            solution: {
              text: 'Скачайте установщик Happ и запустите setup. VPN-конфигурация добавится автоматически после активации подписки.',
              actions: [{ type: 'tab', label: 'Инструкция для Windows', tab: 'billing' }],
            },
          },
          {
            label: 'TV',
            solution: {
              text: 'Установите Happ из магазина приложений вашего телевизора. При первом запуске введите код авторизации, который отобразится на экране.',
              actions: [{ type: 'tab', label: 'Инструкция для TV', tab: 'billing' }],
            },
          },
        ],
      },
    },
    {
      label: 'Добавить подписку в приложение',
      solution: {
        text: 'Перейдите в раздел «Настройка VPN», выберите ваше устройство и нажмите «Добавить подписку». Ссылка автоматически настроит VPN в приложении Happ.',
        actions: [{ type: 'tab', label: 'Настроить VPN', tab: 'billing' }],
      },
    },
    {
      label: 'Добавить / удалить устройство',
      solution: {
        text: 'Лимит подключённых устройств — 5 штук. Если лимит исчерпан, отвяжите ненужное устройство в настройках VPN и подключите новое.',
        actions: [{ type: 'tab', label: 'Управление устройствами', tab: 'billing' }],
      },
    },
    {
      label: 'Настроить белые списки',
      solution: {
        text: 'Выберите устройство в разделе «Настройка VPN», затем нажмите «Добавить белые списки». Помните: белые списки работают только через LTE/мобильную сеть, не через Wi-Fi.',
        actions: [{ type: 'tab', label: 'Настроить белые списки', tab: 'billing', scrollTo: 'whitelist-section' }],
      },
    },
    {
      label: 'Сменить сервер',
      solution: {
        text: 'Откройте приложение Happ → перейдите в список серверов → выберите другую страну и переподключитесь. Более близкий сервер обычно даёт лучшую скорость.',
      },
    },
  ],
};

/* ─── Tree: Безопасность ─── */
const SECURITY_TREE: SupportNode = {
  id: 'sec-1',
  text: 'Что вас беспокоит?',
  options: [
    {
      label: 'Приватность данных',
      solution: {
        text: 'Мы не храним логи вашей активности. Весь трафик шифруется, а DNS-запросы идут через защищённый туннель. Ваши данные остаются приватными и не передаются третьим лицам.',
      },
    },
    {
      label: 'Подозрительная активность в аккаунте',
      next: {
        id: 'sec-2a',
        text: 'Рекомендуем немедленно выполнить следующее:',
        description: '1. Смените пароль аккаунта\n2. Отвяжите все неизвестные устройства\n3. Если проблема сохраняется — свяжитесь с нами',
        options: [
          {
            label: 'Перейти к управлению устройствами',
            solution: {
              text: 'Откройте раздел «Настройка VPN» → «Устройства» и отвяжите все устройства, которые вы не узнаёте. После этого смените пароль.',
              actions: [{ type: 'tab', label: 'Управление устройствами', tab: 'billing' }],
            },
          },
          {
            label: 'Написать в поддержку',
            solution: {
              text: 'Опишите ситуацию в чате — мы проверим вашу учётную запись и поможем обезопасить аккаунт.',
              actions: [{ type: 'chat', label: 'Написать в чат' }],
            },
          },
        ],
      },
    },
    {
      label: 'Утечка данных / DNS leak',
      solution: {
        text: 'Убедитесь, что VPN-соединение активно и весь трафик идёт через туннель. Если вы подозреваете утечку DNS — напишите нам, мы поможем провести диагностику.',
        actions: [{ type: 'chat', label: 'Написать в чат' }],
      },
    },
  ],
};

const SUPPORT_TOPICS: {
  id: SupportTopicId;
  icon: React.ElementType;
  label: string;
  tree: SupportNode | null;
}[] = [
  { id: 'connection', icon: WifiSlash, label: 'Не подключается VPN', tree: CONNECTION_TREE },
  { id: 'payment', icon: CreditCard, label: 'Вопрос по оплате', tree: PAYMENT_TREE },
  { id: 'device', icon: DeviceMobile, label: 'Вопрос по настройке', tree: DEVICE_TREE },
  { id: 'security', icon: ShieldCheck, label: 'Безопасность', tree: SECURITY_TREE },
  { id: 'other', icon: Question, label: 'Другое', tree: null },
];

const SupportTab = ({ onOpenChat, messages, onSend }: { onOpenChat: () => void; messages: SupportMessage[]; onSend: (text: string) => void }) => {
  const { t, a, navigateTab } = useContext(ThemeContext);
  const [activeTopic, setActiveTopic] = useState<SupportTopicId | null>(null);
  const [currentNode, setCurrentNode] = useState<SupportNode | null>(null);
  const [nodeHistory, setNodeHistory] = useState<SupportNode[]>([]);
  const [resolvedSolution, setResolvedSolution] = useState<SupportSolution | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatAutoScrolled = useRef(false);

  /* When user scrolls main and chat becomes visible — auto-scroll chat to last msg */
  useEffect(() => {
    chatAutoScrolled.current = false;
    let scrollCount = 0;
    const main = document.querySelector('main');
    if (!main) return;

    const check = () => {
      if (chatAutoScrolled.current) return;
      scrollCount++;
      if (scrollCount <= 2) return;
      const chat = chatRef.current;
      if (!chat) return;
      const mainRect = main.getBoundingClientRect();
      const chatRect = chat.getBoundingClientRect();
      if (chatRect.top < mainRect.bottom && chatRect.bottom > mainRect.top) {
        chatAutoScrolled.current = true;
        const area = messagesAreaRef.current;
        if (area) area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
      }
    };

    main.addEventListener('scroll', check, { passive: true });
    return () => main.removeEventListener('scroll', check);
  }, []);

  /* On new message — scroll chat area to bottom */
  const prevMsgCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      const area = messagesAreaRef.current;
      if (area) area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  const totalDepth = nodeHistory.length + (currentNode ? 1 : 0);

  const handleTopicClick = (topic: SupportTopicId) => {
    if (topic === 'other') {
      setActiveTopic('other');
      setCurrentNode(null);
      setNodeHistory([]);
      setResolvedSolution(null);
      setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      return;
    }
    const found = SUPPORT_TOPICS.find((t) => t.id === topic);
    setActiveTopic(topic);
    setCurrentNode(found?.tree ?? null);
    setNodeHistory([]);
    setResolvedSolution(null);
  };

  const handleOptionSelect = (option: { next?: SupportNode; solution?: SupportSolution }) => {
    if (option.solution) {
      setResolvedSolution(option.solution);
    } else if (option.next) {
      if (currentNode) setNodeHistory((h) => [...h, currentNode]);
      setCurrentNode(option.next);
      setResolvedSolution(null);
    }
  };

  const handleBack = () => {
    if (resolvedSolution) {
      setResolvedSolution(null);
      return;
    }
    if (nodeHistory.length > 0) {
      const prev = nodeHistory[nodeHistory.length - 1];
      setNodeHistory((h) => h.slice(0, -1));
      setCurrentNode(prev);
      setResolvedSolution(null);
    } else {
      setActiveTopic(null);
      setCurrentNode(null);
      setResolvedSolution(null);
    }
  };

  const handleReset = () => {
    setActiveTopic(null);
    setCurrentNode(null);
    setNodeHistory([]);
    setResolvedSolution(null);
  };

  const handleAction = (action: SupportAction) => {
    if (action.type === 'tab') {
      navigateTab(action.tab as TabType, action.scrollTo);
    } else {
      const topicLabel = SUPPORT_TOPICS.find((tp) => tp.id === activeTopic)?.label ?? '';
      setChatInput(topicLabel ? `${topicLabel}: ` : '');
      setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  };

  const handleSend = () => {
    const trimmed = chatInput.trim();
    if (!trimmed && attachments.length === 0) return;
    const text = attachments.length > 0
      ? `${trimmed}\n📎 ${attachments.map((f) => f.name).join(', ')}`
      : trimmed;
    onSend(text);
    setChatInput('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map((f) => ({
      name: f.name,
      size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <motion.div
      key="support"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      {/* ── Guided problem solver ── */}
      <div className={cn('overflow-hidden rounded-2xl border', t.border)}>
        {/* Header */}
        <div className={cn('px-6 pt-6 pb-4', t.cardSolid)}>
          <div className="flex items-start gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', a.bgSoft)}>
              <Headset weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={cn('text-sm font-medium', t.textStrong)}>Чем можем помочь?</h2>
              <p className={cn('mt-1 text-xs leading-relaxed', t.textMuted)}>
                Пройдите наш опросник — в 95% случаев мы выявим точную причину, и вы сможете устранить проблему без ожидания ответа поддержки. Отвечайте конкретно на вопросы, и мы проведём вас по решению шаг за шагом.
              </p>
            </div>
          </div>
        </div>

        {/* Topic pills */}
        <div className={cn('flex flex-wrap gap-2 border-t px-6 py-4', t.border, t.cardSolid)}>
          {SUPPORT_TOPICS.map((topic) => {
            const isActive = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all',
                  isActive
                    ? cn(a.bgSoft, a.text, a.border, 'border')
                    : cn('border', t.border, t.text, t.borderHover, 'hover:bg-white/[0.03]')
                )}
              >
                <topic.icon weight={ICON_WEIGHT} className="h-4 w-4" />
                {topic.label}
              </button>
            );
          })}
        </div>

        {/* Guided flow area */}
        <AnimatePresence mode="wait">
          {activeTopic && activeTopic !== 'other' && (currentNode || resolvedSolution) ? (
            <motion.div
              key={`${activeTopic}-${currentNode?.id ?? 'solved'}-${resolvedSolution ? 'r' : 'q'}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={cn('border-t px-6 py-5', t.border, t.cardSolid)}
            >
              {/* Progress dots + back button */}
              <div className="mb-4 flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all', t.text, t.navHover)}
                >
                  <CaretLeft weight="bold" className="h-3 w-3" />
                  Назад
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalDepth + (resolvedSolution ? 1 : 0) }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        i <= nodeHistory.length
                          ? cn('w-3', a.color)
                          : cn('w-1.5', t.textSubtle, 'opacity-30'),
                      )}
                    />
                  ))}
                </div>
              </div>

              {!resolvedSolution && currentNode ? (
                /* ── Question step ── */
                <div className="space-y-3">
                  <p className={cn('text-sm font-medium', t.textStrong)}>{currentNode.text}</p>
                  {currentNode.description ? (
                    <p className={cn('text-xs leading-relaxed', t.textMuted)}>
                      {currentNode.description.split('\n').map((line, i) => (
                        <span key={i}>{line}{i < currentNode.description!.split('\n').length - 1 ? <br /> : null}</span>
                      ))}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentNode.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionSelect(opt)}
                        className={cn(
                          'min-h-[36px] rounded-xl border px-3.5 py-2 text-xs font-medium transition-all',
                          t.border, t.text, t.borderHover, 'hover:bg-white/[0.03]'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : resolvedSolution ? (
                /* ── Solution step ── */
                <div className="space-y-3">
                  <div className={cn('flex items-start gap-2.5 rounded-xl p-3', a.bgSoft)}>
                    <CheckCircle weight={ICON_WEIGHT} className={cn('mt-0.5 h-4 w-4 shrink-0', a.text)} />
                    <p className={cn('text-sm leading-relaxed', t.text)}>{resolvedSolution.text}</p>
                  </div>

                  {/* Action buttons */}
                  {resolvedSolution.actions && resolvedSolution.actions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {resolvedSolution.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleAction(action)}
                          className={cn(
                            'rounded-xl px-4 py-2 text-xs font-medium transition-all',
                            i === 0 ? a.button : cn('border', t.border, t.text, t.borderHover, 'hover:bg-white/[0.03]'),
                          )}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {/* Reset / chat fallback */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className={cn('text-xs', t.textMuted)}>Помогло?</span>
                    <button
                      onClick={handleReset}
                      className={cn('rounded-xl px-3 py-1.5 text-xs font-medium transition-all', a.button)}
                    >
                      Да, спасибо
                    </button>
                    <button
                      onClick={() => {
                        const topicLabel = SUPPORT_TOPICS.find((tp) => tp.id === activeTopic)?.label ?? '';
                        setChatInput(topicLabel ? `${topicLabel}: ` : '');
                        setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
                      }}
                      className={cn(
                        'rounded-xl border px-3 py-1.5 text-xs font-medium transition-all',
                        t.border, t.text, t.borderHover, 'hover:bg-white/[0.03]'
                      )}
                    >
                      Нет, написать в чат
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── Full Chat ── */}
      <div ref={chatRef} className={cn('overflow-hidden rounded-2xl border', t.border)}>
        {/* Chat header */}
        <div className={cn('flex items-center gap-3 px-6 py-4', t.cardSolid)}>
          <div className="relative">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', a.bgSoft)}>
              <ChatCircleDots weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
            </div>
            {/* online dot */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0a0a] bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn('text-sm font-medium', t.textStrong)}>Поддержка WW</div>
            <div className={cn('text-[11px]', t.textMuted)}>Обычно отвечаем в течение часа</div>
          </div>
          <div className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium', a.border, a.bgSoft, a.text)}>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Онлайн
          </div>
        </div>

        {/* Messages area */}
        <div className={cn('border-t', t.border)}>
          <div
            ref={messagesAreaRef}
            className={cn('overflow-y-auto px-5 py-5', t.cardSolid)}
            style={{ minHeight: 320, maxHeight: 480 }}
          >
            {/* Date separator */}
            <div className="mb-5 flex items-center justify-center">
              <span className={cn('rounded-full px-3 py-1 text-[10px] font-medium', t.card, t.textSubtle, 'border', t.border)}>Сегодня</span>
            </div>

            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex', msg.from === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.from === 'support' ? (
                    <div className="flex max-w-[80%] gap-2.5">
                      <div className={cn('mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full', a.bgSoft)}>
                        <Lifebuoy weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5', a.text)} />
                      </div>
                      <div>
                        <div className={cn('rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed', t.card, 'border', t.border, t.text)}>
                          {msg.text}
                        </div>
                        <div className={cn('mt-1 pl-1 text-[10px]', t.textSubtle)}>{msg.time}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex max-w-[80%] flex-col items-end">
                      {msg.receipt ? (
                        <ChatReceiptCard receipt={msg.receipt} label={msg.text} />
                      ) : (
                        <div className={cn('rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed', a.color, 'text-black')}>
                          {msg.text}
                        </div>
                      )}
                      <div className={cn('mt-1 flex items-center gap-1 pr-1 text-[10px]', t.textSubtle)}>
                        {msg.time}
                        <Checks weight="bold" className="h-3 w-3" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Attachments preview */}
        <AnimatePresence>
          {attachments.length > 0 ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={cn('overflow-hidden border-t', t.border, t.cardSolid)}
            >
              <div className="flex flex-wrap gap-2 px-5 py-3">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className={cn('flex items-center gap-2 rounded-lg border px-2.5 py-1.5', t.border, t.card)}
                  >
                    <Paperclip weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5', t.textSubtle)} />
                    <span className={cn('max-w-[120px] truncate text-[11px] font-medium', t.text)}>{file.name}</span>
                    <span className={cn('text-[10px]', t.textSubtle)}>{file.size}</span>
                    <button onClick={() => removeAttachment(idx)} className={cn('ml-0.5 rounded-full p-0.5 transition-colors', t.textSubtle, t.navHover)}>
                      <X weight="bold" className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Input area */}
        <div className={cn('border-t px-4 py-3', t.border, t.cardSolid)}>
          <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors focus-within:border-white/[0.1]', t.border, t.card)}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt,.log,.zip"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors', t.textSubtle, t.navHover)}
              title="Прикрепить файл"
            >
              <Paperclip weight={ICON_WEIGHT} className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors', t.textSubtle, t.navHover)}
              title="Отправить изображение"
            >
              <ImageSquare weight={ICON_WEIGHT} className="h-4.5 w-4.5" />
            </button>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              rows={1}
              className={cn(
                'max-h-28 flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none',
                t.text,
                'placeholder:' + t.textSubtle,
              )}
            />
            <button
              onClick={handleSend}
              disabled={!chatInput.trim() && attachments.length === 0}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
                chatInput.trim() || attachments.length > 0
                  ? cn(a.color, 'text-black')
                  : cn(t.card, t.textSubtle)
              )}
            >
              <PaperPlaneTilt weight="fill" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Contact fallback — bottom ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href="https://t.me/wwpro_support"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group flex items-center gap-3 rounded-2xl border p-4 transition-all',
            t.border, t.card, t.borderHover
          )}
        >
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', a.bgSoft)}>
            <TelegramLogo weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn('text-sm font-medium', t.textStrong)}>Telegram</div>
            <div className={cn('text-[11px]', t.textMuted)}>@wwpro_support</div>
          </div>
          <ArrowRight weight="bold" className={cn('h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100', t.textSubtle)} />
        </a>

        <a
          href="mailto:support@ww.pro"
          className={cn(
            'group flex items-center gap-3 rounded-2xl border p-4 transition-all',
            t.border, t.card, t.borderHover
          )}
        >
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', a.bgSoft)}>
            <Envelope weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn('text-sm font-medium', t.textStrong)}>Email</div>
            <div className={cn('text-[11px]', t.textMuted)}>support@ww.pro</div>
          </div>
          <ArrowRight weight="bold" className={cn('h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100', t.textSubtle)} />
        </a>
      </div>
    </motion.div>
  );
};

/* ── Profile Popover ── */
const CONNECTED_ACCOUNTS = {
  telegram: { connected: true, label: 'Telegram', name: '@vlad_dev' },
  email: { connected: false, label: 'Почта', name: null },
};

const ProfilePopover = () => {
  const { t, a, hasSubscription, navigateTab } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    if (open && !isMobile) {
      document.addEventListener('mousedown', handler);
      document.addEventListener('touchstart', handler);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open, isMobile]);

  const popoverContent = (
    <AnimatePresence>
      {open ? (
        <>
          {isMobile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
          ) : null}
          <motion.div
            ref={popoverRef}
            initial={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, y: 8, scale: 0.96 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={isMobile ? { type: 'spring', bounce: 0.15, duration: 0.4 } : { duration: 0.2 }}
            className={cn(
              isMobile
                ? 'fixed inset-x-0 bottom-0 z-[61] max-h-[80vh] overflow-hidden rounded-t-2xl border-t shadow-2xl'
                : 'absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border shadow-2xl',
              a.border,
              t.panel,
              'backdrop-blur-xl'
            )}
            style={isMobile ? { paddingBottom: 'var(--safe-bottom, 0px)' } : undefined}
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
                onClick={() => { setOpen(false); navigateTab('preferences'); }}
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
        </>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-all',
          t.border, open ? t.card : 'bg-transparent', t.borderHover
        )}
      >
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full border', t.border, t.cardSolid)}>
          <span className={cn('text-xs font-medium', t.textStrong)}>В</span>
        </div>
        <div className={cn('text-left', isMobile && 'hidden')}>
          <div className={cn('text-xs font-medium leading-tight', t.textStrong)}>Влад</div>
          <div className={cn('text-[10px] leading-tight', hasSubscription ? a.text : t.textSubtle)}>
            {hasSubscription ? 'Pro' : 'Free'}
          </div>
        </div>
        <CaretDown weight="bold" className={cn('h-2.5 w-2.5 transition-transform', isMobile && 'hidden', t.textSubtle, open && 'rotate-180')} />
      </button>

      {isMobile ? createPortal(popoverContent, document.body) : popoverContent}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [accent, setAccent] = useState<AccentType>('emerald');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(INITIAL_SUPPORT_MESSAGES);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSendSupportMessage = (text: string, receipt?: ChatReceipt) => {
    const msg: SupportMessage = {
      id: Date.now().toString(),
      from: 'user',
      text,
      time: formatTime(),
      receipt,
    };
    setSupportMessages((prev) => [...prev, msg]);
  };

  const t = THEMES[theme];
  const a = ACCENTS[accent];

  const mainRef = useRef<HTMLElement>(null);
  const scrollTargetRef = useRef<string | null>(null);

  const navigateTab = (tab: TabType, scrollTo?: string) => {
    if (scrollTo) {
      scrollTargetRef.current = scrollTo;
      setScrollTarget(scrollTo);
    }
    setActiveTab(tab);
  };

  /* Scroll main content to top on every tab switch (skip if scrollTarget pending) */
  useEffect(() => {
    if (scrollTargetRef.current) return;
    mainRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  /* Scroll to target after tab switch — poll until element appears in DOM */
  useEffect(() => {
    if (!scrollTarget) return;
    let attempts = 0;
    const maxAttempts = 30;
    const poll = setInterval(() => {
      attempts++;
      const el = document.getElementById(scrollTarget);
      if (el && mainRef.current) {
        clearInterval(poll);
        const containerRect = mainRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const offset = elRect.top - containerRect.top + mainRef.current.scrollTop;
        mainRef.current.scrollTo({ top: offset, behavior: 'smooth' });
        scrollTargetRef.current = null;
        setScrollTarget(null);
      } else if (attempts >= maxAttempts) {
        clearInterval(poll);
        scrollTargetRef.current = null;
        setScrollTarget(null);
      }
    }, 50);
    return () => clearInterval(poll);
  }, [scrollTarget, activeTab]);

  return (
    <ThemeContext.Provider value={{ theme, accent, t, a, hasSubscription, setTheme, setAccent, setHasSubscription, navigateTab }}>
      <NotificationProvider>
      <div
        className={cn('relative flex h-dvh overflow-hidden font-sans transition-colors duration-500', t.bg, t.text, a.selection)}
      >
        {/* ── Mobile sidebar overlay ── */}
        <AnimatePresence>
          {sidebarOpen && isMobile ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                className={cn(
                  'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r transition-colors duration-500',
                  t.border,
                  t.sidebar,
                  theme === 'dark' ? 'bg-[#0a0a0a] backdrop-blur-xl' : 'bg-[#faf8f5] backdrop-blur-md'
                )}
                style={{ paddingTop: 'var(--safe-top, 0px)', paddingBottom: 'var(--safe-bottom, 0px)', paddingLeft: 'var(--safe-left, 0px)' }}
              >
                <div className="flex items-center justify-between p-6">
                  <Logo theme={theme} accent={accent} className="h-8 w-auto" />
                  <button onClick={() => setSidebarOpen(false)} className={cn('rounded-full p-2', t.textMuted, t.navHover)}>
                    <X weight="bold" className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-8 overflow-y-auto px-4 py-6">
                  <div>
                    <div className={cn('mb-3 px-4 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>Управление</div>
                    <div className="space-y-1">
                      <NavItem icon={Globe} label="Личный кабинет" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }} />
                      <NavItem icon={ShieldCheck} label="Настройка VPN" active={activeTab === 'billing'} onClick={() => { setActiveTab('billing'); setSidebarOpen(false); }} />
                      <NavItem icon={Gift} label="Бонусы" active={activeTab === 'bonuses'} onClick={() => { setActiveTab('bonuses'); setSidebarOpen(false); }} />
                      <NavItem icon={PersonArmsSpread} label="Рефералы" active={activeTab === 'referral'} onClick={() => { setActiveTab('referral'); setSidebarOpen(false); }} />
                      <NavItem icon={Envelope} label="Уведомления" active={activeTab === 'notifications'} onClick={() => { setActiveTab('notifications'); setSidebarOpen(false); }} />
                      <NavItem icon={Receipt} label="История операций" active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setSidebarOpen(false); }} />
                    </div>
                  </div>
                  <div>
                    <div className={cn('mb-3 px-4 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>Настройки</div>
                    <div className="space-y-1">
                      <NavItem icon={DownloadSimple} label="Установить приложение" active={activeTab === 'install'} onClick={() => { setActiveTab('install'); setSidebarOpen(false); }} />
                      <NavItem icon={GearSix} label="Настройки" active={activeTab === 'preferences'} onClick={() => { setActiveTab('preferences'); setSidebarOpen(false); }} />
                      <NavItem icon={Lifebuoy} label="Поддержка" active={activeTab === 'support'} onClick={() => { setActiveTab('support'); setSidebarOpen(false); }} />
                    </div>
                  </div>
                </div>

                <div className={cn('shrink-0 border-t px-6 py-4', t.border)}>
                  {/* Theme & accent in mobile sidebar */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('flex items-center gap-1.5 rounded-full border p-1.5', t.border, t.cardSolid)}>
                      {(Object.keys(ACCENTS) as AccentType[]).map((key) => (
                        <button
                          key={key}
                          onClick={() => setAccent(key)}
                          className={cn(
                            'h-5 w-5 rounded-full transition-all duration-300',
                            ACCENTS[key].color,
                            accent === key ? 'scale-110 ring-2 ring-current ring-offset-2' : 'scale-90 opacity-60',
                            theme === 'dark' ? 'ring-offset-[#0a0a0a]' : 'ring-offset-white'
                          )}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'milky' : 'dark')}
                      className={cn('rounded-full border p-2', t.border, t.cardSolid, t.textMuted)}
                    >
                      {theme === 'dark' ? <Sun weight={ICON_WEIGHT} className="h-4 w-4" /> : <Moon weight={ICON_WEIGHT} className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    onClick={() => setHasSubscription(!hasSubscription)}
                    className={cn('mb-3 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-[11px] font-medium transition-all', t.border, t.card, t.textMuted, t.borderHover)}
                  >
                    <span>Подписка</span>
                    <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', hasSubscription ? cn(a.bgSoft, a.text) : cn('bg-white/[0.06]', t.textSubtle))}>
                      {hasSubscription ? 'Активна' : 'Нет'}
                    </span>
                  </button>
                  <div className={cn('flex flex-wrap gap-x-3 gap-y-1 text-[11px]', t.textSubtle)}>
                    <a href="/terms" className="transition-colors hover:underline">Условия</a>
                    <a href="/privacy" className="transition-colors hover:underline">Конфиденциальность</a>
                    <a href="/refund" className="transition-colors hover:underline">Возврат</a>
                  </div>
                  <div className={cn('mt-1.5 text-[10px]', t.textSubtle)}>© 2026 WW.pro</div>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        {/* ── Desktop sidebar ── */}
        <div
          className={cn(
            'relative z-10 w-64 flex-col border-r transition-colors duration-500',
            isMobile ? 'hidden' : 'flex',
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
                <NavItem icon={ShieldCheck} label="Настройка VPN" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                <NavItem icon={Gift} label="Бонусы" active={activeTab === 'bonuses'} onClick={() => setActiveTab('bonuses')} />
                <NavItem icon={PersonArmsSpread} label="Рефералы" active={activeTab === 'referral'} onClick={() => setActiveTab('referral')} />
                <NavItem icon={Envelope} label="Уведомления" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                <NavItem icon={Receipt} label="История операций" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
              </div>
            </div>

            <div>
              <div className={cn('mb-3 px-4 text-[10px] font-bold uppercase tracking-wider', t.textSubtle)}>Настройки</div>
              <div className="space-y-1">
                <NavItem icon={DownloadSimple} label="Установить приложение" active={activeTab === 'install'} onClick={() => setActiveTab('install')} />
                <NavItem icon={GearSix} label="Настройки" active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} />
                <NavItem icon={Lifebuoy} label="Поддержка" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
              </div>
            </div>
          </div>

          <div className={cn('shrink-0 border-t px-6 py-4', t.border)}>
            {/* Dev toggle */}
            <button
              onClick={() => setHasSubscription(!hasSubscription)}
              className={cn('mb-3 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-[11px] font-medium transition-all', t.border, t.card, t.textMuted, t.borderHover)}
            >
              <span>Подписка</span>
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', hasSubscription ? cn(a.bgSoft, a.text) : cn('bg-white/[0.06]', t.textSubtle))}>
                {hasSubscription ? 'Активна' : 'Нет'}
              </span>
            </button>
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
              'relative z-30 flex shrink-0 items-center justify-between border-b transition-colors duration-500',
              isMobile ? 'h-14 px-4' : 'h-20 px-8',
              t.border,
              theme === 'dark' ? 'bg-black/10 backdrop-blur-md' : 'bg-white/40 backdrop-blur-md'
            )}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className={cn('rounded-xl p-2 transition-colors', isMobile ? '' : 'hidden', t.textMuted, t.navHover)}
              >
                <List weight="bold" className="h-5 w-5" />
              </button>
              <h1 className={cn('font-medium', isMobile ? 'text-base' : 'text-xl', t.textStrong)}>{TAB_LABELS[activeTab]}</h1>
            </div>

            <div className={cn('flex items-center', isMobile ? 'gap-2' : 'gap-4')}>
              <div className={cn('items-center gap-1.5', isMobile ? 'hidden' : 'flex')}>
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

              <div className="relative flex items-center gap-0.5 border-l border-inherit pl-3">
                <ProfilePopover />
                <div data-support-toggle>
                  <SupportHeaderButton
                    isOpen={isSupportChatOpen}
                    onToggle={() => setIsSupportChatOpen(!isSupportChatOpen)}
                  />
                </div>
                <NotificationPanel />
                <SupportChatPanel
                  isOpen={isSupportChatOpen}
                  onClose={() => setIsSupportChatOpen(false)}
                  messages={supportMessages}
                  onSend={handleSendSupportMessage}
                />
              </div>
            </div>
          </header>

          <main
            ref={mainRef}
            className={cn('relative z-10 flex-1 overflow-y-auto', isMobile ? 'p-4' : 'p-8')}
            style={isMobile ? { paddingBottom: 'calc(16px + var(--safe-bottom, 0px))' } : undefined}
          >
            <div className="mx-auto max-w-5xl">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' ? <OverviewTab key="overview" /> : null}
                {activeTab === 'billing' ? <VpnSetupTab key="billing" /> : null}
                {activeTab === 'bonuses' ? <BonusTab key="bonuses" /> : null}
                {activeTab === 'referral' ? <ReferralTab key="referral" /> : null}
                {activeTab === 'notifications' ? <NotificationsTab key="notifications" /> : null}
                {activeTab === 'history' ? <HistoryTab key="history" onSendToSupport={handleSendSupportMessage} /> : null}
                {activeTab === 'support' ? <SupportTab key="support" onOpenChat={() => setIsSupportChatOpen(true)} messages={supportMessages} onSend={handleSendSupportMessage} /> : null}
                {activeTab === 'install' ? <InstallTab key="install" /> : null}
                {activeTab === 'preferences' ? (
                  <PreferencesTab key="preferences" />
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
