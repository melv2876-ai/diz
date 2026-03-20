import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CookieBanner from '@/components/CookieBanner';

const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const WhyUsPage = lazy(() => import('./pages/WhyUsPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#050505] font-mono text-xs text-zinc-500">
            Загрузка интерфейса...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/why-us" element={<WhyUsPage />} />
          <Route path="/terms" element={<LegalPage />} />
          <Route path="/privacy" element={<LegalPage />} />
          <Route path="/refund" element={<LegalPage />} />
          <Route path="/cookies" element={<LegalPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CookieBanner />
      </Suspense>
    </BrowserRouter>
  );
}
