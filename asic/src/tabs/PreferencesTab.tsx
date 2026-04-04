import React, { useContext, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  User, PencilSimple, TelegramLogo, Envelope, CalendarBlank, Check, Copy,
  Lock, CaretRight, Desktop, DeviceMobile, Laptop, SignOut, Gift, Info,
  ShieldCheck, Bell, GearSix, X, CheckCircle, Fingerprint, Plugs,
} from '@phosphor-icons/react';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn, ICON_WEIGHT, ThemeContext, type ThemeType, THEMES, ACCENTS, type AccentType } from '../theme';
import { GlowCard } from '../components/ui';

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

export { PreferencesTab };
