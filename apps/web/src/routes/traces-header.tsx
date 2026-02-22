import { useState, useRef, useEffect } from 'react';
import { useAuth } from '~/lib/auth-context';
import { Wordmark } from '~/components/Wordmark';

export function TracesHeader() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const ariaExpanded = open ? 'true' : 'false';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await logout();
    window.location.href = '/';
  }

  return (
    <header className="border-b border-[var(--cw-border)] px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Wordmark asLink />
        <nav className="text-sm text-[var(--cw-muted)]">/ traces</nav>
      </div>
      {user && (
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full p-0.5 border border-[var(--cw-border)] hover:border-[var(--cw-accent)] transition focus:outline-none focus:ring-2 focus:ring-[var(--cw-accent)]"
            aria-expanded={ariaExpanded}
            aria-haspopup="menu"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl ?? ''}
                alt=""
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-[var(--cw-accent)] text-[var(--cw-bg)] flex items-center justify-center text-sm font-medium">
                {user.name?.[0] ?? user.email[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </button>
          {open && (
            <div
              className="absolute right-0 top-full mt-1 py-1 min-w-[120px] rounded border border-[var(--cw-border)] bg-[var(--cw-bg)] shadow-lg z-10"
              role="menu"
            >
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-[var(--cw-fg)] hover:bg-[var(--cw-border)] transition"
                role="menuitem"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
