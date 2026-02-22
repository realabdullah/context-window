import { useCallback, useState, useRef, useEffect } from 'react';
import type { Log } from '~/lib/api';
import { createLog, updateLog, deleteLog } from '~/lib/api';
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
  /** Called when a new log is created so parent can update (e.g. Compile button). */
  onLogAdded?: (log: Log) => void;
  /** Called when a log is updated (e.g. after edit). */
  onLogUpdated?: (log: Log) => void;
  /** Called when a log is deleted. */
  onLogDeleted?: (logId: string) => void;
}

export function LogFeed({ traceId, initialLogs, onLogAdded, onLogUpdated, onLogDeleted }: LogFeedProps) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [selectedType, setSelectedType] = useState<LogType>(DEFAULT_LOG_TYPE);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [savingLogId, setSavingLogId] = useState<string | null>(null);
  const [slashChoiceIndex, setSlashChoiceIndex] = useState(0);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const showSlashPopover = input.trimStart().startsWith('/');
  const slashQuery = showSlashPopover
    ? input.trimStart().slice(1).split(/\s/)[0]?.toLowerCase() ?? ''
    : '';
  const slashOptions = LOG_TYPES.filter((t) =>
    t.toLowerCase().startsWith(slashQuery)
  );
  const selectedSlashOption = slashOptions[Math.min(slashChoiceIndex, slashOptions.length - 1)] ?? slashOptions[0];

  const scrollToBottom = useCallback(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  useEffect(() => {
    if (showSlashPopover) setSlashChoiceIndex(0);
  }, [slashQuery]);

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
      onLogAdded?.(newLog);
      setInput('');
      setSelectedType(DEFAULT_LOG_TYPE);
      textareaRef.current?.focus();
    } catch (e) {
      console.error(e);
    } finally {
      setPending(false);
    }
  }, [traceId, input, onLogAdded]);

  const applySlashChoice = useCallback((type: LogType) => {
    setInput((prev) => {
      const trimmed = prev.trimStart();
      const match = trimmed.match(/^\s*\/[a-z]*/i);
      const toRemove = match ? match[0].length : 0;
      const rest = (prev.slice(0, prev.length - trimmed.length) + trimmed.slice(toRemove)).trimStart();
      return rest;
    });
    setSelectedType(type);
    setSlashChoiceIndex(0);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showSlashPopover && slashOptions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSlashChoiceIndex((i) => Math.min(i + 1, slashOptions.length - 1));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSlashChoiceIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === 'Enter' && selectedSlashOption) {
          e.preventDefault();
          applySlashChoice(selectedSlashOption);
          return;
        }
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        submit();
      }
    },
    [submit, showSlashPopover, slashOptions.length, selectedSlashOption, applySlashChoice]
  );

  function startEdit(log: Log) {
    setEditingLogId(log.id);
    setEditingContent(log.content);
    setTimeout(() => editTextareaRef.current?.focus(), 0);
  }

  function cancelEdit() {
    setEditingLogId(null);
    setEditingContent('');
  }

  async function saveEdit(logId: string) {
    const content = editingContent.trim();
    const log = logs.find((l) => l.id === logId);
    if (!log || !content || content === log.content) {
      cancelEdit();
      return;
    }
    setSavingLogId(logId);
    try {
      const updated = await updateLog(logId, { content, language: log.language ?? undefined });
      setLogs((prev) => prev.map((l) => (l.id === logId ? updated : l)));
      onLogUpdated?.(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingLogId(null);
      cancelEdit();
    }
  }

  async function handleDelete(log: Log) {
    if (!confirm('Delete this log?')) return;
    try {
      await deleteLog(log.id);
      setLogs((prev) => prev.filter((l) => l.id !== log.id));
      onLogDeleted?.(log.id);
    } catch (e) {
      console.error(e);
    }
  }

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
            className={`group border-l-2 pl-3 py-1 rounded-r ${
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
              <span className={`ml-auto flex items-center gap-1 transition ${editingLogId === log.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {editingLogId === log.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => saveEdit(log.id)}
                      disabled={savingLogId === log.id}
                      className="px-2 py-0.5 rounded text-xs bg-[var(--cw-accent)] text-[var(--cw-bg)] hover:opacity-90 disabled:opacity-50"
                    >
                      {savingLogId === log.id ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-2 py-0.5 rounded text-xs border border-[var(--cw-border)] text-[var(--cw-fg)] hover:bg-[var(--cw-border)]"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(log)}
                      className="px-2 py-0.5 rounded text-xs border border-[var(--cw-border)] text-[var(--cw-fg)] hover:bg-[var(--cw-border)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(log)}
                      className="px-2 py-0.5 rounded text-xs border border-[var(--cw-error)] text-[var(--cw-error)] hover:bg-[var(--cw-error)] hover:text-[var(--cw-bg)]"
                    >
                      Delete
                    </button>
                  </>
                )}
              </span>
            </div>
            {editingLogId === log.id ? (
              <textarea
                ref={editTextareaRef}
                aria-label="Edit log content"
                title="Edit log content"
                placeholder="Log content"
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') cancelEdit();
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    saveEdit(log.id);
                  }
                }}
                disabled={savingLogId === log.id}
                className="w-full min-h-[80px] p-2 rounded bg-[var(--cw-bg)] border border-[var(--cw-border)] text-[var(--cw-fg)] font-mono text-sm resize-y focus:outline-none focus:ring-1 focus:ring-[var(--cw-accent)]"
              />
            ) : (
              <pre className="whitespace-pre-wrap break-words text-[var(--cw-fg)] font-mono text-sm">
                {log.content}
              </pre>
            )}
          </div>
        ))}
        <div ref={feedEndRef} />
      </div>

      {/* Bottom input */}
      <div className="border-t border-[var(--cw-border)] p-2 relative">
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
        {showSlashPopover && slashOptions.length > 0 && (
          <div
            className="absolute left-2 right-2 bottom-full mb-1 py-1 rounded border border-[var(--cw-border)] bg-[var(--cw-bg)] shadow-lg z-10"
            role="listbox"
            aria-label="Log type"
          >
            {slashOptions.map((t, i) => (
              <button
                key={t}
                type="button"
                role="option"
                aria-selected={selectedSlashOption === t ? 'true' : 'false'}
                onClick={() => applySlashChoice(t)}
                className={`w-full text-left px-3 py-1.5 text-xs uppercase transition ${
                  selectedSlashOption === t
                    ? 'bg-[var(--cw-accent)] text-[var(--cw-bg)]'
                    : 'text-[var(--cw-fg)] hover:bg-[var(--cw-border)]'
                }`}
              >
                /{t.toLowerCase()}
              </button>
            ))}
          </div>
        )}
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
