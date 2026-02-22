import { z } from "zod";
import { TRACE_STATUSES } from "../constants.js";

export const traceStatusSchema = z.enum(TRACE_STATUSES);

export const createTraceSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
});

export const updateTraceSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  status: traceStatusSchema.optional(),
});

export type CreateTraceInput = z.infer<typeof createTraceSchema>;
export type UpdateTraceInput = z.infer<typeof updateTraceSchema>;
