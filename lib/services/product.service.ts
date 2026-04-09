// server-only
import prisma from "@/lib/prisma";
import type { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Input types (defined inline to avoid circular imports — schemas live in
// lib/validations/product.ts which is created in T059)
// ─────────────────────────────────────────────────────────────────────────────

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "sold";
}

interface ProductImageInput {
  url: string;
  isMain: boolean;
}

interface VariantOptionInput {
  value: string;
  stock: number;
}

interface ProductVariantInput {
  name: string;
  options: VariantOptionInput[];
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  stock?: number;
  category: string;
  images: ProductImageInput[];
  variants?: ProductVariantInput[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

// ─────────────────────────────────────────────────────────────────────────────
// Return types (no raw Prisma types leaked)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductListItem {
  id: number;
  name: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  isActive: boolean;
  category: string;
  images: { url: string; isMain: boolean }[];
  avgRating: number | null;
  reviewCount: number;
}

export interface ProductDetail extends ProductListItem {
  description: string;
  variants: {
    id: number;
    name: string;
    options: { id: number; value: string; stock: number }[];
  }[];
  reviews: {
    id: number;
    rating: number;
    comment: string | null;
    customer: { name: string };
    createdAt: Date;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Service functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/products — paginated, filterable product list.
 * Only returns isActive = true products in the storefront.
 */
export async function getProducts(filters: ProductFilters = {}): Promise<{
  products: ProductListItem[];
  total: number;
  page: number;
  pages: number;
}> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };

  // Category filter (exact match — takes priority over search category token)
  if (filters.category) {
    where.category = filters.category;
  }

  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  // Full-text search across name, description, category
  if (filters.search) {
    const mode = "insensitive" as const;
    where.OR = [
      { name: { contains: filters.search, mode } },
      { description: { contains: filters.search, mode } },
      { category: { contains: filters.search, mode } },
    ];
  }

  const orderBy =
    filters.sortBy === "sold"
      ? { orderItems: { _count: "desc" as const } }
      : { createdAt: "desc" as const };

  const [rawProducts, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        images: { select: { url: true, isMain: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Compute average rating from aggregates
  const productIds = rawProducts.map((p) => p.id);
  const ratings = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
  });
  const ratingMap = new Map(ratings.map((r) => [r.productId, r._avg.rating]));

  const products: ProductListItem[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice,
    stock: p.stock,
    isActive: p.isActive,
    category: p.category,
    images: p.images,
    avgRating: ratingMap.get(p.id) ?? null,
    reviewCount: p._count.reviews,
  }));

  return {
    products,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

/**
 * GET /api/products/[id] — single product with all variant options and reviews.
 * FR-003: stock data included so StockBadge can compute "باقي X قطع بس!"
 */
export async function getProduct(id: number): Promise<ProductDetail | null> {
  const raw = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { select: { url: true, isMain: true } },
      variants: {
        orderBy: { position: "asc" },
        include: {
          options: {
            orderBy: { position: "asc" },
            select: { id: true, value: true, stock: true },
          },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          customer: { select: { name: true } },
          createdAt: true,
        },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!raw) return null;

  const ratingAgg = await prisma.review.aggregate({
    where: { productId: id },
    _avg: { rating: true },
  });

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    oldPrice: raw.oldPrice,
    stock: raw.stock,
    isActive: raw.isActive,
    category: raw.category,
    images: raw.images,
    avgRating: ratingAgg._avg.rating,
    reviewCount: raw._count.reviews,
    variants: raw.variants.map((v) => ({
      id: v.id,
      name: v.name,
      options: v.options,
    })),
    reviews: raw.reviews,
  };
}

/**
 * Admin: create product with optional variants.
 * Each VariantOption is stored as an independent row with its own stock.
 */
export async function createProduct(data: CreateProductInput) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description ?? "",
      price: data.price,
      oldPrice: data.oldPrice ?? null,
      stock: data.stock ?? 0,
      category: data.category,
      images: {
        create: data.images,
      },
      variants: data.variants
        ? {
            create: data.variants.map((v, vi) => ({
              name: v.name,
              position: vi,
              options: {
                create: v.options.map((o, oi) => ({
                  value: o.value,
                  stock: o.stock,
                  position: oi,
                })),
              },
            })),
          }
        : undefined,
    },
    include: {
      images: true,
      variants: { include: { options: true } },
    },
  });
}

/**
 * Admin: update product fields (partial).
 * If images are provided, replaces all existing images atomically.
 */
export async function updateProduct(
  id: number,
  data: UpdateProductInput
) {
  return prisma.$transaction(async (tx) => {
    // If images provided, delete existing and recreate
    if (data.images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: id } });
    }

    return tx.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.oldPrice !== undefined && { oldPrice: data.oldPrice }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.images !== undefined && {
          images: {
            create: data.images.map((img, i) => ({
              url: img.url,
              isMain: img.isMain,
              position: i,
            })),
          },
        }),
      },
      include: { images: true },
    });
  });
}

/**
 * Admin: soft-delete by setting isActive = false.
 * Hard-delete not used to preserve OrderItem history.
 */
export async function deleteProduct(id: number): Promise<void> {
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Landing Page — New Arrivals & Discounted Products
// ─────────────────────────────────────────────────────────────────────────────

async function attachRatings(rawProducts: { id: number }[]): Promise<Map<number, number | null>> {
  const ids = rawProducts.map((p) => p.id);
  const ratings = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: ids } },
    _avg: { rating: true },
  });
  return new Map(ratings.map((r) => [r.productId, r._avg.rating]));
}

/** Newest products — sorted by createdAt DESC */
export async function getNewArrivals(limit = 8): Promise<ProductListItem[]> {
  const raw = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      images: { select: { url: true, isMain: true } },
      _count: { select: { reviews: true } },
    },
  });
  const ratingMap = await attachRatings(raw);
  return raw.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice,
    stock: p.stock,
    isActive: p.isActive,
    category: p.category,
    images: p.images,
    avgRating: ratingMap.get(p.id) ?? null,
    reviewCount: p._count.reviews,
  }));
}

/** Products with a discount (oldPrice set) — sorted by biggest discount first */
export async function getDiscountedProducts(limit = 8): Promise<ProductListItem[]> {
  const raw = await prisma.product.findMany({
    where: { isActive: true, oldPrice: { not: null } },
    orderBy: { oldPrice: "desc" },
    take: limit,
    include: {
      images: { select: { url: true, isMain: true } },
      _count: { select: { reviews: true } },
    },
  });
  const ratingMap = await attachRatings(raw);
  return raw.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice,
    stock: p.stock,
    isActive: p.isActive,
    category: p.category,
    images: p.images,
    avgRating: ratingMap.get(p.id) ?? null,
    reviewCount: p._count.reviews,
  }));
}
