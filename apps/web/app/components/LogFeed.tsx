import { useRouter } from '@tanstack/react-router';
import { useCallback, useState, useRef, useEffect } from 'react';
import type { Log } from '../lib/api.js';
import { createLog } from '../lib/api.js';
import type { LogType } from '@context-window/shared';
import { LOG_TYPES } from '@context-window/shared';

const SLASH_COMMANDS = ['/text', '/code', '/error', '/insight'] as const;
const DEFAULT_LOG_TYPE: LogType = 'TEXT';

function parseSlashCommand(
  raw: string
): { type: LogType; content: string; language?: string } {
  const trimmed = raw.trimStart();
  const lower = trimmed.toLowerCase();
  for (const cmd of SLASH_COMMANDS) {
    if (lower === cmd || lower.startsWith(cmd + ' ')) {
      const type = cmd.slice(1).toUpperCase() as LogType;
      const rest = trimmed.slice(cmd.length).trimStart();
      const firstLine = rest.split('\n')[0] ?? '';
      const language =
        (type === 'CODE' || type === 'ERROR') && firstLine
          ? firstLine.split(/\s+/)[0]?.slice(0, 50)
          : undefined;
      const content =
        type === 'CODE' || type === 'ERROR'
          ? rest
              .split('\n')
              .slice(language ? 1 : 0)
              .join('\n')
              .trim() || rest
          : rest;
      return { type, content: content || '(empty)', language };
    }
  }
  return { type: DEFAULT_LOG_TYPE, content: trimmed || '(empty)' };
}

function formatLogTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

interface LogFeedProps {
  traceId: string;
  initialLogs: Log[];
}

export function LogFeed({ traceId, initialLogs }: LogFeedProps) {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [selectedType, setSelectedType] = useState<LogType>(DEFAULT_LOG_TYPE);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    (feedEndRef.current as HTMLElement | null)?.scrollIntoView({
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);

  const submit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const parsed = parseSlashCommand(input);
    const hasSlash = SLASH_COMMANDS.some((c) =>
      trimmed.toLowerCase().startsWith(c)
    );
    const type = hasSlash ? parsed.type : selectedType;
    const content = hasSlash ? (parsed.content === '(empty)' ? trimmed : parsed.content) : trimmed;
    const language = hasSlash ? parsed.language : undefined;
    setPending(true);
    try {
      const newLog = await createLog(traceId, {
        type,
        content,
        ...(language && { language }),
      });
      setLogs((prev) => [...prev, newLog]);
      setInput('');
      setSelectedType(DEFAULT_LOG_TYPE);
      textareaRef.current?.focus();
    } catch (e) {
      console.error(e);
    } finally {
      setPending(false);
    }
  }, [traceId, input]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        submit();
      }
    },
    [submit]
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 border border-[var(--cw-border)] rounded-lg bg-[var(--cw-code-bg)]">
      {/* Terminal-style feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-sm">
        {logs.length === 0 && (
          <div className="text-[var(--cw-muted)] py-4 text-center">
            No logs yet. Type below and use Cmd+Enter to add. Try /code, /error, or /text.
          </div>
        )}
        {logs.map((log) => (
          <div
            key={log.id}
            className={`border-l-2 pl-3 py-1 ${
              log.type === 'ERROR'
                ? 'border-[var(--cw-error)]'
                : log.type === 'CODE'
                  ? 'border-[var(--cw-accent)]'
                  : log.type === 'INSIGHT'
                    ? 'border-[var(--cw-success)]'
                    : 'border-[var(--cw-border)]'
            }`}
          >
            <div className="flex items-center gap-2 text-[var(--cw-muted)] mb-1">
              <span className="uppercase text-xs">{log.type}</span>
              {log.language && (
                <span className="text-xs">{log.language}</span>
              )}
              <span className="text-xs">{formatLogTime(log.createdAt)}</span>
              {log.isEdited && (
                <span className="text-xs italic">(edited)</span>
              )}
            </div>
            <pre className="whitespace-pre-wrap break-words text-[var(--cw-fg)] font-mono text-sm">
              {log.content}
            </pre>
          </div>
        ))}
        <div ref={feedEndRef} />
      </div>

      {/* Bottom input */}
      <div className="border-t border-[var(--cw-border)] p-2">
        <div className="flex items-center gap-2 mb-1">
          {LOG_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`px-2 py-0.5 rounded text-xs uppercase ${
                selectedType === t
                  ? 'bg-[var(--cw-accent)] text-[var(--cw-bg)]'
                  : 'text-[var(--cw-muted)] hover:text-[var(--cw-fg)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            const v = e.currentTarget.value.trimStart();
            if (v.startsWith('/')) {
              const match = SLASH_COMMANDS.find((c) =>
                v.toLowerCase().startsWith(c)
              );
              if (match) setSelectedType(match.slice(1).toUpperCase() as LogType);
            }
          }}
          placeholder="/text note, /code [lang] snippet, /error paste..."
          className="w-full min-h-[80px] p-3 rounded bg-[var(--cw-bg)] border border-[var(--cw-border)] text-[var(--cw-fg)] placeholder-[var(--cw-muted)] resize-y focus:outline-none focus:ring-1 focus:ring-[var(--cw-accent)] font-mono text-sm"
          disabled={pending}
        />
        <div className="flex justify-end mt-1 text-xs text-[var(--cw-muted)]">
          Cmd+Enter to append
        </div>
      </div>
    </div>
  );
}
