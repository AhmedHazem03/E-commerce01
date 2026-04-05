// lib/interfaces/notification.ts
// Pure TypeScript interfaces — no Prisma types exported here.

export type NotificationType =
  | "ORDER_CONFIRMED"
  | "ORDER_STATUS"
  | "ORDER_DELIVERED"
  | "REVIEW_REQUEST"
  | "LOYALTY_POINTS"
  | "ABANDONED_CART"
  | "NEW_ORDER"
  | "LOW_STOCK";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  customerId: number | null;
  adminId: number | null;
  createdAt: Date;
}
