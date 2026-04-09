// lib/validations/auth.ts — Zod schemas for admin authentication & store settings.
import { z } from "zod";
import { phoneSchema } from "./common";

/** POST /api/auth/login */
export const LoginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

/** PATCH /api/auth/admin — credentials only (phone + password) */
export const UpdateAdminSchema = z.object({
  phone: phoneSchema.optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").optional(),
});

const LandingPageConfigSchema = z.object({
  announcementBar: z.object({ enabled: z.boolean(), text: z.string().max(300) }),
  marquee: z.object({ enabled: z.boolean(), items: z.array(z.string().max(200)).max(20) }),
  flashSale: z.object({ enabled: z.boolean(), title: z.string().max(200), endsAt: z.string() }),
  brandStory: z.object({
    enabled: z.boolean(),
    headline: z.string().max(200),
    body: z.string().max(2000),
    image: z.string(),
  }),
  newArrivals: z.object({ enabled: z.boolean(), title: z.string().max(200), limit: z.number().min(1).max(20) }),
  offersSection: z.object({ enabled: z.boolean(), title: z.string().max(200), limit: z.number().min(1).max(20) }),
});

/** PATCH /api/settings — store meta (all optional, nullable to clear) */
export const UpdateStoreSettingsSchema = z.object({
  storeName: z.string().min(1).max(100).optional(),
  logo: z.string().url("رابط غير صحيح").nullable().optional(),
  whatsappNumber: z
    .string()
    .regex(/^\d{10,15}$/, "رقم واتساب يجب أن يكون بين 10 و 15 رقم")
    .nullable()
    .optional(),
  instagram: z.string().url("رابط غير صحيح").nullable().optional(),
  facebook: z.string().url("رابط غير صحيح").nullable().optional(),
  tiktok: z.string().url("رابط غير صحيح").nullable().optional(),
  returnPolicy: z.string().max(10000).nullable().optional(),
  landingPage: LandingPageConfigSchema.optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateAdminInput = z.infer<typeof UpdateAdminSchema>;
export type UpdateStoreSettingsInput = z.infer<typeof UpdateStoreSettingsSchema>;
