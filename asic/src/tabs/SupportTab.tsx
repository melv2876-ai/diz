import React, { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChatCircleDots, PaperPlaneTilt, Question, ArrowRight, WarningCircle,
  WifiSlash, Lifebuoy, CreditCard, ShieldCheck, Plugs, Wallet,
  X, Binoculars, CaretLeft, CaretRight, Check, Checks, Globe, Laptop,
  DeviceMobile, Desktop, Television, Copy, CheckCircle, Info, User,
  Paperclip, Smiley, ImageSquare, Headset, TelegramLogo, Envelope,
  Receipt, Crown, Diamond, List,
} from '@phosphor-icons/react';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn, ICON_WEIGHT, ThemeContext, THEMES, type ThemeType, type TabType } from '../theme';
import { type SupportMessage, type ChatReceipt, formatTime, INITIAL_SUPPORT_MESSAGES } from '../data';
import { GlowCard } from '../components/ui';
import { OPERATION_TYPE_META } from './HistoryTab';

const ChatReceiptCard = ({ receipt, label, compact }: { receipt: ChatReceipt; label: string; compact?: boolean }) => {
  const { t, a, theme } = useContext(ThemeContext);
  const meta = OPERATION_TYPE_META[receipt.type];
  const IconComp = meta.icon;

  const STATUS_DISPLAY: Record<string, { label: string; dot: string }> = {
    success: { label: 'Успешно', dot: 'bg-emerald-400' },
    pending: { label: 'Обработка', dot: 'bg-amber-400' },
    failed: { label: 'Ошибка', dot: 'bg-rose-400' },
  };

  const s = STATUS_DISPLAY[receipt.status];
  const subtleBg = theme === 'dark' ? 'bg-white/[0.04]' : 'bg-black/[0.03]';

  return (
    <div className={cn(
      'overflow-hidden rounded-2xl rounded-br-md border',
      theme === 'dark' ? 'bg-white/[0.06] border-white/[0.08]' : 'bg-black/[0.03] border-black/[0.06]',
    )}>
      {/* Header strip */}
      <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1.5">
        <WarningCircle weight="fill" className="h-3 w-3 text-rose-400" />
        <span className="text-[10px] font-semibold text-rose-400">{label}</span>
      </div>

      <div className="px-3 py-2 space-y-1.5">
        {/* Operation title + icon */}
        <div className="flex items-center gap-2">
          <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md', a.bgSoft)}>
            <IconComp weight={ICON_WEIGHT} className={cn('h-3 w-3', meta.color)} />
          </div>
          <span className={cn('text-[11px] font-medium leading-tight truncate', t.textStrong)}>{receipt.title}</span>
        </div>

        {compact ? (
          <>
            {/* Compact: 2×2 grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <MiniField label="Сумма" value={receipt.amount} t={t} />
              <MiniField label="Статус" t={t}>
                <span className="flex items-center gap-1">
                  <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
                  <span className={cn('text-[10px] font-medium', t.textStrong)}>{s.label}</span>
                </span>
              </MiniField>
              <MiniField label="Дата" value={`${receipt.date}, ${receipt.time}`} t={t} />
              {receipt.method ? <MiniField label="Метод" value={receipt.method} t={t} /> : receipt.plan ? <MiniField label="Тариф" value={receipt.plan} t={t} /> : null}
            </div>

            {/* User + TX combined */}
            <div className={cn('rounded-md px-2 py-1', subtleBg)}>
              <div className="flex items-center gap-1.5">
                <User weight={ICON_WEIGHT} className={cn('h-2.5 w-2.5 shrink-0', t.textSubtle)} />
                <span className={cn('text-[10px] font-medium truncate', t.textStrong)}>{receipt.userName}</span>
                <span className={cn('font-mono text-[9px] shrink-0', t.textMuted)}>{receipt.userId}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Receipt weight={ICON_WEIGHT} className={cn('h-2.5 w-2.5 shrink-0', t.textSubtle)} />
                <span className={cn('font-mono text-[9px] truncate', t.textMuted)}>{receipt.txId}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Full: 3×3 grid */}
            <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
              <MiniField label="Сумма" value={receipt.amount} t={t} />
              <MiniField label="Статус" t={t}>
                <span className="flex items-center gap-1">
                  <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
                  <span className={cn('text-[11px] font-medium', t.textStrong)}>{s.label}</span>
                </span>
              </MiniField>
              <MiniField label="Дата" value={receipt.date} t={t} />
              <MiniField label="Время" value={receipt.time} t={t} />
              {receipt.method ? <MiniField label="Метод" value={receipt.method} t={t} /> : null}
              {receipt.plan ? <MiniField label="Тариф" value={receipt.plan} t={t} /> : null}
            </div>

            {/* User section */}
            <div className={cn('rounded-lg px-2 py-1.5', subtleBg)}>
              <div className={cn('mb-0.5 text-[9px] font-medium uppercase tracking-wider', t.textSubtle)}>Пользователь</div>
              <div className="flex items-center gap-2">
                <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full', a.bgSoft)}>
                  <User weight={ICON_WEIGHT} className={cn('h-3 w-3', a.text)} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className={cn('text-[11px] font-medium', t.textStrong)}>{receipt.userName}</span>
                  <span className={cn('ml-1.5 font-mono text-[10px]', t.textMuted)}>ID {receipt.userId}</span>
                </div>
              </div>
            </div>

            {/* TX ID */}
            <div className={cn('flex items-center gap-1.5 rounded-lg px-2 py-1', subtleBg)}>
              <Receipt weight={ICON_WEIGHT} className={cn('h-3 w-3 shrink-0', t.textSubtle)} />
              <span className={cn('font-mono text-[10px]', t.textMuted)}>{receipt.txId}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const MiniField = ({ label, value, children, t }: { label: string; value?: string; children?: React.ReactNode; t: (typeof THEMES)[ThemeType] }) => (
  <div className="min-w-0">
    <div className={cn('text-[9px] uppercase tracking-wider', t.textSubtle)}>{label}</div>
    {children ?? <div className={cn('text-[11px] font-medium truncate', t.textStrong)}>{value}</div>}
  </div>
);

const SupportHeaderButton = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
  const { t, a } = useContext(ThemeContext);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        onClick={onToggle}
        className={cn(
          'relative rounded-full p-2 transition-all duration-300',
          isOpen
            ? cn(a.text, a.bgSoft)
            : hovered
              ? a.text
              : t.textMuted,
        )}
      >
        <ChatCircleDots weight={isOpen ? 'fill' : ICON_WEIGHT} className="h-[18px] w-[18px]" />
      </button>

      {/* Floating label — no container, just text */}
      <AnimatePresence>
        {hovered && !isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap"
          >
            <span className={cn('text-[11px] font-medium', a.text)}>Нужна помощь?</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const SupportChatPanel = ({
  isOpen,
  onClose,
  messages,
  onSend,
}: {
  isOpen: boolean;
  onClose: () => void;
  messages: SupportMessage[];
  onSend: (text: string) => void;
}) => {
  const { t, a, theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const miniChatMounted = useRef(false);

  /* Scroll to last message: instant on first open, smooth on new messages */
  useEffect(() => {
    if (!isOpen) { miniChatMounted.current = false; return; }
    const el = messagesEndRef.current;
    if (!el) return;
    if (!miniChatMounted.current) {
      miniChatMounted.current = true;
      const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 80);
      return () => clearTimeout(t);
    }
    el.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  /* Close on outside click/tap — handle both mouse and touch */
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const btn = (e.target as HTMLElement).closest('[data-support-toggle]');
        if (!btn) onClose();
      }
    };
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handler);
      document.addEventListener('touchstart', handler);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [isOpen, isMobile, onClose]);

  /* Lock body scroll when open on mobile */
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isMobile]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const panel = (
    <AnimatePresence>
      {isOpen ? (
        <>
          {/* Backdrop overlay on mobile */}
          {isMobile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={onClose}
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
                ? 'fixed inset-x-0 bottom-0 z-[61] flex flex-col overflow-hidden rounded-t-2xl border-t shadow-2xl backdrop-blur-xl'
                : 'absolute right-0 top-full z-50 mt-2 flex w-80 flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl',
              t.panel, a.border
            )}
            style={isMobile
              ? { maxHeight: 'calc(100vh - var(--safe-top, 0px) - 20px)', paddingBottom: 'var(--safe-bottom, 0px)' }
              : { maxHeight: 'min(500px, calc(100vh - 100px))' }
            }
          >
            {/* Header */}
            <div className={cn('flex shrink-0 items-center justify-between border-b px-4 py-3', t.border)}>
              <div className="flex items-center gap-3">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', a.bgSoft)}>
                  <ChatCircleDots weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
                </div>
                <div>
                  <div className={cn('text-sm font-medium', t.textStrong)}>Поддержка</div>
                  <div className={cn('text-[11px]', t.textMuted)}>Отвечаем по мере загруженности</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className={cn('rounded-full p-1.5 transition-colors', t.textSubtle, t.navHover)}
              >
                <X weight="bold" className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div
              className={cn('flex-1 overflow-y-auto px-4 py-4', isMobile && 'overscroll-contain')}
              style={isMobile ? { minHeight: 120 } : { minHeight: 200, maxHeight: 340 }}
            >
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('flex flex-col', msg.from === 'user' ? 'items-end' : 'items-start')}
                  >
                    {msg.receipt && msg.from === 'user' ? (
                      <div className="max-w-[85%]">
                        <ChatReceiptCard receipt={msg.receipt} label={msg.text} compact />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                          msg.from === 'support'
                            ? cn(a.bgSoft, t.text, 'rounded-bl-md')
                            : cn(a.color, 'text-black rounded-br-md')
                        )}
                      >
                        {msg.text}
                      </div>
                    )}
                    <span className={cn('mt-1 px-1 text-[10px]', t.textSubtle)}>{msg.time}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className={cn('shrink-0 border-t px-3 py-3', t.border)}>
              <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors', t.border, t.card)}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Напишите сообщение..."
                  rows={1}
                  className={cn(
                    'max-h-20 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-inherit',
                    t.text, t.textMuted
                  )}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
                    input.trim()
                      ? cn(a.color, 'text-black')
                      : cn(t.card, t.textSubtle)
                  )}
                >
                  <PaperPlaneTilt weight="fill" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );

  /* On mobile, render via portal to escape header overflow constraints */
  if (isMobile) return createPortal(panel, document.body);
  return panel;
};

