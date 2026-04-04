import React, { useContext, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ShoppingCartSimple, Gift, Receipt, ClockCounterClockwise, ArrowsClockwise,
  CaretRight, Copy, Check, ArrowSquareOut, Headset, Crown, Diamond,
  CreditCard, Wallet, CheckCircle, RocketLaunch, Confetti, WarningCircle,
} from '@phosphor-icons/react';
import { useIsMobile } from '../../../hooks/use-mobile';
import { cn, ICON_WEIGHT, ThemeContext, type ThemeType, THEMES } from '../theme';
import { type ChatReceipt, type OperationType } from '../data';
import { GlowCard } from '../components/ui';

type Operation = {
  id: string;
  type: OperationType;
  title: string;
  description: string;
  amount: string;
  date: string;
  time?: string;
  status: 'success' | 'pending' | 'failed';
  txId?: string;
  method?: string;
  plan?: string;
  userId?: string;
  userName?: string;
  period?: string;
  bonusAmount?: string;
};

const OPERATION_TYPE_META: Record<OperationType, { label: string; icon: React.ElementType; color: string }> = {
  purchase: { label: 'Покупка', icon: ShoppingCartSimple, color: 'text-blue-400' },
  bonus: { label: 'Бонус', icon: Gift, color: 'text-amber-400' },
  refund: { label: 'Возврат', icon: ClockCounterClockwise, color: 'text-rose-400' },
  renewal: { label: 'Продление', icon: RocketLaunch, color: 'text-emerald-400' },
  promo: { label: 'Промокод', icon: Confetti, color: 'text-violet-400' },
  gift: { label: 'Подарок', icon: Gift, color: 'text-pink-400' },
};

const OPERATIONS_HISTORY: Operation[] = [
  {
    id: 'op-1',
    txId: 'TXN-20260310-7A3F',
    type: 'purchase',
    title: 'Подписка Pro — 3 месяца',
    description: 'Оплата подписки Pro на 3 месяца через ЮKassa',
    amount: '249 ₽',
    date: '10 мар 2026',
    time: '14:32',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
    method: 'ЮKassa (Visa ··4832)',
    plan: 'Pro',
    period: '10 мар — 10 июн 2026',
  },
  {
    id: 'op-2',
    txId: 'TXN-20260308-1B92',
    type: 'bonus',
    title: 'Реферальный бонус +7 дней',
    description: 'Начисление бонусных дней за приглашённого пользователя @anna_k',
    amount: '+7 дней',
    date: '8 мар 2026',
    time: '09:15',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
    bonusAmount: '7 дней VPN',
  },
  {
    id: 'op-3',
    txId: 'TXN-20260301-4E7D',
    type: 'promo',
    title: 'Промокод SPRING2026',
    description: 'Активация промокода — скидка 30% на годовой тариф',
    amount: '-30%',
    date: '1 мар 2026',
    time: '18:44',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
  },
  {
    id: 'op-4',
    txId: 'TXN-20260215-9C1A',
    type: 'renewal',
    title: 'Автопродление Pro — 1 месяц',
    description: 'Автоматическое продление подписки Pro',
    amount: '99 ₽',
    date: '15 фев 2026',
    time: '00:01',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
    method: 'ЮKassa (Visa ··4832)',
    plan: 'Pro',
    period: '15 фев — 15 мар 2026',
  },
  {
    id: 'op-5',
    txId: 'TXN-20260210-3F8B',
    type: 'purchase',
    title: 'Подписка Pro — 1 месяц',
    description: 'Первая оплата подписки через CryptoBot',
    amount: '99 ₽',
    date: '10 фев 2026',
    time: '11:20',
    status: 'failed',
    userId: '829104571',
    userName: '@vlad_dev',
    method: 'CryptoBot (USDT)',
    plan: 'Pro',
  },
  {
    id: 'op-6',
    txId: 'TXN-20260205-6D4E',
    type: 'bonus',
    title: 'Бонус привязка Telegram',
    description: 'Начисление 5 бесплатных дней за привязку Telegram-аккаунта',
    amount: '+5 дней',
    date: '5 фев 2026',
    time: '16:03',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
    bonusAmount: '5 дней VPN',
  },
  {
    id: 'op-7',
    txId: 'TXN-20260120-2A9F',
    type: 'refund',
    title: 'Возврат за подписку',
    description: 'Возврат средств за неиспользованный период подписки',
    amount: '149 ₽',
    date: '20 янв 2026',
    time: '13:47',
    status: 'success',
    userId: '829104571',
    userName: '@vlad_dev',
    method: 'ЮKassa → Visa ··4832',
  },
];

