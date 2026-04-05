// server-only
import prisma from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// T064: Coupon service — validate coupon code against subtotal
// ─────────────────────────────────────────────────────────────────────────────

export interface CouponValidationResult {
  discount: number;
  couponId: number;
}

/**
 * Validate a coupon code against a given subtotal.
 * Checks: code exists, isActive, not expired, minOrder met, maxUses not exceeded.
 * Returns discount amount and couponId, or throws 422 on any failure.
 */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code },
    select: {
      id: true,
      type: true,
      value: true,
      minOrder: true,
      maxUses: true,
      usedCount: true,
      expiresAt: true,
      isActive: true,
    },
  });

  if (!coupon || !coupon.isActive) {
    throw Object.assign(new Error("كود الخصم غير صالح"), { statusCode: 422 });
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw Object.assign(new Error("كود الخصم منتهي الصلاحية"), { statusCode: 422 });
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw Object.assign(new Error("كود الخصم وصل للحد الأقصى من الاستخدام"), {
      statusCode: 422,
    });
  }

  if (subtotal < coupon.minOrder) {
    throw Object.assign(
      new Error(`الحد الأدنى للطلب ${coupon.minOrder} ج.م لاستخدام هذا الكود`),
      { statusCode: 422 }
    );
  }

  let discount: number;
  if (coupon.type === "PERCENTAGE") {
    discount = Math.round((subtotal * coupon.value) / 100);
  } else {
    // FIXED
    discount = coupon.value;
  }

  // Discount can't exceed subtotal
  discount = Math.min(discount, subtotal);

  return { discount, couponId: coupon.id };
}
