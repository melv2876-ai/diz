import { useEffect } from 'react';
import Hero from '@/components/Hero';

export default function HomePage() {
  useEffect(() => {
    document.title = 'WW.pro - VPN нового поколения';
  }, []);

  return (
    <main className="min-h-screen selection:bg-emerald-500/30 selection:text-emerald-200">
      <Hero />
    </main>
  );
}
