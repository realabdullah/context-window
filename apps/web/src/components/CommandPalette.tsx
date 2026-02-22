import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '~/lib/auth-context';
import { fetchTraces, createTrace } from '~/lib/api';
import type { Trace } from '~/lib/api';

type Action = { type: 'create' } | { type: 'trace'; trace: Trace };

export function CommandPalette() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loadingTraces, setLoadingTraces] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchTracesList = useCallback(async () => {
    setLoadingTraces(true);
    try {
      const list = await fetchTraces();
      setTraces(list);
    } catch {
      setTraces([]);
    } finally {
      setLoadingTraces(false);
    }
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open && user) {
      setQuery('');
      setSelectedIndex(0);
      fetchTracesList();
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, user, fetchTracesList]);

  const q = query.trim().toLowerCase();
  const createAction: Action = { type: 'create' };
  const filteredTraces = q
    ? traces.filter((t) => t.title.toLowerCase().includes(q))
    : traces;
  const items: Action[] = [createAction, ...filteredTraces.map((trace) => ({ type: 'trace' as const, trace }))];
  const selected = items[Math.min(selectedIndex, items.length - 1)];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!selected) return;
    const el = listRef.current?.querySelector(`[data-index="${items.indexOf(selected)}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, selected, items]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter' && selected) {
      e.preventDefault();
      handleSelect(selected);
    }
  }

  async function handleSelect(action: Action) {
    if (action.type === 'create') {
      setCreating(true);
      try {
        const trace = await createTrace('Untitled trace');
        setOpen(false);
        navigate({ to: '/traces/$traceId', params: { traceId: trace.id } });
      } catch (e) {
        console.error(e);
      } finally {
        setCreating(false);
      }
      return;
    }
    setOpen(false);
    navigate({ to: '/traces/$traceId', params: { traceId: action.trace.id } });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-lg border border-[var(--cw-border)] bg-[var(--cw-code-bg)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[var(--cw-border)] px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search traces or create new…"
            aria-label="Search traces"
            title="Search traces"
            className="w-full bg-transparent text-[var(--cw-fg)] placeholder-[var(--cw-muted)] focus:outline-none font-mono text-sm"
          />
        </div>
        <div
          ref={listRef}
          className="max-h-[50vh] overflow-y-auto py-1"
          role="listbox"
        >
          {!user ? (
            <div className="px-3 py-4 text-sm text-[var(--cw-muted)] text-center">
              {loading ? 'Loading…' : 'Log in to search or create traces.'}
            </div>
          ) : loadingTraces ? (
            <div className="px-3 py-4 text-sm text-[var(--cw-muted)] text-center">
              Loading traces…
            </div>
          ) : (
            items.map((action, index) => {
              const isSelected = selected === action;
              if (action.type === 'create') {
                return (
                  <button
                    key="create"
                    type="button"
                    data-index={index}
                    role="option"
                    aria-selected={isSelected ? 'true' : 'false'}
                    onClick={() => handleSelect(action)}
                    disabled={creating}
                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition ${
                      isSelected ? 'bg-[var(--cw-accent)] text-[var(--cw-bg)]' : 'text-[var(--cw-fg)] hover:bg-[var(--cw-border)]'
                    }`}
                  >
                    <span className="text-[var(--cw-muted)]">+</span>
                    Create new trace
                  </button>
                );
              }
              return (
                <button
                  key={action.trace.id}
                  type="button"
                  data-index={index}
                  role="option"
                  aria-selected={isSelected ? 'true' : 'false'}
                  onClick={() => handleSelect(action)}
                  className={`w-full text-left px-3 py-2.5 text-sm flex flex-col gap-0.5 transition ${
                    isSelected ? 'bg-[var(--cw-accent)] text-[var(--cw-bg)]' : 'text-[var(--cw-fg)] hover:bg-[var(--cw-border)]'
                  }`}
                >
                  <span className="font-medium truncate">{action.trace.title}</span>
                  <span className={`text-xs truncate ${isSelected ? 'opacity-90' : 'text-[var(--cw-muted)]'}`}>
                    {action.trace.status} · {(action.trace._count?.logs ?? 0)} logs
                  </span>
                </button>
              );
            })
          )}
        </div>
        <div className="border-t border-[var(--cw-border)] px-3 py-1.5 text-xs text-[var(--cw-muted)]">
          ↑↓ navigate · Enter select · Esc close
        </div>
      </div>
    </div>
  );
}
