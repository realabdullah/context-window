import { z } from "zod";
import { LOG_TYPES } from "../constants.js";

export const logTypeSchema = z.enum(LOG_TYPES);

export const createLogSchema = z.object({
  traceId: z.string().min(1, "Trace ID is required"),
  type: logTypeSchema,
  content: z.string().min(1, "Content is required"),
  language: z.string().max(50).optional(),
});

export const updateLogSchema = z.object({
  content: z.string().min(1, "Content is required"),
  language: z.string().max(50).optional().nullable(),
});

export type CreateLogInput = z.infer<typeof createLogSchema>;
export type UpdateLogInput = z.infer<typeof updateLogSchema>;
