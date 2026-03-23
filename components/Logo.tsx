import { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  theme: 'dark' | 'milky';
  accent: 'emerald' | 'orange' | 'blue' | 'pink';
  className?: string;
  iconOnly?: boolean;
}

/* ── Accent palettes — 3-stop icon gradient + 2-stop text accent ── */

const LOGO_PALETTES = {
  emerald: {
    dark: {
      iconA: '#0e7490', iconB: '#0d9488', iconC: '#22c55e',
      accentA: '#06b6d4', accentB: '#22c55e',
      shadow: '#10b981',
    },
    milky: {
      iconA: '#0e7490', iconB: '#0d9488', iconC: '#22c55e',
      accentA: '#0891b2', accentB: '#16a34a',
      shadow: '#10b981',
    },
  },
  orange: {
    dark: {
      iconA: '#be123c', iconB: '#e11d48', iconC: '#f59e0b',
      accentA: '#e11d48', accentB: '#f59e0b',
      shadow: '#ea580c',
    },
    milky: {
      iconA: '#be123c', iconB: '#e11d48', iconC: '#f59e0b',
      accentA: '#be123c', accentB: '#d97706',
      shadow: '#f97316',
    },
  },
  blue: {
    dark: {
      iconA: '#177086', iconB: '#3B59AE', iconC: '#6D39C6',
      accentA: '#006682', accentB: '#5945B6',
      shadow: '#2b4cc4',
    },
    milky: {
      iconA: '#177086', iconB: '#3B59AE', iconC: '#6D39C6',
      accentA: '#006682', accentB: '#5945B6',
      shadow: '#2b4cc4',
    },
  },
  pink: {
    dark: {
      iconA: '#4338ca', iconB: '#a21caf', iconC: '#ec4899',
      accentA: '#7c3aed', accentB: '#ec4899',
      shadow: '#db2777',
    },
    milky: {
      iconA: '#4338ca', iconB: '#a21caf', iconC: '#ec4899',
      accentA: '#6d28d9', accentB: '#db2777',
      shadow: '#ec4899',
    },
  },
} as const;

/* ── Real SVG paths from the source vector ── */

// Icon rounded-rect background
const ICON_BG =
  'm266.1 22h-161.6c-44.78 0-76.49 35.74-76.49 81.86v154.3c0 43.35 33.78 79.87 76.69 79.87h159.1c44.34 0 75.16-36.9 75.16-77.98v-155.8c0-44.86-31.03-82.25-72.86-82.25z';

// Shield outline
const SHIELD =
  'm265.8 126.1c-35.71 4.03-65.41-11.99-81.88-29.28-16.06 17.12-40.79 30.97-80.26 29.28-3.73 12.81-7.45 27.43-6.48 40.77 4.24 57.94 40.14 86.79 86.74 101.1 37.27-11.79 80.15-41.78 86.74-99.29 1.67-14.95-0.89-29.91-4.86-42.61zm-8.19 42.02c-4.88 42.61-35.09 71.21-72.99 84.32-34.67-10.05-70.46-37.37-73.84-83.17-0.77-10.37-0.07-19.19 2.74-32.11 26.63 0.26 50.5-6.13 69.44-24.02 17.55 15.22 40.19 23.99 73.03 24.02 2.97 10.64 2.84 21.06 1.62 30.96z';

// Keyhole
const KEYHOLE =
  'm183.8 158.7c-10.97 0.03-17.72 12.15-11.54 22.82 1.66 3.08 4.4 4.99 4.89 5.72v12.72c0 4.79 2.05 7.68 6.8 7.68s6.57-2.43 6.57-7.68v-12.72c1.34-1.23 3.43-3.02 4.77-5.11 6.84-10.5-1.09-23.46-11.49-23.43z';

// WW letters
const WW_PATH =
  'm402 115.4h38.84l25.04 69.82 23.85-69.82h35.26l22.67 69.82 24.74-69.82h75.03l21.68 69.82 23.06-69.82h35.66l24.74 69.82 28.27-69.82h38.84l-49.79 128.3h-33.84l-25.94-74.83-23.84 74.83h-34.25l-43.93-120.8-41.4 120.8h-33.84l-26.74-74.83-22.67 74.83h-39.24l-42.2-128.3z';

// Dot
const DOT_PATH =
  'm816.6 224.8c0-12.82 9.46-19.59 19.43-19.59 10.79 0 18.16 7.75 18.16 18.75 0 11.98-9.56 19.47-18.51 19.47-10.64 0-19.08-8.51-19.08-18.63z';

