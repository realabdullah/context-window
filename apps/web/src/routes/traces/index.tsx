import { useState, useEffect } from 'react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { fetchTraces, createTrace } from '~/lib/api';

const isServer = typeof window === 'undefined';

export const Route = createFileRoute('/traces/')({
  loader: async () => {
    if (isServer) return { traces: [] as Awaited<ReturnType<typeof fetchTraces>>, _ssr: true as const };
    const traces = await fetchTraces();
    return { traces };
  },
  component: TracesIndexPage,
});

function TracesIndexPage() {
  const loaderData = Route.useLoaderData();
  const { traces, _ssr } = loaderData as { traces: Awaited<ReturnType<typeof fetchTraces>>; _ssr?: true };
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (_ssr) router.invalidate();
  }, [_ssr, router]);

  async function handleNewTrace() {
    setCreating(true);
    try {
      const trace = await createTrace('Untitled trace');
      await router.navigate({ to: '/traces/$traceId', params: { traceId: trace.id } });
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-[var(--cw-fg)]">
          Traces
        </h2>
        <button
          type="button"
          onClick={handleNewTrace}
          disabled={creating}
          className="px-3 py-1.5 rounded bg-[var(--cw-accent)] text-[var(--cw-bg)] text-sm hover:opacity-90 disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'New trace'}
        </button>
      </div>
      {traces.length === 0 ? (
        <p className="text-[var(--cw-muted)] text-sm">
          No traces yet. Click &quot;New trace&quot; to start capturing.
        </p>
      ) : (
        <ul className="space-y-2">
          {traces.map((t) => (
            <li key={t.id}>
              <Link
                to="/traces/$traceId"
                params={{ traceId: t.id }}
                className="block p-3 rounded border border-[var(--cw-border)] hover:border-[var(--cw-accent)] text-[var(--cw-fg)] transition"
              >
                <span className="font-medium">{t.title}</span>
                <span className="text-[var(--cw-muted)] text-sm ml-2">
                  {t.status} · {(t._count?.logs ?? 0)} logs
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
