// server-only
import prisma from "@/lib/prisma";
import type { UpsertCustomerInput } from "@/lib/validations/customer";

// ─────────────────────────────────────────────────────────────────────────────
// Return type
// ─────────────────────────────────────────────────────────────────────────────

export interface UpsertCustomerResult {
  customer: {
    id: number;
    name: string;
    phone: string;
    createdAt: Date;
  };
  addressId: number;
  currentPoints: number;
  /** Estimated earn = Math.floor(cartSubtotal / 10). Used for Step 1 preview. */
  pointsToEarn: number;
  isNew: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/customers handler.
 * FR-007: Upserts Customer by phone in a single transaction.
 *   - On create: also creates LoyaltyAccount(points=0).
 *   - On update: updates name if provided.
 * Returns { customer, currentPoints, pointsToEarn, isNew }.
 *
 * pointsToEarn is estimated from cartSubtotal (not the DB total) so Step 1
 * can display "أتمم طلبك واكسب X نقطة!" before the user reaches Step 2.
 * SC-003: the authoritative pointsToEarn comes from POST /api/orders/preview.
 */
export async function upsertCustomer(
  data: UpsertCustomerInput
): Promise<UpsertCustomerResult> {
  const { phone, name, cartSubtotal } = data;

  let isNew = false;

  const result = await prisma.$transaction(async (tx) => {
    // Check if customer already exists
    const existing = await tx.customer.findUnique({
      where: { phone },
      include: { loyaltyAccount: true },
    });

    if (existing) {
      // Update name if provided
      const updated =
        name && name !== existing.name
          ? await tx.customer.update({
              where: { id: existing.id },
              data: { name },
            })
          : existing;

      // Find or create the default address for this customer
      let addressRecord = await tx.address.findFirst({
        where: { customerId: existing.id, isDefault: true },
        select: { id: true },
      });
      if (addressRecord) {
        if (data.address) {
          await tx.address.update({
            where: { id: addressRecord.id },
            data: { street: data.address },
          });
        }
      } else {
        addressRecord = await tx.address.create({
          data: {
            customerId: existing.id,
            label: "الإيصال",
            city: "-",
            area: "-",
            street: data.address ?? "-",
            isDefault: true,
          },
        });
      }

      return {
        customer: {
          id: updated.id,
          name: updated.name,
          phone: updated.phone,
          createdAt: updated.createdAt,
        },
        loyaltyAccount: existing.loyaltyAccount,
        addressId: addressRecord.id,
      };
    }

    // New customer — create with LoyaltyAccount in same transaction
    isNew = true;

    const created = await tx.customer.create({
      data: {
        phone,
        name: name ?? phone, // fallback to phone if name not provided yet
        loyaltyAccount: {
          create: { points: 0 },
        },
      },
      include: { loyaltyAccount: true },
    });

    const newAddress = await tx.address.create({
      data: {
        customerId: created.id,
        label: "الإيصال",
        city: "-",
        area: "-",
        street: data.address ?? "-",
        isDefault: true,
      },
    });

    return {
      customer: {
        id: created.id,
        name: created.name,
        phone: created.phone,
        createdAt: created.createdAt,
      },
      loyaltyAccount: created.loyaltyAccount,
      addressId: newAddress.id,
    };
  });

  const currentPoints = result.loyaltyAccount?.points ?? 0;
  const pointsToEarn =
    cartSubtotal !== undefined ? Math.floor(cartSubtotal / 10) : 0;

  return {
    customer: result.customer,
    addressId: result.addressId,
    currentPoints,
    pointsToEarn,
    isNew,
  };
}
