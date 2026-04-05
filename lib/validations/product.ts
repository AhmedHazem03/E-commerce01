// lib/validations/product.ts — Zod schemas for product CRUD.
// C2 fix: CreateProductSchema must exist before T059b uses it in POST /api/products.
import { z } from "zod";

/** POST /api/products (admin-only) */
export const CreateProductSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  description: z.string().optional(),
  price: z.number().positive("السعر يجب أن يكون أكبر من الصفر"),
  oldPrice: z.number().positive().optional(),
  stock: z.number().int().min(0, "المخزون يجب أن يكون 0 أو أكثر"),
  category: z.string().min(1, "الفئة مطلوبة"),
  images: z.array(
    z.object({
      url: z.string().url("رابط الصورة غير صحيح"),
      isMain: z.boolean(),
    })
  ),
  // Variants: no `price` field inside options — VariantOption has no price column.
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        options: z.array(
          z.object({
            value: z.string().min(1),
            stock: z.number().int().min(0),
          })
        ),
      })
    )
    .optional(),
});

/** Review schema — used in T061/T063/T066/T068 */
export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
