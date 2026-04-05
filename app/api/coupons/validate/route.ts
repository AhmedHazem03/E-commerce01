import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/services/coupon.service";
import { z } from "zod";

const ValidateCouponSchema = z.object({
  code: z.string().min(1, "كود الخصم مطلوب"),
  subtotal: z.number().positive("المبلغ غير صالح"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ValidateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 }
    );
  }

  try {
    const result = await validateCoupon(parsed.data.code, parsed.data.subtotal);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const statusCode =
      typeof err === "object" && err !== null && "statusCode" in err
        ? (err as { statusCode: number }).statusCode
        : 500;
    const message =
      err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
