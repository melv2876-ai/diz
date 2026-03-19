import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'wwpro-cookies-consent';

type ConsentState = 'pending' | 'accepted' | 'rejected';

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>('accepted'); // hide by default, show only if pending

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setConsent('pending');
    }
  }, []);

  const accept = () => {
    window.localStorage.setItem(STORAGE_KEY, 'accepted');
    setConsent('accepted');
  };

  const reject = () => {
    window.localStorage.setItem(STORAGE_KEY, 'rejected');
    setConsent('rejected');
  };

  const isDark = document.documentElement.dataset.theme !== 'light';

  return (
    <AnimatePresence>
      {consent === 'pending' && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
          className={cn(
            'pointer-events-auto fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border p-4 shadow-lg backdrop-blur-sm md:left-auto md:right-6 md:bottom-6',
            isDark
              ? 'border-white/[0.06] bg-[#0a0a0a]/95 text-zinc-200'
              : 'border-zinc-200 bg-white/95 text-zinc-700',
          )}
        >
          <p className={cn('mb-3 text-sm leading-relaxed', isDark ? 'text-zinc-300' : 'text-zinc-600')}>
            Мы используем cookies для работы сервиса и улучшения вашего опыта.{' '}
            <Link to="/cookies" className="underline underline-offset-2">
              Подробнее
            </Link>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={accept}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                isDark
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800',
              )}
            >
              Принять
            </button>
            <button
              type="button"
              onClick={reject}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                isDark
                  ? 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
              )}
            >
              Только необходимые
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
