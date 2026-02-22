import type { Article, Log } from '../lib/api';

function formatLogTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

interface CompiledReviewProps {
  logs: Log[];
  article: Article;
  traceTitle: string;
}

export function CompiledReview({ logs, article, traceTitle }: CompiledReviewProps) {
  function exportMarkdown() {
    const blob = new Blob([article.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${traceTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col border border-[var(--cw-border)] rounded-lg bg-[var(--cw-code-bg)] overflow-hidden">
      <div className="flex items-center justify-end gap-2 p-2 border-b border-[var(--cw-border)] flex-shrink-0">
        <span className="text-xs text-[var(--cw-muted)] mr-auto">
          Compiled with {article.aiProviderUsed}
        </span>
        <button
          type="button"
          onClick={exportMarkdown}
          className="px-3 py-1.5 rounded bg-[var(--cw-accent)] text-[var(--cw-bg)] text-sm hover:opacity-90"
        >
          Export Markdown
        </button>
      </div>
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left: read-only logs */}
        <div className="w-1/2 border-r border-[var(--cw-border)] overflow-y-auto p-3 font-mono text-sm flex-shrink-0">
          <div className="text-[var(--cw-muted)] text-xs uppercase mb-2">
            Raw logs (read-only)
          </div>
          <div className="space-y-3">
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
                <div className="flex items-center gap-2 text-[var(--cw-muted)] mb-1 text-xs">
                  <span className="uppercase">{log.type}</span>
                  {log.language && <span>{log.language}</span>}
                  <span>{formatLogTime(log.createdAt)}</span>
                  {log.isEdited && <span className="italic">(edited)</span>}
                </div>
                <pre className="whitespace-pre-wrap break-words text-[var(--cw-fg)] text-sm">
                  {log.content}
                </pre>
              </div>
            ))}
          </div>
        </div>
        {/* Right: generated article */}
        <div className="w-1/2 overflow-y-auto p-4 flex-1 min-w-0">
          <div className="text-[var(--cw-muted)] text-xs uppercase mb-2">
            Generated article
          </div>
          <article className="prose prose-invert prose-sm max-w-none text-[var(--cw-fg)]">
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{
                __html: renderMarkdownToHtml(article.content),
              }}
            />
          </article>
        </div>
      </div>
    </div>
  );
}

/** Minimal markdown to HTML for display (no dependency). */
function renderMarkdownToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inCode = false;
  let codeLang = '';
  let codeBuf: string[] = [];

  function flushCode() {
    if (codeBuf.length) {
      out.push(
        `<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeBuf.join('\n'))}</code></pre>`
      );
      codeBuf = [];
    }
    inCode = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimEnd();

    if (trimmed.startsWith('```')) {
      if (inCode) {
        flushCode();
      } else {
        codeLang = trimmed.slice(3).trim() || 'text';
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      out.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      out.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      out.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
      continue;
    }

    if (trimmed === '') {
      out.push('<br/>');
      continue;
    }

    const escaped = escapeHtml(trimmed).replace(
      /`([^`]*)`/g,
      '<code class="px-1 rounded bg-[var(--cw-code-bg)]">$1</code>'
    );
    out.push(`<p>${escaped}</p>`);
  }
  flushCode();
  return out.join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
