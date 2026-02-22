/**
 * Shared constants aligned with Prisma enums.
 * Use these for validation and type-safe literals across API and Web.
 */

export const TRACE_STATUSES = ["ACTIVE", "COMPILED", "ARCHIVED"] as const;
export type TraceStatus = (typeof TRACE_STATUSES)[number];

export const LOG_TYPES = ["TEXT", "CODE", "ERROR", "INSIGHT"] as const;
export type LogType = (typeof LOG_TYPES)[number];
