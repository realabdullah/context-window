import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '~/lib/auth-context';
import { TracesHeader } from '~/routes/traces-header';

export const Route = createFileRoute('/traces')({
  component: TracesLayout,
});

function TracesLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: '/' as any });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-[var(--cw-muted)] text-sm">Checking auth…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TracesHeader />
      <main className="flex-1 min-h-0 flex flex-col p-4">
        <Outlet />
      </main>
    </div>
  );
}
