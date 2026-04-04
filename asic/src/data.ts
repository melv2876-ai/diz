import { Gift, Info, CheckCircle, Megaphone } from '@phosphor-icons/react';

/* ── Notification types ── */

export type NotificationType = 'promo' | 'info' | 'success' | 'system';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  fullBody?: string;
  time: string;
  read: boolean;
  starred?: boolean;
  action?: { label: string; href: string };
};

export const NOTIFICATION_ICONS: Record<NotificationType, any> = {
  promo: Gift,
  info: Info,
  success: CheckCircle,
  system: Megaphone,
};

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'promo',
    title: 'Бонус 5 дней бесплатно',
    body: 'Привяжите Telegram-аккаунт и получите 5 дней VPN в подарок',
    fullBody: 'Здравствуйте!\n\nМы подготовили для вас специальное предложение: привяжите Telegram-аккаунт к вашему профилю WW.pro и получите 5 дней бесплатного VPN-доступа.\n\nКак получить бонус:\n\n1. Перейдите в настройки профиля\n2. Нажмите «Привязать Telegram»\n3. Подтвердите аккаунт через бота @wwpro_bot\n4. 5 дней будут начислены автоматически\n\nПредложение действует для всех новых пользователей. Привязка занимает менее минуты.\n\nС уважением,\nКоманда WW.pro',
    time: 'Сейчас',
    read: false,
    starred: true,
    action: { label: 'Получить', href: '#' },
  },
  {
    id: '2',
    type: 'success',
    title: 'Вход выполнен',
    body: 'Новый вход через Telegram с устройства macOS',
    fullBody: 'Зафиксирован новый вход в ваш аккаунт.\n\nДетали:\n• Метод: Telegram OAuth\n• Устройство: macOS (MacBook Pro)\n• Браузер: Safari 18.2\n• IP: 185.220.xx.xx\n• Локация: Москва, Россия\n• Время: 14 марта 2026, 15:42 MSK\n\nЕсли это были не вы — немедленно смените пароль и обратитесь в службу поддержки.\n\nБезопасность вашего аккаунта — наш приоритет.',
    time: '2 мин назад',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Обновление серверов',
    body: 'Добавлены новые локации: Стамбул, Варшава',
    fullBody: 'Мы расширили нашу серверную инфраструктуру!\n\nНовые локации:\n\n🇹🇷 Стамбул, Турция\n— Пинг из Москвы: ~48 мс\n— Оптимально для доступа к турецким сервисам\n\n🇵🇱 Варшава, Польша\n— Пинг из Москвы: ~35 мс\n— Быстрое подключение к европейским ресурсам\n\nОба сервера уже доступны в приложении Hub. Просто выберите новую локацию из списка серверов.\n\nМы продолжаем расширять географию — следующие на очереди: Сеул и Сингапур.\n\nСпасибо, что выбираете WW.pro!',
    time: '1 час назад',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Плановое обслуживание серверов',
    body: 'Серверы Франкфурт и Амстердам будут недоступны 16 марта с 03:00 до 05:00 MSK',
    fullBody: 'Уважаемый пользователь!\n\nСообщаем о предстоящем плановом обслуживании серверной инфраструктуры.\n\n📅 Дата: 16 марта 2026\n🕐 Время: 03:00 — 05:00 MSK\n🌍 Затронутые серверы: Франкфурт (DE), Амстердам (NL)\n\nНа время обслуживания:\n• Подключения к указанным серверам будут временно прерваны\n• Автоматическое переключение на ближайший доступный сервер\n• Все остальные локации работают в штатном режиме\n\nЧто мы делаем:\n— Обновление ядра WireGuard до версии 1.0.20260315\n— Оптимизация маршрутизации трафика\n— Увеличение пропускной способности на 40%\n\nПриносим извинения за возможные неудобства. После завершения работ вы заметите значительное улучшение скорости.\n\nС уважением,\nТехническая команда WW.pro',
    time: '3 часа назад',
    read: true,
    starred: true,
  },
  {
    id: '5',
    type: 'promo',
    title: 'Весенняя скидка 30%',
    body: 'Только до 31 марта — годовой тариф со скидкой 30%',
    fullBody: '🌸 Весенняя акция WW.pro!\n\nТолько до 31 марта 2026 года — специальная скидка 30% на годовой тариф Pro.\n\nЧто входит:\n✓ Безлимитный VPN-трафик\n✓ Все серверные локации\n✓ До 5 устройств одновременно\n✓ Белые списки\n✓ Приоритетная поддержка\n\n💰 Было: 2 388 ₽/год\n💚 Стало: 1 672 ₽/год (139 ₽/мес)\n\nПромокод: SPRING2026\n\nАктивируйте в разделе «Личный кабинет» при оформлении подписки.\n\nУсловия:\n— Промокод одноразовый\n— Действует только на годовой тариф\n— Не суммируется с другими скидками\n\nНе упустите возможность!',
    time: 'Вчера',
    read: true,
    action: { label: 'Активировать', href: '#' },
  },
  {
    id: '6',
    type: 'info',
    title: 'Новая версия приложения Hub v2.4',
    body: 'Доступно обновление — улучшена скорость и стабильность',
    fullBody: 'Доступна новая версия приложения Hub v2.4!\n\nЧто нового:\n\n🚀 Производительность\n— Скорость подключения улучшена на 25%\n— Уменьшено потребление батареи на мобильных устройствах\n— Оптимизирован расход оперативной памяти\n\n🛡️ Безопасность\n— Обновлён протокол WireGuard\n— Добавлена защита от DNS-утечек\n— Улучшено обнаружение нестабильных соединений\n\n✨ Интерфейс\n— Новый виджет быстрого подключения\n— Статус серверов в реальном времени\n— Тёмная тема по умолчанию\n\nОбновите приложение через App Store или скачайте актуальную версию на сайте.',
    time: '2 дня назад',
    read: true,
  },
];

