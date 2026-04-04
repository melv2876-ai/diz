import React, { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  User, TelegramLogo, Envelope, Crown, GearSix, SignOut, CaretDown,
} from '@phosphor-icons/react';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn, ICON_WEIGHT, ThemeContext } from '../theme';

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

export { ProfilePopover };
