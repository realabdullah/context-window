/**
 * Shared auth/user types for API and frontend.
 * Aligned with Prisma User model and session-backed auth.
 */

import { z } from "zod";

/** User as returned by /api/auth/me and used in AuthContext */
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  githubId: z.string().nullable(),
  name: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;
