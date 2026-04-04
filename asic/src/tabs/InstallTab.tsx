import React, { useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AppleLogo, GooglePlayLogo, Desktop, DeviceMobile, Globe, DownloadSimple,
  Check, Info, CaretDown, PlusCircle, ArrowSquareOut, Binoculars, GearSix,
  ShareNetwork, CheckCircle, RocketLaunch, Lightning, WifiSlash,
  ShieldCheck, WarningCircle, Sparkle, Feather, Question,
} from '@phosphor-icons/react';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn, ICON_WEIGHT, ThemeContext } from '../theme';
import { pwaListeners, type BeforeInstallPromptEvent } from '../data';
import { GlowCard } from '../components/ui';

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
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

export { InstallTab };
