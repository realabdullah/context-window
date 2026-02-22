import {
  COMPILE_TONE_OPTIONS,
  DEFAULT_COMPILE_PROVIDER,
  DEFAULT_COMPILE_TONE,
} from '@context-window/shared';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { CompiledReview } from '~/components/CompiledReview';
import { LogFeed } from '~/components/LogFeed';
import {
  compileTrace,
  fetchCompileProviders,
  fetchTrace,
  updateTrace,
  type CompileProviderOption,
  type Log,
  type Trace,
} from '~/lib/api';

const isServer = typeof window === 'undefined';

export const Route = createFileRoute('/traces/$traceId')({
  loader: async ({ params }) => {
    if (isServer) return { trace: null as Trace | null, _ssr: true as const };
    const trace = await fetchTrace(params.traceId);
    return { trace };
  },
  component: TraceCapturePage,
});

function TraceCapturePage() {
  const loaderData = Route.useLoaderData() as { trace: Trace | null; _ssr?: true };
  const { trace: rawTrace, _ssr } = loaderData;
  const trace = rawTrace;
  const router = useRouter();

  const [providers, setProviders] = useState<CompileProviderOption[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>(DEFAULT_COMPILE_PROVIDER);
  const [selectedTone, setSelectedTone] = useState<string>(DEFAULT_COMPILE_TONE);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [logs, setLogs] = useState<Log[]>(trace?.logs ?? []);
  const [title, setTitle] = useState(trace?.title ?? '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);

  useEffect(() => {
    if (_ssr) router.invalidate();
  }, [_ssr, router]);
  useEffect(() => {
    if (trace) setLogs(trace.logs ?? []);
  }, [trace]);
  useEffect(() => {
    if (trace) setTitle(trace.title);
  }, [trace?.title]);

  const handleLogAdded = useCallback((newLog: Log) => {
    setLogs((prev) => [...prev, newLog]);
  }, []);

  const handleLogUpdated = useCallback((updated: Log) => {
    setLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }, []);

  const handleLogDeleted = useCallback((logId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  }, []);

  async function handleSaveTitle(newTitle: string) {
    if (!trace) return;
    const t = newTitle.trim() || trace.title;
    setEditingTitle(false);
    if (t === title) return;
    setSavingTitle(true);
    try {
      const updated = await updateTrace(trace.id, { title: t });
      setTitle(updated.title);
    } catch (e) {
      console.error(e);
      setTitle(trace.title);
    } finally {
      setSavingTitle(false);
    }
  }

  if (!trace) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6">
        <p className="text-[var(--cw-muted)] text-sm">Loading trace…</p>
      </div>
    );
  }

  const isCompiled = trace.status === 'COMPILED' && trace.article;
  const totalLogChars = logs.reduce((n, l) => n + (l.content?.length ?? 0), 0);
  const suggestKimi = totalLogChars > 30_000;

  async function loadProviders() {
    if (providers.length > 0) return;
    try {
      const list = await fetchCompileProviders();
      setProviders(list);
      // Keep Gemini as default when available; only fallback to first if current selection not in list
      if (list.length && !list.find((p) => p.id === selectedProvider)) {
        const defaultInList = list.find((p) => p.id === DEFAULT_COMPILE_PROVIDER);
        setSelectedProvider(defaultInList ? defaultInList.id : list[0].id);
      }
    } catch {
      setProviders([{ id: DEFAULT_COMPILE_PROVIDER, label: 'Default' }]);
    }
  }

  async function handleCompile() {
    if (!trace) return;
    setCompileError(null);
    setCompiling(true);
    try {
      await compileTrace(trace.id, selectedProvider, selectedTone);
      await router.invalidate();
    } catch (e) {
      setCompileError(e instanceof Error ? e.message : 'Compile failed');
    } finally {
      setCompiling(false);
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {editingTitle ? (
            <input
              type="text"
              aria-label="Trace title"
              title="Trace title"
              placeholder="Trace title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleSaveTitle(title)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') {
                  setTitle(trace.title);
                  setEditingTitle(false);
                }
              }}
              autoFocus
              disabled={savingTitle}
              className="text-lg font-medium bg-[var(--cw-bg)] border border-[var(--cw-border)] text-[var(--cw-fg)] px-2 py-0.5 rounded min-w-[200px] focus:outline-none focus:ring-1 focus:ring-[var(--cw-accent)]"
            />
          ) : (
            <h2
              className="text-lg font-medium text-[var(--cw-fg)] truncate cursor-pointer hover:text-[var(--cw-accent)] transition"
              onClick={() => setEditingTitle(true)}
              title="Click to edit title"
            >
              {title}
            </h2>
          )}
          <span className="text-xs text-[var(--cw-muted)] uppercase">
            {trace.status}
          </span>
        </div>
        {!isCompiled && logs.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <select
              aria-label="Output format / tone"
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="rounded border border-[var(--cw-border)] bg-[var(--cw-bg)] text-[var(--cw-fg)] text-sm px-2 py-1.5"
            >
              {COMPILE_TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              aria-label="AI provider for compilation"
              value={selectedProvider}
              onFocus={loadProviders}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="rounded border border-[var(--cw-border)] bg-[var(--cw-bg)] text-[var(--cw-fg)] text-sm px-2 py-1.5"
            >
              {providers.length === 0 && (
                <option value={DEFAULT_COMPILE_PROVIDER}>Default</option>
              )}
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCompile}
              disabled={compiling}
              className="px-3 py-1.5 rounded bg-[var(--cw-accent)] text-[var(--cw-bg)] text-sm hover:opacity-90 disabled:opacity-50"
            >
              {compiling ? 'Compiling…' : 'Compile'}
            </button>
          </div>
        )}
      </div>
      {!isCompiled && suggestKimi && (
        <p className="text-xs text-[var(--cw-muted)] mb-2">
          Long trace — consider using <strong>Kimi (Moonshot) 200k</strong> for best results.
        </p>
      )}
      {compileError && (
        <div className="mb-2 text-sm text-[var(--cw-error)]">{compileError}</div>
      )}
      {isCompiled && trace.article ? (
        <CompiledReview
          logs={logs}
          article={trace.article}
          traceTitle={title}
        />
      ) : (
        <LogFeed
          traceId={trace.id}
          initialLogs={logs}
          onLogAdded={handleLogAdded}
          onLogUpdated={handleLogUpdated}
          onLogDeleted={handleLogDeleted}
        />
      )}
    </div>
  );
}
