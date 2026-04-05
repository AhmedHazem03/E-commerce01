// lib/interfaces/product.ts
// Pure TypeScript interfaces — no Prisma types exported here.

export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
  position: number;
  productId: number;
}

export interface VariantOption {
  id: number;
  value: string;
  stock: number;
  position: number;
  // NOTE: no `price` field — VariantOption in Prisma schema has no price column
  variantId: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  position: number;
  productId: number;
  options: VariantOption[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  isActive: boolean;
  category: string;
  images: ProductImage[];
  variants: ProductVariant[];
  averageRating: number | null;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
