// Type declarations for TanStack Start entry modules (resolved at build time)
declare module '@tanstack/start/server' {
  export const defaultRenderHandler: unknown;
}

declare module '@tanstack/start/client' {
  import type { ComponentType } from 'react';
  export const StartClient: ComponentType;
}
