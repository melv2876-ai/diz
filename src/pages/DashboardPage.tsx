import { Suspense, lazy, useEffect } from 'react';

const DashboardApp = lazy(() => import('../../asic/src/App'));

export default function DashboardPage() {
  useEffect(() => {
    document.title = 'WW.pro - Dashboard';
  }, []);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050505] font-mono text-xs text-zinc-500">
          Подготовка дашборда...
        </div>
      }
    >
      <DashboardApp />
    </Suspense>
  );
}
