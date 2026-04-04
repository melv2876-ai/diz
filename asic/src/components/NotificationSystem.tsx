import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, X } from '@phosphor-icons/react';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn, ICON_WEIGHT, ThemeContext, type ThemeType } from '../theme';
import { type Notification, type NotificationType, NOTIFICATION_ICONS, INITIAL_NOTIFICATIONS } from '../data';

type Toast = Notification & { expiresAt: number };

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

export const useNotifications = () => useContext(NotificationCtx);

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

export { NotificationProvider, NotificationPanel };
