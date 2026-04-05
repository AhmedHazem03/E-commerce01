// server-only
import prisma from "@/lib/prisma";
import type { NotificationType } from "@/lib/interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// Payload type — covers all 8 notification types
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationPayload {
  orderNumber?: string;
  customerName?: string;
  points?: number;
  balance?: number;
  total?: number;
  pointsToEarn?: number;
  productName?: string;
  productId?: number;
  stock?: number;
  phone?: string;
  status?: string;
}

export interface NotificationCopy {
  title: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Arabic copy builder — all 8 NotificationType values
// NOTE: POINTS_EARNED does NOT exist in the schema enum — use LOYALTY_POINTS instead
// ─────────────────────────────────────────────────────────────────────────────

export function buildNotificationCopy(
  type: NotificationType,
  payload: NotificationPayload
): NotificationCopy {
  switch (type) {
    case "ORDER_CONFIRMED":
      return {
        title: "تم تأكيد طلبك 🎉",
        message: `طلبك رقم ${payload.orderNumber ?? ""} تم تأكيده وجاري التحضير`,
      };

    case "ORDER_STATUS":
      return {
        title: "تحديث على طلبك",
        message: `طلبك رقم ${payload.orderNumber ?? ""} — ${payload.status ?? ""}`,
      };

    case "ORDER_DELIVERED":
      return {
        title: "تم توصيل طلبك! 🎁",
        message: `طلبك رقم ${payload.orderNumber ?? ""} وصل. كسبت ${payload.points ?? 0} نقطة!`,
      };

    case "REVIEW_REQUEST":
      return {
        title: "شاركنا رأيك ⭐",
        message: `كيف كانت تجربتك مع ${payload.productName ?? "المنتج"}؟`,
      };

    case "LOYALTY_POINTS":
      return {
        title: "رصيد نقاطك",
        message: `رصيدك الحالي: ${payload.points ?? 0} نقطة`,
      };

    case "ABANDONED_CART":
      return {
        title: "نسيت حاجة! 🛒",
        message: "عندك منتجات في سلتك، أتم طلبك واحصل على اللي اخترته",
      };

    case "NEW_ORDER":
      return {
        title: "طلب جديد! 🔔",
        message: `طلب جديد رقم ${payload.orderNumber ?? ""} من ${payload.customerName ?? "عميل"} بقيمة ${payload.total ?? 0} ج.م`,
      };

    case "LOW_STOCK":
      return {
        title: "تحذير: مخزون منخفض ⚠️",
        message: `${payload.productName ?? "منتج"} باقي ${payload.stock ?? 0} قطع بس`,
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Channel abstraction
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationChannel {
  send(params: {
    type: NotificationType;
    payload: NotificationPayload;
    customerId?: number;
    adminId?: number;
  }): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// InApp channel — writes to Notification table
// FR-017: at least one of customerId / adminId must be non-null per row
// ─────────────────────────────────────────────────────────────────────────────

export class InAppChannel implements NotificationChannel {
  async send({
    type,
    payload,
    customerId,
    adminId,
  }: {
    type: NotificationType;
    payload: NotificationPayload;
    customerId?: number;
    adminId?: number;
  }): Promise<void> {
    // FR-017 guard
    if (!customerId && !adminId) {
      throw new Error(
        `Notification of type ${type} must target at least one principal (customerId or adminId).`
      );
    }

    const { title, message } = buildNotificationCopy(type, payload);

    await prisma.notification.create({
      data: {
        title,
        message,
        type,
        payload: payload as object,
        customerId: customerId ?? null,
        adminId: adminId ?? null,
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton InApp channel
// ─────────────────────────────────────────────────────────────────────────────

const inApp = new InAppChannel();

// ─────────────────────────────────────────────────────────────────────────────
// Named helpers — used across the service layer
// ─────────────────────────────────────────────────────────────────────────────

export const notify = {
  /** ORDER_CONFIRMED → customer (SC-005: synchronous, same HTTP cycle) */
  orderConfirmed: (
    customerId: number,
    orderNumber: string,
    total: number,
    pointsToEarn: number
  ) =>
    inApp.send({
      type: "ORDER_CONFIRMED",
      payload: { orderNumber, total, pointsToEarn },
      customerId,
    }),

  /** NEW_ORDER → admin dashboard (real-time bell notification) */
  newOrder: (
    adminId: number,
    orderNumber: string,
    customerName: string,
    total: number
  ) =>
    inApp.send({
      type: "NEW_ORDER",
      payload: { orderNumber, customerName, total },
      adminId,
    }),

  /** ORDER_STATUS → customer on any status change (FR-014) */
  orderStatus: (customerId: number, orderNumber: string, status: string) =>
    inApp.send({
      type: "ORDER_STATUS",
      payload: { orderNumber, status },
      customerId,
    }),

  /** ORDER_DELIVERED → customer when order is delivered (includes points earned) */
  orderDelivered: (
    customerId: number,
    orderNumber: string,
    points: number
  ) =>
    inApp.send({
      type: "ORDER_DELIVERED",
      payload: { orderNumber, points },
      customerId,
    }),

  /** ABANDONED_CART → customer after 1 hour of inactivity (FR-011) */
  abandonedCart: (customerId: number, phone: string) =>
    inApp.send({
      type: "ABANDONED_CART",
      payload: { phone },
      customerId,
    }),

  /** LOYALTY_POINTS → customer on balance change */
  loyaltyPoints: (customerId: number, points: number, balance: number) =>
    inApp.send({
      type: "LOYALTY_POINTS",
      payload: { points, balance },
      customerId,
    }),

  /** LOW_STOCK → admin when a product/variant drops below the urgency threshold */
  lowStock: (adminId: number, productName: string, stock: number) =>
    inApp.send({
      type: "LOW_STOCK",
      payload: { productName, stock },
      adminId,
    }),

  /**
   * REVIEW_REQUEST → customer after a verified purchase is delivered.
   * Note: uses REVIEW_REQUEST type (not a separate type — FR-016 bonus is +20 pts
   * logged by loyalty.service, this is just the notification copy).
   */
  reviewBonus: (customerId: number, productName: string, productId: number) =>
    inApp.send({
      type: "REVIEW_REQUEST",
      payload: { productName, productId },
      customerId,
    }),
};
