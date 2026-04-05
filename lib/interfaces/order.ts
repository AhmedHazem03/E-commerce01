// lib/interfaces/order.ts
// Pure TypeScript interfaces — no Prisma types exported here.

export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "ON_WAY"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "VODAFONE_CASH" | "INSTAPAY" | "CARD";

export type PaymentStatus = "PENDING" | "PAID";

export type OrderSource =
  | "INSTAGRAM"
  | "WHATSAPP"
  | "GOOGLE"
  | "DIRECT"
  | "FACEBOOK"
  | "TIKTOK";

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  variant: string | null;
  image: string | null;
  productId: number;
  variantOptionId: number | null;
  orderId: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes: string | null;
  source: OrderSource | null;
  customerId: number;
  addressId: number;
  couponId: number | null;
  deliveryZoneId: number | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderPreview {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  pointsToEarn: number;
  currentPoints: number;
}
