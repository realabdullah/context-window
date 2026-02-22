'use client'

import type { LogType } from '@context-window/shared';
import type {
  User,
  Trace,
  Log,
  CompileResponse,
  LoginResponse,
} from './types';

/** API runs on port 3001 by default; set NEXT_PUBLIC_API_URL when different. */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } catch (err) {
      const message =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? `Cannot reach the API at ${this.baseURL}. Is the API server running? (e.g. \`pnpm dev\` in apps/api or from repo root)`
          : err instanceof Error
            ? err.message
            : 'Network request failed';
      throw new Error(message);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        (error as { message?: string }).message ||
          `API error: ${response.status}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  }

  async getGitHubAuthUrl(): Promise<{ url: string }> {
    return this.request('/auth/github', { method: 'GET' });
  }

  async exchangeGitHubCode(code: string): Promise<LoginResponse> {
    return this.request('/auth/github/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/auth/me', { method: 'GET' });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  async getTraces(status?: 'ACTIVE' | 'COMPILED' | 'ARCHIVED'): Promise<Trace[]> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/traces${query}`, { method: 'GET' });
  }

  async getTrace(id: string): Promise<Trace> {
    return this.request(`/traces/${id}`, { method: 'GET' });
  }

  async createTrace(title: string): Promise<Trace> {
    return this.request('/traces', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async updateTrace(id: string, title: string): Promise<Trace> {
    return this.request(`/traces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  }

  async deleteTrace(id: string): Promise<void> {
    await this.request(`/traces/${id}`, { method: 'DELETE' });
  }

  async createLog(
    traceId: string,
    type: LogType,
    content: string,
    language?: string
  ): Promise<Log> {
    return this.request(`/traces/${traceId}/logs`, {
      method: 'POST',
      body: JSON.stringify({ traceId, type, content, ...(language && { language }) }),
    });
  }

  /** API: PATCH /logs/:id */
  async updateLog(logId: string, payload: { content: string; language?: string | null }): Promise<Log> {
    return this.request(`/logs/${logId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  /** API: DELETE /logs/:id */
  async deleteLog(logId: string): Promise<void> {
    await this.request(`/logs/${logId}`, { method: 'DELETE' });
  }

  /** API returns { trace, article }. */
  async compileTrace(
    traceId: string,
    provider: string,
    tone: string
  ): Promise<CompileResponse> {
    return this.request(`/traces/${traceId}/compile`, {
      method: 'POST',
      body: JSON.stringify({ provider, tone }),
    });
  }
}

export const apiClient = new APIClient();
