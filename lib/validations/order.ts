import { z } from "zod";
import { positiveIntSchema } from "./common";

const orderItemSchema = z.object({
  productId: positiveIntSchema,
  variantOptionId: z.number().int().positive().optional(),
  quantity: z.number().int().min(1),
});

/**
 * POST /api/orders/preview request body.
 * customerId is extracted from the customer_session HttpOnly cookie server-side —
 * it must NEVER be in the request body (IDOR vulnerability, contracts H4 fix).
 */
export const PreviewOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "السلة فارغة"),
  couponCode: z.string().optional(),
  redeemPoints: z.number().int().min(0).optional(),
});

/**
 * POST /api/orders request body.
 * Extends PreviewOrderSchema with address, payment, and tracking source.
 * customerId is extracted from the customer_session HttpOnly cookie server-side.
 */
export const CreateOrderSchema = PreviewOrderSchema.extend({
  addressId: positiveIntSchema,
  paymentMethod: z.enum(["CASH", "VODAFONE_CASH", "INSTAPAY", "CARD"]),
  source: z
    .enum(["INSTAGRAM", "WHATSAPP", "GOOGLE", "DIRECT", "FACEBOOK", "TIKTOK"])
    .optional(),
});

export type PreviewOrderInput = z.infer<typeof PreviewOrderSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
