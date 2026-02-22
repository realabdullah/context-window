import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Wordmark } from '~/components/Wordmark';

export const Route = createFileRoute('/traces')({
  component: TracesLayout,
});

function TracesLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--cw-border)] px-4 py-3 flex items-center gap-4">
        <Wordmark asLink />
        <nav className="text-sm text-[var(--cw-muted)]">/ traces</nav>
      </header>
      <main className="flex-1 min-h-0 flex flex-col p-4">
        <Outlet />
      </main>
    </div>
  );
}
