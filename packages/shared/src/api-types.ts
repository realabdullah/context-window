/**
 * API response types. Shapes match NestJS/Prisma (camelCase).
 * Used by web and nextjs-web API clients.
 */

import type { LogType } from "./constants.js";
import type { User } from "./auth.js";

export interface Trace {
  id: string;
  userId: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  logs?: Log[];
  article?: Article | null;
  _count?: { logs: number };
}

export interface Log {
  id: string;
  traceId: string;
  type: LogType;
  content: string;
  language: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  traceId: string;
  content: string;
  toneUsed: string | null;
  aiProviderUsed: string;
  createdAt: string;
  updatedAt: string;
}

/** Response of POST /traces/:id/compile */
export interface CompileResponse {
  trace: Trace;
  article: Article | null;
}

/** Auth context state (any frontend using session) */
export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/** Response shape when exchanging OAuth code for session (if API returns JSON) */
export interface LoginResponse {
  user: User;
  session_token: string;
}
