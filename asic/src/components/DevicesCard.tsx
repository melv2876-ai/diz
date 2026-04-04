import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Laptop, DeviceMobile, Devices, Globe, ShieldCheck, WarningCircle, X } from '@phosphor-icons/react';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn, ICON_WEIGHT, ThemeContext } from '../theme';
import { VPN_MAIN_DEVICES, WL_DEVICES } from '../data';
import { GlowCard } from './ui';

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

export { DeviceRow, DevicesCard };
