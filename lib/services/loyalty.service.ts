// server-only
import prisma from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// T062: Loyalty service — earn & redeem points, balance queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Award points to a loyalty account. Creates a LoyaltyTransaction with
 * optional orderId FK and increments LoyaltyAccount.points atomically.
 */
export async function earnPoints(
  accountId: number,
  points: number,
  orderId?: number,
  reason?: string
): Promise<void> {
  await prisma.$transaction([
    prisma.loyaltyTransaction.create({
      data: {
        accountId,
        points,
        reason: reason ?? (orderId ? `نقاط مكتسبة من الطلب` : "نقاط مكافأة"),
        orderId: orderId ?? null,
      },
    }),
    prisma.loyaltyAccount.update({
      where: { id: accountId },
      data: { points: { increment: points } },
    }),
  ]);
}

/**
 * Redeem points from a loyalty account. Validates balance ≥ points,
 * creates a negative LoyaltyTransaction, and decrements LoyaltyAccount.points.
 * Throws 422 if insufficient balance.
 */
export async function redeemPoints(
  accountId: number,
  points: number,
  orderId?: number,
  reason?: string
): Promise<void> {
  const account = await prisma.loyaltyAccount.findUniqueOrThrow({
    where: { id: accountId },
    select: { points: true },
  });

  if (account.points < points) {
    throw Object.assign(new Error("رصيد النقاط غير كافي"), { statusCode: 422 });
  }

  await prisma.$transaction([
    prisma.loyaltyTransaction.create({
      data: {
        accountId,
        points: -points,
        reason: reason ?? (orderId ? `استبدال نقاط في الطلب` : "استبدال نقاط"),
        orderId: orderId ?? null,
      },
    }),
    prisma.loyaltyAccount.update({
      where: { id: accountId },
      data: { points: { decrement: points } },
    }),
  ]);
}

/**
 * Get current loyalty balance for a customer.
 * Returns 0 if no loyalty account exists.
 */
export async function getBalance(customerId: number): Promise<number> {
  const account = await prisma.loyaltyAccount.findUnique({
    where: { customerId },
    select: { points: true },
  });
  return account?.points ?? 0;
}
