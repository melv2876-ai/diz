import React, { useContext, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AppleLogo, GooglePlayLogo, Desktop, DeviceMobile, Television, Laptop,
  Copy, CaretDown, CaretRight, Globe, ShieldCheck, Plugs, QrCode,
  FileCode, Info, DownloadSimple, Binoculars, CellSignalFull, WifiSlash,
} from '@phosphor-icons/react';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn, ICON_WEIGHT, ThemeContext } from '../theme';
import { SERVERS } from '../data';
import { GlowCard } from '../components/ui';

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

export { VpnSetupTab };
