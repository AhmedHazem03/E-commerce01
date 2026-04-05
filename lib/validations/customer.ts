import { z } from "zod";
import { phoneSchema } from "./common";

/**
 * Used by POST /api/customers (CheckoutStep1).
 * cartSubtotal is optional: if present, the route returns a pointsToEarn estimate
 * for the "أتمم طلبك واكسب X نقطة" display at Step 1.
 * customerId is NEVER accepted in the body — it is always set from the
 * customer_session cookie to prevent IDOR.
 */
export const UpsertCustomerSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(1, "الاسم مطلوب").optional(),
  address: z.string().optional(),
  cartSubtotal: z.number().nonnegative().optional(),
});

export type UpsertCustomerInput = z.infer<typeof UpsertCustomerSchema>;
