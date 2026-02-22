import { Link } from '@tanstack/react-router'
import logoSrc from '~/assets/logo.svg'

interface WordmarkProps {
  className?: string;
  /** Wrap in a link to home when set (e.g. in headers). */
  asLink?: boolean;
}

export function Wordmark({ className = '', asLink = false }: WordmarkProps) {
  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoSrc}
        alt=""
        className="size-7 shrink-0"
        width={28}
        height={28}
      />
      <span className="font-semibold tracking-tight text-[var(--cw-fg)]">
        context<span className="text-[var(--cw-muted)]">window</span>
      </span>
    </div>
  );

  if (asLink) {
    return (
      <Link
        to="/"
        className="text-[var(--cw-muted)] hover:text-[var(--cw-fg)] transition flex items-center gap-2"
      >
        {content}
      </Link>
    );
  }

  return content;
}
