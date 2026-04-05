import { z } from "zod";

/**
 * Egyptian mobile numbers: 01x format, exactly 11 digits.
 * Valid prefixes: 010, 011, 012, 015.
 */
export const phoneSchema = z
  .string()
  .regex(/^01[0125]\d{8}$/, "رقم الهاتف يجب أن يكون رقم مصري صحيح (11 رقم)");

/**
 * Positive integer (id fields, quantities, etc.)
 */
export const positiveIntSchema = z.number().int().positive();

/**
 * Standard pagination query params with safe defaults.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
