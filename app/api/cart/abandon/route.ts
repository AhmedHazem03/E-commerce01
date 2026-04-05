import { NextRequest, NextResponse } from "next/server";
import { upsertAbandonedCart } from "@/lib/services/abandonedCart.service";
import { z } from "zod";
import { phoneSchema } from "@/lib/validations/common";

const CartItemSchema = z.object({
  productId: z.number().int().positive(),
  variantOptionId: z.number().int().positive().optional(),
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  quantity: z.number().int().min(1),
  variant: z.string().max(200).optional(),
});

const AbandonSchema = z.object({
  phone: phoneSchema,
  items: z.array(CartItemSchema).min(1).max(50),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON غير صحيح" },
      { status: 400 }
    );
  }
  const parsed = AbandonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "بيانات غير صحيحة" },
      { status: 422 }
    );
  }

  try {
    await upsertAbandonedCart(parsed.data.phone, parsed.data.items);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ السلة" },
      { status: 500 }
    );
  }
}
