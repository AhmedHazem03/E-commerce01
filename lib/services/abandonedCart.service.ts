// server-only
import prisma from "@/lib/prisma";
import { notify } from "@/lib/notifications";

/**
 * POST /api/cart/abandon handler.
 * FR-010: upserts by phone @unique so repeated calls are idempotent.
 * SC-002: cart snapshot stored as JSON.
 */
export async function upsertAbandonedCart(
  phone: string,
  items: unknown[]
): Promise<void> {
  await prisma.abandonedCart.upsert({
    where: { phone },
    create: {
      phone,
      items: items as object[],
      reminded: false,
    },
    update: {
      items: items as object[],
      reminded: false, // reset reminded so new snapshot gets a fresh notification
      updatedAt: new Date(),
    },
  });
}

/**
 * Vercel Cron handler (FR-011, SC-006).
 * Finds all AbandonedCart rows older than 1 hour with reminded = false.
 * For each: looks up Customer by phone → sends ABANDONED_CART notification → marks reminded = true.
 * EC cron guard: reminded = true rows are skipped (no duplicate notification).
 * Returns the number of carts processed.
 */
export async function processAbandonedCarts(): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const carts = await prisma.abandonedCart.findMany({
    where: {
      reminded: false,
      updatedAt: { lte: oneHourAgo },
    },
  });

  let processed = 0;

  for (const cart of carts) {
    // Look up customer by phone — only send notification if customer exists in DB
    const customer = await prisma.customer.findUnique({
      where: { phone: cart.phone },
      select: { id: true },
    });

    if (customer) {
      await notify.abandonedCart(customer.id, cart.phone);
    }

    // Mark reminded = true regardless of whether customer exists
    // so the cron does not re-process the same cart
    await prisma.abandonedCart.update({
      where: { id: cart.id },
      data: { reminded: true },
    });

    processed++;
  }

  return processed;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: list abandoned carts (latest 50)
// ─────────────────────────────────────────────────────────────────────────────

export interface AbandonedCartRow {
  id: number;
  phone: string;
  items: unknown;
  reminded: boolean;
  updatedAt: Date;
}

export async function getAbandonedCartsForAdmin(): Promise<AbandonedCartRow[]> {
  return prisma.abandonedCart.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
}
