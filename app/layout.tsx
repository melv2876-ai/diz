import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'WW.pro - Лучший VPN сервис',
  description: 'Безопасный и быстрый VPN с обходом блокировок.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ru" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-zinc-950 text-zinc-100 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
