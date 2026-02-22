import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '~/lib/auth-context'
import { Wordmark } from '~/components/Wordmark'

export const Route = createFileRoute('/' as any)({
  component: HomePage,
});

function HomePage() {
  const { user, loading, login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="mb-4">
        <Wordmark className="justify-center text-2xl" />
      </h1>
      <p className="text-[var(--cw-muted)] mb-6 text-center max-w-md">
        Log chronological technical breadcrumbs. Compile them into articles.
      </p>
      {loading ? (
        <p className="text-[var(--cw-muted)] text-sm">Loading…</p>
      ) : user ? (
        <Link
          to="/traces"
          className="px-4 py-2 rounded bg-[var(--cw-accent)] text-[var(--cw-bg)] hover:opacity-90 transition"
        >
          Open dashboard
        </Link>
      ) : (
        <button
          type="button"
          onClick={login}
          className="px-4 py-2 rounded bg-[var(--cw-accent)] text-[var(--cw-bg)] hover:opacity-90 transition"
        >
          Continue with GitHub
        </button>
      )}
    </div>
  );
}