// p
const P_PATH =
  'm869.7 152.7h28.45v10.15c6.24-7.9 15.65-12.13 27.89-12.13 25.88 0 42.47 18.17 42.47 46.2 0 26.82-18.17 48.12-43.73 48.12-10.38 0-18.78-3.53-25.18-10.69v40.19h-29.9v-121.8zm68.25 44.01c0-13.7-9.23-20.97-20.08-20.97-12.14 0-19.72 9.95-19.72 21.32 0 12.59 8.24 21.79 20.05 21.79 12.4 0 19.75-9.9 19.75-22.14z';

// r
const R_PATH =
  'm985.7 152.7h28.45v14.15c3.89-9.57 11.77-14.91 24.47-14.91 2.58 0 4.43 0.2 6.24 0.6l-1.37 26.62c-2.65-0.67-5.5-1-8.33-1-13.77 0-19.56 7.59-19.56 24.39v39.22h-29.9v-89.07z';

// o
const O_PATH =
  'm1054 196.9c0-27.36 19.75-46.2 48.2-46.2 28.05 0 48.23 18.17 48.23 45.13 0 27.08-20.66 47.83-48.94 47.83-27.56 0-47.49-19.8-47.49-46.76zm66.27-0.8c0-13.08-8.85-21.4-19.36-21.4-11.89 0-19.64 9.64-19.64 21.87 0 12.56 8.36 21.77 19.47 21.77 11.58 0 19.53-9.65 19.53-22.24z';

export function Logo({ theme, accent, className, iconOnly = false }: LogoProps) {
  const id = useId().replace(/:/g, '');
  const tone = LOGO_PALETTES[accent][theme];
  const isDark = theme === 'dark';

  const gid = (s: string) => `${id}-${s}`;

  // Full source: 1184×364. Icon area ~0–340, text ~402–1150.
  // iconOnly → show just icon box; full → entire logo.
  const viewBox = iconOnly ? '10 10 320 344' : '10 10 1170 344';

  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(iconOnly ? 'h-10 w-10 shrink-0' : 'h-10 w-auto shrink-0', className)}
      role="img"
      aria-label="WW.pro"
    >
      <defs>
        {/* icon background gradient — diagonal 3-stop */}
        <linearGradient id={gid('ig')} x1="308.9" y1="39.66" x2="51.73" y2="321.5" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={tone.iconC} />
          <stop offset="0.51" stopColor={tone.iconB} />
          <stop offset="1" stopColor={tone.iconA} />
        </linearGradient>

        {/* WW fill */}
        <linearGradient id={gid('wf')} x1="610.9" y1="110.8" x2="610.9" y2="246.9" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={isDark ? '#ffffff' : '#ffffff'} />
          <stop offset="1" stopColor={isDark ? '#D4E4F9' : '#f1f5f9'} />
        </linearGradient>

        {/* WW stroke */}
        <linearGradient id={gid('ws')} x1="610.9" y1="110.8" x2="610.9" y2="246.9" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={isDark ? tone.iconC : '#18181b'} />
          <stop offset="1" stopColor={isDark ? tone.iconA : '#0f172a'} />
        </linearGradient>

        {/* .pro accent gradient */}
        <linearGradient id={gid('ag')} x1="816" y1="150" x2="1150" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={tone.accentA} />
          <stop offset="1" stopColor={tone.accentB} />
        </linearGradient>

        {/* icon shadow */}
        <filter id={gid('sh')} x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity={isDark ? 0.35 : 0.07} />
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={tone.shadow} floodOpacity={isDark ? 0.25 : 0.1} />
        </filter>
      </defs>

      {/* ── icon ── */}
      <g filter={`url(#${gid('sh')})`}>
        <path d={ICON_BG} fill={`url(#${gid('ig')})`} />
        <path d={SHIELD} fill="#fff" />
        <path d={KEYHOLE} fill="#fff" />
      </g>

      {/* ── wordmark ── */}
      {!iconOnly && (
        <>
          {/* WW */}
          <path
            d={WW_PATH}
            fill={`url(#${gid('wf')})`}
            stroke={`url(#${gid('ws')})`}
            strokeMiterlimit="10"
            strokeWidth="5.416"
          />
          {/* .pro */}
          <path d={DOT_PATH} fill={`url(#${gid('ag')})`} />
          <path d={P_PATH} fill={`url(#${gid('ag')})`} />
          <path d={R_PATH} fill={`url(#${gid('ag')})`} />
          <path d={O_PATH} fill={`url(#${gid('ag')})`} />
        </>
      )}
    </svg>
  );
}
