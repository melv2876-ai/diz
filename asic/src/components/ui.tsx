import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { cn, ICON_WEIGHT, ThemeContext } from '../theme';

const NavItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => {
  const { t, a } = useContext(ThemeContext);

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group min-h-[44px]',
        active ? t.navActiveText : cn(t.textMuted, t.navHover)
      )}
    >
      {active ? (
        <motion.div
          layoutId="activeNavBg"
          className={cn('absolute inset-0 rounded-xl bg-gradient-to-r to-transparent opacity-80', a.navBg)}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      ) : null}
      <div className="relative z-10 flex items-center gap-3 whitespace-nowrap">
        <Icon weight={ICON_WEIGHT} className={cn('h-5 w-5 shrink-0 transition-colors', active ? a.textLight : t.textMuted)} />
        <span className="truncate">{label}</span>
      </div>
    </button>
  );
};

const GlowCard = ({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => {
  const { t, a } = useContext(ThemeContext);

  return (
    <div
      id={id}
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-500',
        t.card,
        t.border,
        t.borderHover,
        className
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          a.glowCard
        )}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/* ── Device Row with hover unlink ── */

export { NavItem, GlowCard };