type HistoryFilter = 'all' | 'purchase' | 'bonus' | 'refund';
const HistoryTab = ({ onSendToSupport }: { onSendToSupport: (text: string, receipt?: ChatReceipt) => void }) => {
  const { t, a, theme, navigateTab } = useContext(ThemeContext);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [expandedOp, setExpandedOp] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const filters: { key: HistoryFilter; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'purchase', label: 'Покупки' },
    { key: 'bonus', label: 'Бонусы' },
    { key: 'refund', label: 'Возвраты' },
  ];

  const filtered = OPERATIONS_HISTORY.filter((op) => {
    if (filter === 'all') return true;
    if (filter === 'purchase') return op.type === 'purchase' || op.type === 'renewal';
    if (filter === 'bonus') return op.type === 'bonus' || op.type === 'promo';
    return op.type === filter;
  });

  const statusMeta: Record<string, { label: string; cls: string }> = {
    success: { label: 'Успешно', cls: 'text-emerald-400 bg-emerald-400/10' },
    pending: { label: 'В обработке', cls: 'text-amber-400 bg-amber-400/10' },
    failed: { label: 'Ошибка', cls: 'text-rose-400 bg-rose-400/10' },
  };

  const buildReceiptText = (op: Operation) => {
    const lines = [
      `\u2501\u2501\u2501 \u0427\u0435\u043a \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0438 \u2501\u2501\u2501`,
      `ID: ${op.txId}`,
      `\u0422\u0438\u043f: ${OPERATION_TYPE_META[op.type].label}`,
      `${op.title}`,
      `\u0421\u0443\u043c\u043c\u0430: ${op.amount}`,
      `\u0414\u0430\u0442\u0430: ${op.date}, ${op.time}`,
      `\u0421\u0442\u0430\u0442\u0443\u0441: ${statusMeta[op.status].label}`,
      `\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c: ${op.userName} (${op.userId})`,
    ];
    if (op.method) lines.push(`\u041c\u0435\u0442\u043e\u0434: ${op.method}`);
    if (op.plan) lines.push(`\u0422\u0430\u0440\u0438\u0444: ${op.plan}`);
    if (op.period) lines.push(`\u041f\u0435\u0440\u0438\u043e\u0434: ${op.period}`);
    lines.push(`\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
    return lines.join('\n');
  };

  const handleReportProblem = (op: Operation) => {
    const receipt: ChatReceipt = {
      txId: op.txId || '',
      type: op.type,
      title: op.title,
      amount: op.amount,
      date: op.date,
      time: op.time || '',
      status: op.status,
      userName: op.userName || '',
      userId: op.userId || '',
      method: op.method,
      plan: op.plan,
    };
    onSendToSupport('Проблема с оплатой', receipt);
    navigateTab('support');
  };

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={cn('text-lg font-medium', t.textStrong)}>История операций</h1>
          <p className={cn('mt-1 text-sm', t.textMuted)}>Все транзакции, начисления и чеки</p>
        </div>
      </div>

      {/* Filters */}
      <div className={cn('flex items-center gap-1.5 rounded-xl border p-1', t.card, t.border)}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300',
              filter === f.key
                ? cn(a.bgSoft, a.text)
                : cn(t.textMuted, 'hover:' + t.textStrong)
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Operations list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <GlowCard>
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ClockCounterClockwise weight={ICON_WEIGHT} className={cn('mb-3 h-10 w-10', t.textSubtle)} />
              <p className={cn('text-sm font-medium', t.textMuted)}>Нет операций</p>
              <p className={cn('mt-1 text-xs', t.textSubtle)}>По выбранному фильтру операции не найдены</p>
            </div>
          </GlowCard>
        ) : (
          filtered.map((op) => {
            const meta = OPERATION_TYPE_META[op.type];
            const status = statusMeta[op.status];
            const isExpanded = expandedOp === op.id;
            const IconComp = meta.icon;

            return (
              <GlowCard key={op.id}>
                {/* Main row */}
                <button
                  onClick={() => setExpandedOp(isExpanded ? null : op.id)}
                  className="flex w-full items-center gap-3 p-4 text-left sm:p-5"
                >
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', a.bgSoft)}>
                    <IconComp weight={ICON_WEIGHT} className={cn('h-5 w-5', meta.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn('truncate text-sm font-medium', t.textStrong)}>{op.title}</h3>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', status.cls)}>
                        {status.label}
                      </span>
                    </div>
                    <div className={cn('mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs', t.textSubtle)}>
                      <span>{op.date}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{op.time}</span>
                      <span>•</span>
                      <span className={cn('font-mono text-[11px]', t.textMuted)}>{op.txId}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={cn(
                      'text-sm font-medium tabular-nums',
                      op.type === 'refund' ? 'text-rose-400' : op.type === 'bonus' || op.type === 'promo' ? 'text-emerald-400' : t.textStrong
                    )}>
                      {op.type === 'refund' ? '+' : op.type === 'purchase' || op.type === 'renewal' ? '-' : ''}{op.amount}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CaretRight weight="bold" className={cn('h-3.5 w-3.5', t.textSubtle)} />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded receipt */}
                <AnimatePresence>
                  {isExpanded ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                      className="overflow-hidden"
                    >
                      <div className={cn('mx-4 mb-4 rounded-xl border p-4 sm:mx-5 sm:mb-5 sm:p-5', t.cardSolid, t.border)}>
                        {/* Receipt header */}
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Receipt weight={ICON_WEIGHT} className={cn('h-4 w-4', a.text)} />
                            <span className={cn('text-xs font-medium uppercase tracking-wider', t.textSubtle)}>Чек операции</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(buildReceiptText(op), op.id + '-receipt'); }}
                            className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors', t.textMuted, t.borderHover, 'border', t.border)}
                          >
                            {copiedField === op.id + '-receipt' ? (
                              <><Check weight="bold" className="h-3 w-3" /> Скопировано</>
                            ) : (
                              <><Copy weight={ICON_WEIGHT} className="h-3 w-3" /> Скопировать</>
                            )}
                          </button>
                        </div>

                        {/* Receipt fields */}
                        <div className="space-y-2.5">
                          <ReceiptRow label="ID транзакции" value={op.txId || ''} mono onCopy={() => handleCopy(op.txId || '', op.id + '-txid')} copied={copiedField === op.id + '-txid'} t={t} />
                          <ReceiptRow label="Тип операции" value={meta.label} t={t} />
                          <ReceiptRow label="Описание" value={op.description} t={t} />
                          <ReceiptRow label="Сумма" value={op.amount} t={t} />
                          <ReceiptRow label="Дата и время" value={`${op.date}, ${op.time}`} t={t} />
                          <ReceiptRow label="Статус" value={status.label} statusCls={status.cls} t={t} />
                          <ReceiptRow label="Пользователь" value={`${op.userName}`} t={t} />
                          <ReceiptRow label="ID пользователя" value={op.userId || ''} mono onCopy={() => handleCopy(op.userId || '', op.id + '-uid')} copied={copiedField === op.id + '-uid'} t={t} />
                          {op.method ? <ReceiptRow label="Метод оплаты" value={op.method} t={t} /> : null}
                          {op.plan ? <ReceiptRow label="Тариф" value={op.plan} t={t} /> : null}
                          {op.period ? <ReceiptRow label="Период" value={op.period} t={t} /> : null}
                          {op.bonusAmount ? <ReceiptRow label="Начислено" value={op.bonusAmount} t={t} /> : null}
                        </div>

                        {/* Action buttons */}
                        <div className={cn('mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row', t.border)}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReportProblem(op); }}
                            className={cn(
                              'flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-300',
                              'text-rose-400 border-rose-400/20 bg-rose-400/5 hover:bg-rose-400/10'
                            )}
                          >
                            <WarningCircle weight={ICON_WEIGHT} className="h-4 w-4" />
                            Проблема с оплатой
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(buildReceiptText(op), op.id + '-receipt'); }}
                            className={cn(
                              'flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-300',
                              t.border, t.textMuted, t.borderHover, 'hover:' + t.textStrong
                            )}
                          >
                            <Copy weight={ICON_WEIGHT} className="h-4 w-4" />
                            Скопировать чек
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </GlowCard>
            );
          })
        )}
      </div>

      {/* bottom spacer */}
      <div className="h-4" />
    </motion.div>
  );
};

const ReceiptRow = ({
  label,
  value,
  mono,
  onCopy,
  copied,
  statusCls,
  t,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  statusCls?: string;
  t: (typeof THEMES)[ThemeType];
}) => (
  <div className="flex items-start justify-between gap-3">
    <span className={cn('shrink-0 text-xs', t.textSubtle)}>{label}</span>
    <div className="flex items-center gap-1.5 text-right">
      {statusCls ? (
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', statusCls)}>{value}</span>
      ) : (
        <span className={cn('text-xs font-medium', mono ? 'font-mono text-[11px]' : '', t.textStrong)}>{value}</span>
      )}
      {onCopy ? (
        <button onClick={(e) => { e.stopPropagation(); onCopy(); }} className={cn('rounded p-0.5 transition-colors', t.textSubtle)}>
          {copied ? <Check weight="bold" className="h-3 w-3 text-emerald-400" /> : <Copy weight={ICON_WEIGHT} className="h-3 w-3" />}
        </button>
      ) : null}
    </div>
  </div>
);

/* ── PWA Install Section ── */

export { HistoryTab, OPERATION_TYPE_META };
