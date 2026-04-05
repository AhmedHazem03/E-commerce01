// server-only
// Pure error-type module — GATE-6: no Prisma imports here.
// The DB lookup lives in order.service.ts (the only file permitted to use Prisma for orders).

/**
 * Thrown when the delivery zone is not found or is inactive.
 * Maps to HTTP 404. Edge Case 3 (EC-3) fix.
 */
export class DeliveryZoneError extends Error {
  readonly statusCode = 404;
  constructor(message = "منطقة التوصيل غير متاحة") {
    super(message);
    this.name = "DeliveryZoneError";
  }
}