/* ── Mock data ── */

export type PaymentMethod = 'yukassa' | 'cryptobot';

export const SUB_PLANS = [
  { id: '1m', months: 1, label: '1 месяц', oldPrice: 199, price: 99, perMonth: 99, badge: null, highlighted: false },
  { id: '3m', months: 3, label: '3 месяца', oldPrice: 597, price: 249, perMonth: 83, badge: 'optimal' as const, highlighted: true },
  { id: '6m', months: 6, label: '6 месяцев', oldPrice: 1194, price: 449, perMonth: 75, badge: null, highlighted: false },
  { id: '12m', months: 12, label: '12 месяцев', oldPrice: 2388, price: 749, perMonth: 62, badge: 'best' as const, highlighted: false },
];

export const BILLING_HISTORY = [
  { id: 'INV-2024-001', date: '15 окт 2024', amount: '$9.99', status: 'paid', plan: 'Тариф Pro' },
  { id: 'INV-2024-002', date: '15 ноя 2024', amount: '$9.99', status: 'paid', plan: 'Тариф Pro' },
  { id: 'INV-2024-003', date: '15 дек 2024', amount: '$9.99', status: 'pending', plan: 'Тариф Pro' },
];

export const SERVERS = [
  { country: 'Германия', city: 'Франкфурт', flag: '🇩🇪', ping: '24 мс' },
  { country: 'Нидерланды', city: 'Амстердам', flag: '🇳🇱', ping: '28 мс' },
  { country: 'Финляндия', city: 'Хельсинки', flag: '🇫🇮', ping: '32 мс' },
  { country: 'США', city: 'Нью-Йорк', flag: '🇺🇸', ping: '89 мс' },
  { country: 'Великобритания', city: 'Лондон', flag: '🇬🇧', ping: '36 мс' },
  { country: 'Турция', city: 'Стамбул', flag: '🇹🇷', ping: '48 мс' },
];

export const VPN_MAIN_DEVICES = [
  { id: 1, name: 'MacBook Pro 16"', os: 'macOS', location: 'Франкфурт, Германия', ip: '192.168.1.12' },
  { id: 2, name: 'iPhone 14 Pro', os: 'iOS', location: 'Лондон, Великобритания', ip: '10.0.0.5' },
  { id: 3, name: 'Windows Desktop', os: 'Windows 11', location: 'Нью-Йорк, США', ip: '172.16.0.8' },
];

export const WL_DEVICES = [
  { id: 4, name: 'iPhone 14 Pro', os: 'iOS', location: 'Лондон, Великобритания', ip: '10.0.0.5' },
  { id: 5, name: 'MacBook Pro 16"', os: 'macOS', location: 'Франкфурт, Германия', ip: '192.168.1.12' },
];

/* ── PWA Install Prompt ── */

export let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
export const pwaListeners = new Set<() => void>();

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

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

/* ── Shared types ── */

export type OperationType = 'purchase' | 'renewal' | 'bonus' | 'refund' | 'gift' | 'promo';

export type ChatReceipt = {
  txId: string;
  type: OperationType;
  title: string;
  amount: string;
  date: string;
  time: string;
  status: 'success' | 'pending' | 'failed';
  userName: string;
  userId: string;
  method?: string;
  plan?: string;
};

export type SupportMessage = {
  from: 'user' | 'support';
  text: string;
  time: string;
  id: string;
  receipt?: ChatReceipt;
};

export function formatTime() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export const INITIAL_SUPPORT_MESSAGES: SupportMessage[] = [
  { id: '1', from: 'support', text: 'Добро пожаловать в поддержку WW.pro! Чем можем помочь?', time: '15:30' },
];
