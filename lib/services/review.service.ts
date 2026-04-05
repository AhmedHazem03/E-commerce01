// server-only
import prisma from "@/lib/prisma";
import { earnPoints, getBalance } from "@/lib/services/loyalty.service";
import { notify } from "@/lib/notifications";
import type { CreateReviewInput } from "@/lib/validations/product";

// ─────────────────────────────────────────────────────────────────────────────
// T063: Review service — verified-purchase gate, @@unique guard, +20 bonus
// ─────────────────────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: number;
  rating: number;
  comment: string | null;
  customerName: string;
  createdAt: Date;
}

/**
 * Get reviews for a product ordered by date desc.
 */
export async function getReviews(productId: number): Promise<ReviewItem[]> {
  const raw = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      customer: { select: { name: true } },
    },
  });

  return raw.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    customerName: r.customer.name,
    createdAt: r.createdAt,
  }));
}

/**
 * Create a review with verified-purchase gate.
 * - Customer must have a DELIVERED order containing the product.
 * - @@unique([customerId, productId]) prevents duplicates (caught via Prisma error).
 * - Awards +20 loyalty points via loyalty.earnPoints.
 * - Sends REVIEW_REQUEST notification (bonus confirmation copy).
 */
export async function createReview(
  customerId: number,
  productId: number,
  data: CreateReviewInput
): Promise<{ id: number; rating: number }> {
  // Verified-purchase gate: customer must have a DELIVERED order with this product
  const deliveredOrder = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        customerId,
        status: "DELIVERED",
      },
    },
    select: { id: true },
  });

  if (!deliveredOrder) {
    throw Object.assign(
      new Error("يجب أن يكون لديك طلب مُسلّم لهذا المنتج لتتمكن من التقييم"),
      { statusCode: 403 }
    );
  }

  // Create review — @@unique([customerId, productId]) enforced by DB
  let review;
  try {
    review = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment ?? null,
        customerId,
        productId,
      },
      select: { id: true, rating: true },
    });
  } catch (err: unknown) {
    // Prisma P2002 = unique constraint violation
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      throw Object.assign(new Error("لقد قمت بتقييم هذا المنتج مسبقاً"), {
        statusCode: 409,
      });
    }
    throw err;
  }

  // Award +20 loyalty points
  const loyaltyAccount = await prisma.loyaltyAccount.findUnique({
    where: { customerId },
    select: { id: true },
  });

  if (loyaltyAccount) {
    await earnPoints(loyaltyAccount.id, 20, undefined, "مراجعة منتج");

    // Get product name for notification
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true },
    });

    // B4: review bonus notification (copy: "شاركنا رأيك ⭐")
    await notify.reviewBonus(customerId, product?.name ?? "منتج", productId);

    // B4: updated points balance notification
    const newBalance = await getBalance(customerId);
    await notify.loyaltyPoints(customerId, 20, newBalance);
  }

  return review;
}
