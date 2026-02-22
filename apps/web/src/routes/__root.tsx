import type { ReactNode } from 'react';
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { AuthProvider } from '~/lib/auth-context';
import { CommandPalette } from '~/components/CommandPalette';
import appCssUrl from '../app.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Context Window' },
    ],
    links: [
      { rel: 'stylesheet', href: appCssUrl },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AuthProvider>
        <Outlet />
        <CommandPalette />
      </AuthProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[var(--cw-bg)] text-[var(--cw-fg)] font-mono antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