/* ── Support Tab (page) ── */

type SupportTopicId = 'connection' | 'payment' | 'device' | 'security' | 'other';

type SupportAction =
  | { type: 'tab'; label: string; tab: TabType; scrollTo?: string }
  | { type: 'chat'; label: string };

type SupportSolution = {
  text: string;
  actions?: SupportAction[];
};

type SupportNode = {
  id: string;
  text: string;
  description?: string;
  options: {
    label: string;
    next?: SupportNode;
    solution?: SupportSolution;
  }[];
};

const SOLVED_NODE: SupportSolution = { text: 'Отлично! Рады, что помогли. Если возникнут другие вопросы — мы всегда на связи.' };

/* ─── Tree: Не подключается VPN ─── */
const CONNECTION_TREE: SupportNode = {
  id: 'conn-1',
  text: 'У вас есть активная подписка?',
  description: 'Проверьте в личном кабинете — подписка должна быть оплачена и не истекшей.',
  options: [
    {
      label: 'Да, есть',
      next: {
        id: 'conn-2',
        text: 'Какая подписка не работает?',
        options: [
          {
            label: 'Основная (безлимитная)',
            next: {
              id: 'conn-3a',
              text: 'Проверьте дату окончания подписки. Подписка ещё активна?',
              description: 'Дату можно посмотреть в личном кабинете на карточке подписки.',
              options: [
                {
                  label: 'Да, активна',
                  next: {
                    id: 'conn-4a',
                    text: 'Приложение Happ установлено на вашем устройстве?',
                    options: [
                      {
                        label: 'Да, установлено',
                        next: {
                          id: 'conn-5a',
                          text: 'Конфигурация VPN добавлена в приложение?',
                          description: 'Если вы не добавляли подписку в Happ — VPN не будет работать.',
                          options: [
                            {
                              label: 'Да, добавлена',
                              next: {
                                id: 'conn-6a',
                                text: 'Попробуйте сменить сервер в приложении Happ. Помогло?',
                                description: 'Иногда ближайший сервер бывает перегружен. Выберите другую страну.',
                                options: [
                                  { label: 'Да, помогло', solution: SOLVED_NODE },
                                  {
                                    label: 'Нет, не помогло',
                                    next: {
                                      id: 'conn-7a',
                                      text: 'Интернет работает без VPN?',
                                      description: 'Отключите VPN и проверьте, открываются ли сайты.',
                                      options: [
                                        {
                                          label: 'Нет, интернет не работает',
                                          solution: {
                                            text: 'Проблема в вашем интернет-соединении, а не в VPN. Проверьте Wi-Fi или мобильную сеть, перезагрузите роутер.',
                                          },
                                        },
                                        {
                                          label: 'Да, интернет работает',
                                          next: {
                                            id: 'conn-8a',
                                            text: 'Попробуйте полностью отключить VPN, подождать 10 секунд и включить заново. Помогло?',
                                            options: [
                                              { label: 'Да, помогло', solution: SOLVED_NODE },
                                              {
                                                label: 'Нет',
                                                solution: {
                                                  text: 'Вероятно, ваш провайдер блокирует VPN-протоколы. Попробуйте подключиться через мобильную сеть (LTE). Если проблема сохраняется — напишите нам, мы разберёмся.',
                                                  actions: [{ type: 'chat', label: 'Написать в чат' }],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              label: 'Нет, не добавлена',
                              solution: {
                                text: 'Перейдите в раздел «Настройка VPN», выберите ваше устройство и нажмите «Добавить подписку». Ссылка автоматически настроит VPN в приложении.',
                                actions: [{ type: 'tab', label: 'Перейти к настройке VPN', tab: 'billing' }],
                              },
                            },
                          ],
                        },
                      },
                      {
                        label: 'Нет, не установлено',
                        solution: {
                          text: 'Для работы VPN необходимо установить приложение Happ. Перейдите в раздел «Настройка VPN» — там есть инструкция и ссылки для скачивания под ваше устройство.',
                          actions: [{ type: 'tab', label: 'Перейти к установке', tab: 'billing' }],
                        },
                      },
                    ],
                  },
                },
                {
                  label: 'Нет, истекла',
                  solution: {
                    text: 'Ваша подписка истекла. Продлите её в личном кабинете, чтобы VPN снова заработал.',
                    actions: [{ type: 'tab', label: 'Продлить подписку', tab: 'overview' }],
                  },
                },
              ],
            },
          },
          {
            label: 'Белые списки',
            next: {
              id: 'conn-3b',
              text: 'Вы подключены через LTE / мобильную сеть?',
              description: 'Важно: белые списки работают ТОЛЬКО через мобильный интернет (LTE/5G). Через Wi-Fi они не работают.',
              options: [
                {
                  label: 'Да, через LTE',
                  next: {
                    id: 'conn-4b',
                    text: 'Проверьте остаток гигабайт. У вас есть доступные GB?',
                    description: 'Без гигабайт белые списки работать не будут. Баланс GB отображается в личном кабинете.',
                    options: [
                      {
                        label: 'Да, GB есть',
                        next: {
                          id: 'conn-5b',
                          text: 'Конфигурация белых списков добавлена в приложение Happ?',
                          options: [
                            {
                              label: 'Да, добавлена',
                              next: {
                                id: 'conn-6b',
                                text: 'Попробуйте отключить VPN, подождать 10 секунд и подключиться заново. Помогло?',
                                options: [
                                  { label: 'Да, помогло', solution: SOLVED_NODE },
                                  {
                                    label: 'Нет',
                                    solution: {
                                      text: 'Опишите вашу проблему в чате — мы разберёмся и поможем.',
                                      actions: [{ type: 'chat', label: 'Написать в чат' }],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              label: 'Нет, не добавлена',
                              solution: {
                                text: 'Перейдите в «Настройка VPN» → раздел «Белые списки» и добавьте конфигурацию в приложение. Помните: используйте только LTE, не Wi-Fi.',
                                actions: [{ type: 'tab', label: 'Настроить белые списки', tab: 'billing', scrollTo: 'whitelist-section' }],
                              },
                            },
                          ],
                        },
                      },
                      {
                        label: 'Нет, GB закончились',
                        solution: {
                          text: 'Для работы белых списков нужны гигабайты. Купите нужный объём в личном кабинете — GB зачислятся мгновенно.',
                          actions: [{ type: 'tab', label: 'Купить гигабайты', tab: 'overview' }],
                        },
                      },
                    ],
                  },
                },
                {
                  label: 'Нет, через Wi-Fi',
                  solution: {
                    text: 'Белые списки работают ТОЛЬКО через мобильный интернет (LTE/5G). Отключите Wi-Fi и используйте мобильные данные. Это техническое ограничение — через Wi-Fi белые списки не функционируют.',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      label: 'Нет подписки',
      solution: {
        text: 'Для работы VPN необходима активная подписка. Оформите её в личном кабинете — доступны тарифы от 1 до 12 месяцев.',
        actions: [{ type: 'tab', label: 'Оформить подписку', tab: 'overview' }],
      },
    },
    {
      label: 'Не знаю',
      solution: {
        text: 'Проверьте наличие подписки в личном кабинете. Если подписка активна — на карточке будет отображаться статус и дата окончания.',
        actions: [{ type: 'tab', label: 'Проверить подписку', tab: 'overview' }],
      },
    },
  ],
};

/* ─── Tree: Вопрос по оплате ─── */
const PAYMENT_TREE: SupportNode = {
  id: 'pay-1',
  text: 'Выберите вашу ситуацию:',
  options: [
    {
      label: 'Оплата не проходит',
      next: {
        id: 'pay-2a',
        text: 'Каким способом вы пытаетесь оплатить?',
        options: [
          {
            label: 'ЮKassa (карта / СБП)',
            solution: {
              text: 'Проверьте, достаточно ли средств на карте. Попробуйте другую карту или способ оплаты СБП. Как альтернативу — используйте CryptoBot (криптовалюта через Telegram). Если ни один способ не работает — напишите нам.',
              actions: [{ type: 'chat', label: 'Написать в чат' }],
            },
          },
          {
            label: 'CryptoBot (криптовалюта)',
            solution: {
              text: 'Проверьте баланс криптовалютного кошелька и доступность Telegram-бота @CryptoBot. Убедитесь, что вы подтвердили транзакцию в боте. Как альтернативу — попробуйте оплату через ЮKassa. Если проблема сохраняется — напишите нам.',
              actions: [{ type: 'chat', label: 'Написать в чат' }],
            },
          },
        ],
      },
    },
    {
      label: 'Хочу продлить подписку',
      solution: {
        text: 'Перейдите в личный кабинет и нажмите «Продлить подписку». Вы сможете выбрать тариф и способ оплаты. Дни добавятся к текущему сроку.',
        actions: [{ type: 'tab', label: 'Продлить подписку', tab: 'overview' }],
      },
    },
    {
      label: 'Хочу сменить тариф',
      solution: {
        text: 'При продлении подписки вы можете выбрать другой тариф. Текущая подписка будет действовать до конца оплаченного периода, после чего активируется новый план.',
        actions: [{ type: 'tab', label: 'Перейти к продлению', tab: 'overview' }],
      },
    },
    {
      label: 'Хочу купить гигабайты',
      solution: {
        text: 'Гигабайты нужны для работы белых списков. Перейдите в личный кабинет → раздел «Белые списки» → «Купить GB». Доступны пакеты 5, 10, 20, 50 GB по 19 ₽/GB. GB зачисляются мгновенно.',
        actions: [{ type: 'tab', label: 'Купить гигабайты', tab: 'overview' }],
      },
    },
    {
      label: 'Возврат средств',
      solution: {
        text: 'Для оформления возврата напишите в чат поддержки с указанием ID транзакции. ID транзакции можно найти в истории операций.',
        actions: [
          { type: 'tab', label: 'История операций', tab: 'history' },
          { type: 'chat', label: 'Написать в чат' },
        ],
      },
    },
  ],
};

/* ─── Tree: Настройка устройства ─── */
const DEVICE_TREE: SupportNode = {
  id: 'dev-1',
  text: 'Что вам нужно настроить?',
  options: [
    {
      label: 'Установить приложение',
      next: {
        id: 'dev-2a',
        text: 'На каком устройстве?',
        options: [
          {
            label: 'iOS (iPhone / iPad)',
            solution: {
              text: 'Скачайте приложение Happ из App Store. После установки откройте его и разрешите добавление VPN-конфигурации. Подробная инструкция — в разделе «Настройка VPN».',
              actions: [{ type: 'tab', label: 'Инструкция для iOS', tab: 'billing' }],
            },
          },
          {
            label: 'Android',
            solution: {
              text: 'Скачайте Happ из Google Play или APK-файл по ссылке. Если устанавливаете APK — разрешите установку из неизвестных источников в настройках устройства.',
              actions: [{ type: 'tab', label: 'Инструкция для Android', tab: 'billing' }],
            },
          },
          {
            label: 'macOS',
            solution: {
              text: 'Скачайте Happ из App Store или по прямой ссылке. После установки разрешите добавление VPN-конфигурации.',
              actions: [{ type: 'tab', label: 'Инструкция для macOS', tab: 'billing' }],
            },
          },
          {
            label: 'Windows',
            solution: {
              text: 'Скачайте установщик Happ и запустите setup. VPN-конфигурация добавится автоматически после активации подписки.',
              actions: [{ type: 'tab', label: 'Инструкция для Windows', tab: 'billing' }],
            },
          },
          {
            label: 'TV',
            solution: {
              text: 'Установите Happ из магазина приложений вашего телевизора. При первом запуске введите код авторизации, который отобразится на экране.',
              actions: [{ type: 'tab', label: 'Инструкция для TV', tab: 'billing' }],
            },
          },
        ],
      },
    },
    {
      label: 'Добавить подписку в приложение',
      solution: {
        text: 'Перейдите в раздел «Настройка VPN», выберите ваше устройство и нажмите «Добавить подписку». Ссылка автоматически настроит VPN в приложении Happ.',
        actions: [{ type: 'tab', label: 'Настроить VPN', tab: 'billing' }],
      },
    },
    {
      label: 'Добавить / удалить устройство',
      solution: {
        text: 'Лимит подключённых устройств — 5 штук. Если лимит исчерпан, отвяжите ненужное устройство в настройках VPN и подключите новое.',
        actions: [{ type: 'tab', label: 'Управление устройствами', tab: 'billing' }],
      },
    },
    {
      label: 'Настроить белые списки',
      solution: {
        text: 'Выберите устройство в разделе «Настройка VPN», затем нажмите «Добавить белые списки». Помните: белые списки работают только через LTE/мобильную сеть, не через Wi-Fi.',
        actions: [{ type: 'tab', label: 'Настроить белые списки', tab: 'billing', scrollTo: 'whitelist-section' }],
      },
    },
    {
      label: 'Сменить сервер',
      solution: {
        text: 'Откройте приложение Happ → перейдите в список серверов → выберите другую страну и переподключитесь. Более близкий сервер обычно даёт лучшую скорость.',
      },
    },
  ],
};

/* ─── Tree: Безопасность ─── */
const SECURITY_TREE: SupportNode = {
  id: 'sec-1',
  text: 'Что вас беспокоит?',
  options: [
    {
      label: 'Приватность данных',
      solution: {
        text: 'Мы не храним логи вашей активности. Весь трафик шифруется, а DNS-запросы идут через защищённый туннель. Ваши данные остаются приватными и не передаются третьим лицам.',
      },
    },
    {
      label: 'Подозрительная активность в аккаунте',
      next: {
        id: 'sec-2a',
        text: 'Рекомендуем немедленно выполнить следующее:',
        description: '1. Смените пароль аккаунта\n2. Отвяжите все неизвестные устройства\n3. Если проблема сохраняется — свяжитесь с нами',
        options: [
          {
            label: 'Перейти к управлению устройствами',
            solution: {
              text: 'Откройте раздел «Настройка VPN» → «Устройства» и отвяжите все устройства, которые вы не узнаёте. После этого смените пароль.',
              actions: [{ type: 'tab', label: 'Управление устройствами', tab: 'billing' }],
            },
          },
          {
            label: 'Написать в поддержку',
            solution: {
              text: 'Опишите ситуацию в чате — мы проверим вашу учётную запись и поможем обезопасить аккаунт.',
              actions: [{ type: 'chat', label: 'Написать в чат' }],
            },
          },
        ],
      },
    },
    {
      label: 'Утечка данных / DNS leak',
      solution: {
        text: 'Убедитесь, что VPN-соединение активно и весь трафик идёт через туннель. Если вы подозреваете утечку DNS — напишите нам, мы поможем провести диагностику.',
        actions: [{ type: 'chat', label: 'Написать в чат' }],
      },
    },
  ],
};

const SUPPORT_TOPICS: {
  id: SupportTopicId;
  icon: React.ElementType;
  label: string;
  tree: SupportNode | null;
}[] = [
  { id: 'connection', icon: WifiSlash, label: 'Не подключается VPN', tree: CONNECTION_TREE },
  { id: 'payment', icon: CreditCard, label: 'Вопрос по оплате', tree: PAYMENT_TREE },
  { id: 'device', icon: DeviceMobile, label: 'Вопрос по настройке', tree: DEVICE_TREE },
  { id: 'security', icon: ShieldCheck, label: 'Безопасность', tree: SECURITY_TREE },
  { id: 'other', icon: Question, label: 'Другое', tree: null },
];

const SupportTab = ({ onOpenChat, messages, onSend }: { onOpenChat: () => void; messages: SupportMessage[]; onSend: (text: string) => void }) => {
  const { t, a, navigateTab } = useContext(ThemeContext);
  const [activeTopic, setActiveTopic] = useState<SupportTopicId | null>(null);
  const [currentNode, setCurrentNode] = useState<SupportNode | null>(null);
  const [nodeHistory, setNodeHistory] = useState<SupportNode[]>([]);
  const [resolvedSolution, setResolvedSolution] = useState<SupportSolution | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatAutoScrolled = useRef(false);

  /* When user scrolls main and chat becomes visible — auto-scroll chat to last msg */
  useEffect(() => {
    chatAutoScrolled.current = false;
    let scrollCount = 0;
    const main = document.querySelector('main');
    if (!main) return;

    const check = () => {
      if (chatAutoScrolled.current) return;
      scrollCount++;
      if (scrollCount <= 2) return;
      const chat = chatRef.current;
      if (!chat) return;
      const mainRect = main.getBoundingClientRect();
      const chatRect = chat.getBoundingClientRect();
      if (chatRect.top < mainRect.bottom && chatRect.bottom > mainRect.top) {
        chatAutoScrolled.current = true;
        const area = messagesAreaRef.current;
        if (area) area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
      }
    };

    main.addEventListener('scroll', check, { passive: true });
    return () => main.removeEventListener('scroll', check);
  }, []);

  /* On new message — scroll chat area to bottom */
  const prevMsgCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      const area = messagesAreaRef.current;
      if (area) area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  const totalDepth = nodeHistory.length + (currentNode ? 1 : 0);

  const handleTopicClick = (topic: SupportTopicId) => {
    if (topic === 'other') {
      setActiveTopic('other');
      setCurrentNode(null);
      setNodeHistory([]);
      setResolvedSolution(null);
      setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      return;
    }
    const found = SUPPORT_TOPICS.find((t) => t.id === topic);
    setActiveTopic(topic);
    setCurrentNode(found?.tree ?? null);
    setNodeHistory([]);
    setResolvedSolution(null);
  };

  const handleOptionSelect = (option: { next?: SupportNode; solution?: SupportSolution }) => {
    if (option.solution) {
      setResolvedSolution(option.solution);
    } else if (option.next) {
      if (currentNode) setNodeHistory((h) => [...h, currentNode]);
      setCurrentNode(option.next);
      setResolvedSolution(null);
    }
  };

  const handleBack = () => {
    if (resolvedSolution) {
      setResolvedSolution(null);
      return;
    }
    if (nodeHistory.length > 0) {
      const prev = nodeHistory[nodeHistory.length - 1];
      setNodeHistory((h) => h.slice(0, -1));
      setCurrentNode(prev);
      setResolvedSolution(null);
    } else {
      setActiveTopic(null);
      setCurrentNode(null);
      setResolvedSolution(null);
    }
  };

  const handleReset = () => {
    setActiveTopic(null);
    setCurrentNode(null);
    setNodeHistory([]);
    setResolvedSolution(null);
  };

  const handleAction = (action: SupportAction) => {
    if (action.type === 'tab') {
      navigateTab(action.tab as TabType, action.scrollTo);
    } else {
      const topicLabel = SUPPORT_TOPICS.find((tp) => tp.id === activeTopic)?.label ?? '';
      setChatInput(topicLabel ? `${topicLabel}: ` : '');
      setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  };

  const handleSend = () => {
    const trimmed = chatInput.trim();
    if (!trimmed && attachments.length === 0) return;
    const text = attachments.length > 0
      ? `${trimmed}\n📎 ${attachments.map((f) => f.name).join(', ')}`
      : trimmed;
    onSend(text);
    setChatInput('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map((f) => ({
      name: f.name,
      size: f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(0)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <motion.div
      key="support"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      {/* ── Guided problem solver ── */}
      <div className={cn('overflow-hidden rounded-2xl border', t.border)}>
        {/* Header */}
        <div className={cn('px-6 pt-6 pb-4', t.cardSolid)}>
          <div className="flex items-start gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', a.bgSoft)}>
              <Headset weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={cn('text-sm font-medium', t.textStrong)}>Чем можем помочь?</h2>
              <p className={cn('mt-1 text-xs leading-relaxed', t.textMuted)}>
                Пройдите наш опросник — в 95% случаев мы выявим точную причину, и вы сможете устранить проблему без ожидания ответа поддержки. Отвечайте конкретно на вопросы, и мы проведём вас по решению шаг за шагом.
              </p>
            </div>
          </div>
        </div>

        {/* Topic pills */}
        <div className={cn('flex flex-wrap gap-2 border-t px-6 py-4', t.border, t.cardSolid)}>
          {SUPPORT_TOPICS.map((topic) => {
            const isActive = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all',
                  isActive
                    ? cn(a.bgSoft, a.text, a.border, 'border')
                    : cn('border', t.border, t.text, t.borderHover, 'hover:bg-white/[0.03]')
                )}
              >
                <topic.icon weight={ICON_WEIGHT} className="h-4 w-4" />
                {topic.label}
              </button>
            );
          })}
        </div>

        {/* Guided flow area */}
        <AnimatePresence mode="wait">
          {activeTopic && activeTopic !== 'other' && (currentNode || resolvedSolution) ? (
            <motion.div
              key={`${activeTopic}-${currentNode?.id ?? 'solved'}-${resolvedSolution ? 'r' : 'q'}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={cn('border-t px-6 py-5', t.border, t.cardSolid)}
            >
              {/* Progress dots + back button */}
              <div className="mb-4 flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all', t.text, t.navHover)}
                >
                  <CaretLeft weight="bold" className="h-3 w-3" />
                  Назад
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalDepth + (resolvedSolution ? 1 : 0) }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        i <= nodeHistory.length
                          ? cn('w-3', a.color)
                          : cn('w-1.5', t.textSubtle, 'opacity-30'),
                      )}
                    />
                  ))}
                </div>
              </div>

              {!resolvedSolution && currentNode ? (
                /* ── Question step ── */
                <div className="space-y-3">
                  <p className={cn('text-sm font-medium', t.textStrong)}>{currentNode.text}</p>
                  {currentNode.description ? (
                    <p className={cn('text-xs leading-relaxed', t.textMuted)}>
                      {currentNode.description.split('\n').map((line, i) => (
                        <span key={i}>{line}{i < currentNode.description!.split('\n').length - 1 ? <br /> : null}</span>
                      ))}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentNode.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionSelect(opt)}
                        className={cn(
                          'min-h-[36px] rounded-xl border px-3.5 py-2 text-xs font-medium transition-all',
                          t.border, t.text, t.borderHover, 'hover:bg-white/[0.03]'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : resolvedSolution ? (
                /* ── Solution step ── */
                <div className="space-y-3">
                  <div className={cn('flex items-start gap-2.5 rounded-xl p-3', a.bgSoft)}>
                    <CheckCircle weight={ICON_WEIGHT} className={cn('mt-0.5 h-4 w-4 shrink-0', a.text)} />
                    <p className={cn('text-sm leading-relaxed', t.text)}>{resolvedSolution.text}</p>
                  </div>

                  {/* Action buttons */}
                  {resolvedSolution.actions && resolvedSolution.actions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {resolvedSolution.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleAction(action)}
                          className={cn(
                            'rounded-xl px-4 py-2 text-xs font-medium transition-all',
                            i === 0 ? a.button : cn('border', t.border, t.text, t.borderHover, 'hover:bg-white/[0.03]'),
                          )}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {/* Reset / chat fallback */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className={cn('text-xs', t.textMuted)}>Помогло?</span>
                    <button
                      onClick={handleReset}
                      className={cn('rounded-xl px-3 py-1.5 text-xs font-medium transition-all', a.button)}
                    >
                      Да, спасибо
                    </button>
                    <button
                      onClick={() => {
                        const topicLabel = SUPPORT_TOPICS.find((tp) => tp.id === activeTopic)?.label ?? '';
                        setChatInput(topicLabel ? `${topicLabel}: ` : '');
                        setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
                      }}
                      className={cn(
                        'rounded-xl border px-3 py-1.5 text-xs font-medium transition-all',
                        t.border, t.text, t.borderHover, 'hover:bg-white/[0.03]'
                      )}
                    >
                      Нет, написать в чат
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── Full Chat ── */}
      <div ref={chatRef} className={cn('overflow-hidden rounded-2xl border', t.border)}>
        {/* Chat header */}
        <div className={cn('flex items-center gap-3 px-6 py-4', t.cardSolid)}>
          <div className="relative">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', a.bgSoft)}>
              <ChatCircleDots weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
            </div>
            {/* online dot */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0a0a] bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn('text-sm font-medium', t.textStrong)}>Поддержка WW</div>
            <div className={cn('text-[11px]', t.textMuted)}>Обычно отвечаем в течение часа</div>
          </div>
          <div className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium', a.border, a.bgSoft, a.text)}>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Онлайн
          </div>
        </div>

        {/* Messages area */}
        <div className={cn('border-t', t.border)}>
          <div
            ref={messagesAreaRef}
            className={cn('overflow-y-auto px-5 py-5', t.cardSolid)}
            style={{ minHeight: 320, maxHeight: 480 }}
          >
            {/* Date separator */}
            <div className="mb-5 flex items-center justify-center">
              <span className={cn('rounded-full px-3 py-1 text-[10px] font-medium', t.card, t.textSubtle, 'border', t.border)}>Сегодня</span>
            </div>

            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex', msg.from === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.from === 'support' ? (
                    <div className="flex max-w-[80%] gap-2.5">
                      <div className={cn('mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full', a.bgSoft)}>
                        <Lifebuoy weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5', a.text)} />
                      </div>
                      <div>
                        <div className={cn('rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed', t.card, 'border', t.border, t.text)}>
                          {msg.text}
                        </div>
                        <div className={cn('mt-1 pl-1 text-[10px]', t.textSubtle)}>{msg.time}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex max-w-[80%] flex-col items-end">
                      {msg.receipt ? (
                        <ChatReceiptCard receipt={msg.receipt} label={msg.text} />
                      ) : (
                        <div className={cn('rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed', a.color, 'text-black')}>
                          {msg.text}
                        </div>
                      )}
                      <div className={cn('mt-1 flex items-center gap-1 pr-1 text-[10px]', t.textSubtle)}>
                        {msg.time}
                        <Checks weight="bold" className="h-3 w-3" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Attachments preview */}
        <AnimatePresence>
          {attachments.length > 0 ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={cn('overflow-hidden border-t', t.border, t.cardSolid)}
            >
              <div className="flex flex-wrap gap-2 px-5 py-3">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className={cn('flex items-center gap-2 rounded-lg border px-2.5 py-1.5', t.border, t.card)}
                  >
                    <Paperclip weight={ICON_WEIGHT} className={cn('h-3.5 w-3.5', t.textSubtle)} />
                    <span className={cn('max-w-[120px] truncate text-[11px] font-medium', t.text)}>{file.name}</span>
                    <span className={cn('text-[10px]', t.textSubtle)}>{file.size}</span>
                    <button onClick={() => removeAttachment(idx)} className={cn('ml-0.5 rounded-full p-0.5 transition-colors', t.textSubtle, t.navHover)}>
                      <X weight="bold" className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Input area */}
        <div className={cn('border-t px-4 py-3', t.border, t.cardSolid)}>
          <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors focus-within:border-white/[0.1]', t.border, t.card)}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt,.log,.zip"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors', t.textSubtle, t.navHover)}
              title="Прикрепить файл"
            >
              <Paperclip weight={ICON_WEIGHT} className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors', t.textSubtle, t.navHover)}
              title="Отправить изображение"
            >
              <ImageSquare weight={ICON_WEIGHT} className="h-4.5 w-4.5" />
            </button>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              rows={1}
              className={cn(
                'max-h-28 flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none',
                t.text,
                'placeholder:' + t.textSubtle,
              )}
            />
            <button
              onClick={handleSend}
              disabled={!chatInput.trim() && attachments.length === 0}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
                chatInput.trim() || attachments.length > 0
                  ? cn(a.color, 'text-black')
                  : cn(t.card, t.textSubtle)
              )}
            >
              <PaperPlaneTilt weight="fill" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Contact fallback — bottom ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href="https://t.me/wwpro_support"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group flex items-center gap-3 rounded-2xl border p-4 transition-all',
            t.border, t.card, t.borderHover
          )}
        >
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', a.bgSoft)}>
            <TelegramLogo weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn('text-sm font-medium', t.textStrong)}>Telegram</div>
            <div className={cn('text-[11px]', t.textMuted)}>@wwpro_support</div>
          </div>
          <ArrowRight weight="bold" className={cn('h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100', t.textSubtle)} />
        </a>

        <a
          href="mailto:support@ww.pro"
          className={cn(
            'group flex items-center gap-3 rounded-2xl border p-4 transition-all',
            t.border, t.card, t.borderHover
          )}
        >
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', a.bgSoft)}>
            <Envelope weight={ICON_WEIGHT} className={cn('h-5 w-5', a.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn('text-sm font-medium', t.textStrong)}>Email</div>
            <div className={cn('text-[11px]', t.textMuted)}>support@ww.pro</div>
          </div>
          <ArrowRight weight="bold" className={cn('h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100', t.textSubtle)} />
        </a>
      </div>
    </motion.div>
  );
};


export { SupportTab, SupportChatPanel, SupportHeaderButton, ChatReceiptCard };
