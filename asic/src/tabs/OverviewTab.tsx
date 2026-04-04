import React, { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Crown, Diamond, CreditCard, Wallet, RocketLaunch, ShieldCheck, Check,
  CheckCircle, ArrowRight, ShoppingCartSimple, CalendarBlank, CellSignalFull,
  Plugs, Copy, Clock, Globe, Devices, Gift, Info, Star, CaretRight,
  DownloadSimple, User, Coins, Lightning, Confetti, Timer,
  ArrowsClockwise, Compass, HandPeace, Laptop, Parachute, PlusCircle,
  SealCheck, TelegramLogo, WifiSlash, X,
} from '@phosphor-icons/react';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn, ICON_WEIGHT, ThemeContext, type AccentType, type ThemeType, ACCENTS, THEMES } from '../theme';
import { SUB_PLANS, BILLING_HISTORY, SERVERS, type PaymentMethod } from '../data';
import { useNotifications } from '../components/NotificationSystem';
import { GlowCard } from '../components/ui';
import { DevicesCard } from '../components/DevicesCard';

const RENEW_PAYMENT_STEPS = [
  { label: 'Обработка платежа', icon: CreditCard, duration: 1200 },
  { label: 'Проверка оплаты', icon: ShieldCheck, duration: 1000 },
  { label: 'Обновляем подписку', icon: ArrowsClockwise, duration: 900 },
  { label: 'Готово!', icon: CheckCircle, duration: 600 },
];

const NEW_SUB_PAYMENT_STEPS = [
  { label: 'Обработка платежа', icon: CreditCard, duration: 1200 },
  { label: 'Проверка оплаты', icon: ShieldCheck, duration: 1000 },
  { label: 'Подготовка серверов', icon: Compass, duration: 1100 },
  { label: 'Создание подписки', icon: SealCheck, duration: 900 },
  { label: 'Готово!', icon: CheckCircle, duration: 600 },
];

const OverviewTab = () => {
  const { t, a, hasSubscription, theme, navigateTab } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [showPlans, setShowPlans] = useState(false);
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
                onClick={() => { setShowPlans(true); requestAnimationFrame(() => planSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }}
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

        <AnimatePresence>
          {showPlans && (
            <motion.div
              key="plans"
              ref={planSectionRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
        {/* ── Step 2: Pick a plan ── */}
        <div>
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
                  transition={{ duration: 0.3, delay: i * 0.05 }}
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
        </div>

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
          )}
        </AnimatePresence>

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
  const buyGbEndRef = useRef<HTMLDivElement>(null);
  const gbPaymentRef = useRef<HTMLDivElement>(null);
  const gbReceiptRef = useRef<HTMLDivElement>(null);
  const renewRef = useRef<HTMLDivElement>(null);
  const renewEndRef = useRef<HTMLDivElement>(null);
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
        renewEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 30);
    }
  }, [showRenewBlock]);

  useEffect(() => {
    if (showGbBlock && scrollToGb.current) {
      scrollToGb.current = false;
      setTimeout(() => {
        buyGbEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 30);
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
                  if (next) { scrollToRenew.current = true; setShowGbBlock(false); }
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
                  if (next) { scrollToGb.current = true; setShowRenewBlock(false); }
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
            transition={{ duration: 0.01, ease: [0.4, 0, 0.2, 1] }}
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
      <div ref={buyGbEndRef} />
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
            transition={{ duration: 0.01, ease: [0.4, 0, 0.2, 1] }}
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
              <ArrowsClockwise weight="regular" className={cn('mt-0.5 h-4 w-4 shrink-0', a.text)} />
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
              <PlusCircle weight={ICON_WEIGHT} className={cn('mt-0.5 h-4 w-4 shrink-0', a.text)} />
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
              { mode: 'renew' as const, icon: ArrowsClockwise, iconWeight: 'regular' as const, title: 'Продлить текущую', desc: 'Все данные сохранятся' },
              { mode: 'new' as const, icon: PlusCircle, iconWeight: 'duotone' as const, title: 'Создать новую', desc: 'Отдельная подписка' },
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
                  <opt.icon weight={opt.iconWeight} className={cn('h-5 w-5 shrink-0', a.text)} />
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
      <div ref={renewEndRef} />
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

export { OverviewTab };
