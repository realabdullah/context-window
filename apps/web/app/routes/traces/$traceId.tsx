import {
  COMPILE_TONE_OPTIONS,
  DEFAULT_COMPILE_PROVIDER,
  DEFAULT_COMPILE_TONE,
} from '@context-window/shared'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { CompiledReview } from '../../components/CompiledReview'
import { LogFeed } from '../../components/LogFeed'
import {
  compileTrace,
  fetchCompileProviders,
  fetchTrace,
  type CompileProviderOption,
} from '../../lib/api'

export const Route = createFileRoute('/traces/$traceId')({
  loader: async ({ params }) => {
    const trace = await fetchTrace(params.traceId);
    return { trace };
  },
  component: TraceCapturePage,
});

function TraceCapturePage() {
  const { trace } = Route.useLoaderData();
  const router = useRouter();
  const [providers, setProviders] = useState<CompileProviderOption[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>(DEFAULT_COMPILE_PROVIDER);
  const [selectedTone, setSelectedTone] = useState<string>(DEFAULT_COMPILE_TONE);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);

  const isCompiled = trace?.status === 'COMPILED' && trace.article;
  const logs = trace?.logs ?? [];
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
    setCompileError(null);
    setCompiling(true);
    try {
      await compileTrace(trace?.id ?? '', selectedProvider, selectedTone);
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
          <h2 className="text-lg font-medium text-[var(--cw-fg)] truncate">
            {trace?.title}
          </h2>
          <span className="text-xs text-[var(--cw-muted)] uppercase">
            {trace?.status}
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
          traceTitle={trace.title}
        />
      ) : (
        <LogFeed traceId={trace?.id ?? ''} initialLogs={logs} />
      )}
    </div>
  );
}
