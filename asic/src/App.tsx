import React, { useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Globe, ShieldCheck, Gift, Envelope, Receipt, DownloadSimple,
  GearSix, Lifebuoy, Sun, Moon, X, List,
} from '@phosphor-icons/react';
import { Logo } from '../../components/Logo';
import { useIsMobile } from '../../hooks/use-mobile';
import {
  cn, ICON_WEIGHT, ThemeContext, THEMES, ACCENTS,
  TAB_LABELS, type TabType, type ThemeType, type AccentType,
} from './theme';
import { type SupportMessage, type ChatReceipt, formatTime, INITIAL_SUPPORT_MESSAGES } from './data';
import { NavItem } from './components/ui';
import { NotificationProvider, NotificationPanel } from './components/NotificationSystem';
import { ProfilePopover } from './components/ProfilePopover';
import { SupportHeaderButton, SupportChatPanel } from './tabs/SupportTab';
import { OverviewTab } from './tabs/OverviewTab';
import { VpnSetupTab } from './tabs/VpnSetupTab';
import { BonusProgramTab } from './tabs/BonusProgramTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { HistoryTab } from './tabs/HistoryTab';
import { InstallTab } from './tabs/InstallTab';
import { SupportTab } from './tabs/SupportTab';
import { PreferencesTab } from './tabs/PreferencesTab';

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

  useEffect(() => {
    if (scrollTargetRef.current) return;
    mainRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

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
                      <NavItem icon={Gift} label="Бонусная программа" active={activeTab === 'bonuses'} onClick={() => { setActiveTab('bonuses'); setSidebarOpen(false); }} />
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
                <NavItem icon={Gift} label="Бонусная программа" active={activeTab === 'bonuses'} onClick={() => setActiveTab('bonuses')} />
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
                {activeTab === 'bonuses' ? <BonusProgramTab key="bonuses" /> : null}
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
