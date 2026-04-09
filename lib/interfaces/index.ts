// lib/interfaces/index.ts
// Barrel re-export for all TypeScript interfaces.

export type { Product, ProductVariant, VariantOption, ProductImage } from "./product";
export type { Customer, Address, LoyaltyAccount } from "./customer";
export type {
  Order,
  OrderItem,
  OrderPreview,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderSource,
} from "./order";
export type { Notification, NotificationType } from "./notification";
export type { Admin, IStoreSettings, LandingPageConfig } from "./admin";
export { defaultLandingConfig } from "./admin";
