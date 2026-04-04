import React, { useContext, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  MagnifyingGlass, Star, Check, Checks, Gift, Info, CheckCircle, Megaphone,
  EnvelopeOpen, X, CaretRight, Envelope, GearSix, Trash,
} from '@phosphor-icons/react';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn, ICON_WEIGHT, ThemeContext } from '../theme';
import { type Notification, type NotificationType, NOTIFICATION_ICONS } from '../data';
import { useNotifications } from '../components/NotificationSystem';
import { GlowCard } from '../components/ui';

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


export { NotificationsTab };
