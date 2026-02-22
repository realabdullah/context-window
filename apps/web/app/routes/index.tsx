import { createFileRoute, Link } from '@tanstack/react-router';
import { Wordmark } from '~/components/Wordmark';

export const Route = createFileRoute('/' as any)({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="mb-4">
        <Wordmark className="justify-center text-2xl" />
      </h1>
      <p className="text-[var(--cw-muted)] mb-6 text-center max-w-md">
        Log chronological technical breadcrumbs. Compile them into articles.
      </p>
      <Link
        to="/traces"
        className="px-4 py-2 rounded bg-[var(--cw-accent)] text-[var(--cw-bg)] hover:opacity-90 transition"
      >
        Open dashboard
      </Link>
    </div>
  );
}
