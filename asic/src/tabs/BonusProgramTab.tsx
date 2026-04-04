import React, { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Gift, HandHeart, ShareNetwork, Copy, QrCode, TelegramLogo, WhatsappLogo,
  ArrowRight, CheckCircle, UserPlus, Users, Star, CaretRight,
  Detective, Ear, Eye, Ghost, Sparkle, Lightning, Confetti, Timer, Coins,
  ShieldStar, Parachute, Compass, Seal, SealCheck, Feather, Planet, Atom,
  Hexagon, Flower, HandPeace, Check, Crown, Diamond,
  CreditCard, Wallet, ShoppingCartSimple,
  ArrowsClockwise, Binoculars, CalendarBlank, ClipboardText, Envelope,
  Fingerprint, Globe, PlusCircle, RocketLaunch, ShieldCheck, X,
} from '@phosphor-icons/react';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn, ICON_WEIGHT, ThemeContext, ACCENTS, type AccentType, type ThemeType } from '../theme';
import { GlowCard } from '../components/ui';

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
  const { t, a, theme, navigateTab } = useContext(ThemeContext);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const referralCode = 'VLAD-WW2026';
  const referralLink = `https://ww.pro/ref/${referralCode}`;
  const totalReferrals = 5;
  const activeReferrals = 3;
  const totalEarnedDays = 50;
  const bonusDays = 15;
  const currentLevel = [...REFERRAL_LEVELS].reverse().find((l) => totalReferrals >= l.min) || REFERRAL_LEVELS[0];
  const nextLevel = REFERRAL_LEVELS.find((l) => l.min > totalReferrals);
  const progressToNext = nextLevel ? (totalReferrals / nextLevel.min) * 100 : 100;

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
    <div className="space-y-8">
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
            onClick={() => navigateTab('bonuses')}
            className={cn(
              'group flex w-full items-center justify-between rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300',
              a.button
            )}
          >
            <span className="flex items-center gap-2">
              <RocketLaunch weight={ICON_WEIGHT} className="h-4 w-4" /> Активировать {bonusDays} бонусных дней
            </span>
            <CaretRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
    </div>
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
  { label: 'Применяем бонусы', icon: Gift, duration: 1000 },
  { label: 'Обновляем подписку', icon: ArrowsClockwise, duration: 800 },
  { label: 'Готово!', icon: CheckCircle, duration: 600 },
];

const RENEW_PAYMENT_STEPS = [
  { label: 'Обработка платежа', icon: CreditCard, duration: 1200 },
  { label: 'Проверка оплаты', icon: ShieldCheck, duration: 1000 },
  { label: 'Обновляем подписку', icon: ArrowsClockwise, duration: 900 },
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
    <div className="space-y-6">
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
                  <Globe weight={ICON_WEIGHT} className={cn('mt-0.5 h-4 w-4 shrink-0', a.textLight)} />
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
              { value: `${bonusDays}`, label: 'Бонус-дней', Icon: CalendarBlank },
              { value: bonusGb > 0 ? `${bonusGb} ГБ` : '—', label: 'Трафик', Icon: Globe },
              { value: hasSubscription ? 'Продление' : 'Новая', label: 'Тип активации', Icon: hasSubscription ? ArrowsClockwise : PlusCircle },
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
              <RocketLaunch weight={ICON_WEIGHT} className="h-4 w-4" />
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
                    {hasSubscription
                      ? <ArrowsClockwise weight="regular" className={cn('h-5 w-5', a.text)} />
                      : <PlusCircle weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
                    }
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
                        <RocketLaunch weight={ICON_WEIGHT} className="h-4 w-4" />
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
                            ? <ArrowsClockwise weight="regular" className={cn('h-8 w-8', a.text)} />
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
    </div>
  );
};

/* ── Bonus Program Tab (combined) ── */
const BonusProgramTab = () => {
  const { t } = useContext(ThemeContext);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      <BonusTab />
      <div className={cn('h-px w-full', t.divider)} />
      <ReferralTab />
    </motion.div>
  );
};

export { BonusProgramTab };
