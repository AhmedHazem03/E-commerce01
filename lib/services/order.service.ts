// server-only
import prisma from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { earnPoints, redeemPoints, getBalance } from "@/lib/services/loyalty.service";
import { validateCoupon } from "@/lib/services/coupon.service";
import type { PreviewOrderInput, CreateOrderInput } from "@/lib/validations/order";
import type { OrderStatus } from "@/lib/interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// Return types
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderListItem {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  customer: { name: string; phone: string };
  createdAt: Date;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes: string | null;
  customerId: number;
  customerName: string;
  customerPhone: string;
  address: string;
  pointsToEarn: number;
  items: {
    id: number;
    productId: number;
    name: string;
    price: number;
    quantity: number;
    variant: string | null;
    image: string | null;
  }[];
  createdAt: Date;
}

export interface OrderPreviewResult {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  pointsToEarn: number;
  currentPoints: number;
}

export interface CreateOrderResult {
  orderId: number;
  orderNumber: string;
  total: number;
  pointsToEarn: number;
  whatsapp: WhatsAppData | null;
}

interface WhatsAppData {
  storeWhatsApp: string | null;
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  items: { name: string; variant: string | null; quantity: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  paymentMethod: string;
  address: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// T019a: getOrders — paginated list for admin dashboard
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrders(
  filters: {
    status?: OrderStatus;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ orders: OrderListItem[]; total: number; page: number; pages: number }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.status ? { status: filters.status } : {}),
  };

  const [raw, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, phone: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const orders: OrderListItem[] = raw.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status as OrderStatus,
    total: o.total,
    paymentMethod: o.paymentMethod,
    customer: o.customer,
    createdAt: o.createdAt,
  }));

  return { orders, total, page, pages: Math.ceil(total / limit) };
}

// ─────────────────────────────────────────────────────────────────────────────
// T019a: getOrder — single order with items + customer + address
// ─────────────────────────────────────────────────────────────────────────────

export async function getOrder(id: number): Promise<OrderDetail | null> {
  const raw = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, phone: true } },
      address: {
        select: { street: true, area: true, city: true, notes: true },
      },
      items: {
        select: {
          id: true,
          productId: true,
          name: true,
          price: true,
          quantity: true,
          variant: true,
          image: true,
        },
      },
    },
  });

  if (!raw) return null;

  const addressParts = [
    raw.address.street,
    raw.address.area,
    raw.address.city,
  ].filter(Boolean);
  if (raw.address.notes) addressParts.push(raw.address.notes);
  const address = addressParts.join("، ");

  return {
    id: raw.id,
    orderNumber: raw.orderNumber,
    status: raw.status as OrderStatus,
    paymentMethod: raw.paymentMethod,
    subtotal: raw.subtotal,
    deliveryFee: raw.deliveryFee,
    discount: raw.discount,
    total: raw.total,
    notes: raw.notes,
    customerId: raw.customerId,
    customerName: raw.customer.name,
    customerPhone: raw.customer.phone,
    address,
    pointsToEarn: Math.floor(raw.subtotal / 10),
    items: raw.items,
    createdAt: raw.createdAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// getCustomerOrders — order history for the authenticated customer
// ─────────────────────────────────────────────────────────────────────────────

export async function getCustomerOrders(
  customerId: number
): Promise<Array<{ id: number; orderNumber: string; status: OrderStatus; total: number; createdAt: Date }>> {
  const rows = await prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
  });
  return rows.map((r) => ({ ...r, status: r.status as OrderStatus }));
}

// ─────────────────────────────────────────────────────────────────────────────
// T019b: previewOrder — server-side calculation (SC-003)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SC-003: server calculates deliveryFee and pointsToEarn — zero client math.
 * customerId is passed by the route handler from the customer_session cookie.
 */
export async function previewOrder(
  data: PreviewOrderInput,
  customerId: number
): Promise<OrderPreviewResult> {
  // Step 1: Flat delivery fee from environment variable (default 20 EGP)
  const deliveryFee = Number(process.env.DELIVERY_FEE ?? "20");

  // Step 2: Calculate subtotal from DB prices (never trust client prices — SC-003)
  // T013 rule: if a product has variants and variantOptionId is absent → 422
  // VariantOption has NO price column — always use Product.price per contracts/api.md
  let subtotal = 0;
  for (const item of data.items) {
    if (item.variantOptionId) {
      const option = await prisma.variantOption.findUnique({
        where: { id: item.variantOptionId },
        select: { variant: { select: { product: { select: { price: true } } } } },
      });
      if (!option) throw Object.assign(new Error("خيار المنتج غير موجود"), { statusCode: 404 });
      subtotal += option.variant.product.price * item.quantity;
    } else {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { price: true, variants: { select: { id: true }, take: 1 } },
      });
      if (!product) throw Object.assign(new Error("المنتج غير موجود"), { statusCode: 404 });
      // T013 rule: product with variants requires a variantOptionId
      if (product.variants.length > 0) {
        throw Object.assign(new Error("اختر الخيار المطلوب للمنتج"), { statusCode: 422 });
      }
      subtotal += product.price * item.quantity;
    }
  }

  // Step 3: Coupon discount
  let discount = 0;
  if (data.couponCode) {
    try {
      const couponResult = await validateCoupon(data.couponCode, subtotal);
      discount = couponResult.discount;
    } catch {
      // Invalid coupon in preview — ignore, show 0 discount
    }
  }

  // Step 4: Points redemption preview
  const loyaltyAccount = await prisma.loyaltyAccount.findUnique({
    where: { customerId },
    select: { points: true },
  });
  const currentPoints = loyaltyAccount?.points ?? 0;

  if (
    data.redeemPoints !== undefined &&
    data.redeemPoints >= 100 &&
    data.redeemPoints <= currentPoints
  ) {
    // 100 points = 10 EGP discount (10:1 ratio)
    discount += Math.floor(data.redeemPoints / 10);
  }

  const total = subtotal + deliveryFee - discount;
  const pointsToEarn = Math.floor(subtotal / 10);

  return {
    subtotal,
    deliveryFee,
    discount,
    total,
    pointsToEarn,
    currentPoints,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// T019c: createOrder — full transaction with stock gate + notifications
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SC-005: ORDER_CONFIRMED + NEW_ORDER notifications are synchronous (same cycle).
 * Stock re-validated server-side (EC-1: 409 on out-of-stock).
 * customerId is passed by the route handler from the customer_session cookie.
 */
export async function createOrder(
  data: CreateOrderInput,
  customerId: number
): Promise<CreateOrderResult> {
  // Step 1: Flat delivery fee from environment variable (default 20 EGP)
  const deliveryFee = Number(process.env.DELIVERY_FEE ?? "20");

  // Step 1b: Validate address ownership — IDOR prevention
  const addressOwner = await prisma.address.findUnique({
    where: { id: data.addressId },
    select: { customerId: true },
  });
  if (!addressOwner || addressOwner.customerId !== customerId) {
    throw Object.assign(new Error("العنوان غير صحيح أو لا ينتمي لهذا الحساب"), { statusCode: 403 });
  }

  // Step 2: Resolve product/variant data from DB
  // Prices and names are fetched here for the WhatsApp payload and OrderItem snapshot.
  // Stock is NOT validated here — it is re-validated atomically inside the transaction (EC-1, TOCTOU fix).
  // T013 rule: products with variants require variantOptionId → 422.
  type ResolvedItem = {
    productId: number;
    variantOptionId: number | null;
    name: string;
    price: number;
    quantity: number;
    variant: string | null;
    image: string | null;
  };

  const resolvedItems: ResolvedItem[] = [];
  let subtotal = 0;

  for (const item of data.items) {
    if (item.variantOptionId) {
      const option = await prisma.variantOption.findUnique({
        where: { id: item.variantOptionId },
        select: {
          id: true,
          value: true,
          stock: true,
          variant: { select: { name: true, product: { select: { name: true, price: true, images: { where: { isMain: true }, select: { url: true } } } } } },
        },
      });
      if (!option) {
        throw Object.assign(new Error("خيار المنتج غير موجود"), { statusCode: 404 });
      }
      const productPrice = option.variant.product.price;
      const productName = option.variant.product.name;
      const mainImage = option.variant.product.images[0]?.url ?? null;
      const variantLabel = `${option.variant.name}: ${option.value}`;
      resolvedItems.push({
        productId: item.productId,
        variantOptionId: item.variantOptionId,
        name: productName,
        price: productPrice,
        quantity: item.quantity,
        variant: variantLabel,
        image: mainImage,
      });
      subtotal += productPrice * item.quantity;
    } else {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          images: { where: { isMain: true }, select: { url: true } },
          variants: { select: { id: true }, take: 1 },
        },
      });
      if (!product) {
        throw Object.assign(new Error("المنتج غير موجود"), { statusCode: 404 });
      }
      // T013 rule: if product has variants, variantOptionId is required
      if (product.variants.length > 0) {
        throw Object.assign(new Error("اختر الخيار المطلوب للمنتج"), { statusCode: 422 });
      }
      resolvedItems.push({
        productId: item.productId,
        variantOptionId: null,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        variant: null,
        image: product.images[0]?.url ?? null,
      });
      subtotal += product.price * item.quantity;
    }
  }

  // Step 3: Coupon discount
  let discount = 0;
  let couponId: number | null = null;
  if (data.couponCode) {
    try {
      const couponResult = await validateCoupon(data.couponCode, subtotal);
      discount = couponResult.discount;
      couponId = couponResult.couponId;
    } catch {
      // Invalid coupon at order time — ignore (preview already showed 0)
    }
  }

  // Step 4: Points redemption — create LoyaltyTransaction + apply discount
  let redeemedPoints = 0;
  if (
    data.redeemPoints !== undefined &&
    data.redeemPoints >= 100
  ) {
    const loyaltyAccount = await prisma.loyaltyAccount.findUnique({
      where: { customerId },
      select: { id: true, points: true },
    });
    if (loyaltyAccount && loyaltyAccount.points >= data.redeemPoints) {
      redeemedPoints = data.redeemPoints;
      discount += Math.floor(redeemedPoints / 10);
    }
  }

  const total = subtotal + deliveryFee - discount;
  const pointsToEarn = Math.floor(subtotal / 10);
  const year = new Date().getFullYear();

  // Step 5: Persist order + items + re-validate stock + decrement in single transaction (EC-1, TOCTOU fix)
  const order = await prisma.$transaction(async (tx) => {
    // Re-validate stock atomically to prevent TOCTOU race conditions
    for (const item of resolvedItems) {
      if (item.variantOptionId) {
        const opt = await tx.variantOption.findUnique({
          where: { id: item.variantOptionId },
          select: { stock: true },
        });
        if (!opt || opt.stock < item.quantity) {
          throw Object.assign(new Error("المنتج نفد المخزون"), { statusCode: 409 });
        }
      } else {
        const prod = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });
        if (!prod || prod.stock < item.quantity) {
          throw Object.assign(new Error("المنتج نفد المخزون"), { statusCode: 409 });
        }
      }
    }

    // Create order with temporary orderNumber
    const created = await tx.order.create({
      data: {
        orderNumber: "TEMP",
        status: "NEW",
        paymentMethod: data.paymentMethod,
        source: data.source ?? null,
        subtotal,
        deliveryFee,
        discount,
        total,
        customerId,
        addressId: data.addressId,
        couponId,
      },
    });

    // Set orderNumber to canonical format: ORD-YYYY-NNNN
    const orderNumber = `ORD-${year}-${created.id.toString().padStart(4, "0")}`;
    await tx.order.update({
      where: { id: created.id },
      data: { orderNumber },
    });

    // Create OrderItems (price snapshot)
    await tx.orderItem.createMany({
      data: resolvedItems.map((item) => ({
        orderId: created.id,
        productId: item.productId,
        variantOptionId: item.variantOptionId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
        image: item.image,
      })),
    });

    // Decrement stock atomically
    for (const item of resolvedItems) {
      if (item.variantOptionId) {
        await tx.variantOption.update({
          where: { id: item.variantOptionId },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    // Redeem loyalty points inside the transaction — atomic conditional decrement (BL-002 TOCTOU fix)
    if (redeemedPoints > 0) {
      const loyaltyAcc = await tx.loyaltyAccount.findUnique({
        where: { customerId },
        select: { id: true },
      });
      if (loyaltyAcc) {
        // updateMany with balance condition — fails atomically if another request already spent the points
        const atomicUpdate = await tx.loyaltyAccount.updateMany({
          where: { id: loyaltyAcc.id, points: { gte: redeemedPoints } },
          data: { points: { decrement: redeemedPoints } },
        });
        if (atomicUpdate.count === 0) {
          throw Object.assign(new Error("رصيد النقاط غير كافٍ"), { statusCode: 422 });
        }
        await tx.loyaltyTransaction.create({
          data: {
            accountId: loyaltyAcc.id,
            points: -redeemedPoints,
            reason: "استبدال نقاط في الطلب",
            orderId: created.id,
          },
        });
      }
    }

    // Increment coupon usedCount if applied
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return { ...created, orderNumber };
  });

  // Step 6: Synchronous notifications (SC-005 — must be in same HTTP cycle)
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: customerId },
    select: { name: true, phone: true },
  });

  await notify.orderConfirmed(customerId, order.orderNumber, total, pointsToEarn);

  // Get admin for NEW_ORDER notification + WhatsApp number
  const admin = await prisma.admin.findFirst({
    select: { id: true, whatsappNumber: true },
  });
  if (admin) {
    await notify.newOrder(admin.id, order.orderNumber, customer.name, total);

    // B5: LOW_STOCK — check all decremented items in parallel, notify admin for each below threshold
    const LOW_STOCK_THRESHOLD = 5;
    const stockChecks = resolvedItems.map(async (item) => {
      if (item.variantOptionId) {
        const opt = await prisma.variantOption.findUnique({
          where: { id: item.variantOptionId },
          select: {
            stock: true,
            value: true,
            variant: { select: { name: true, product: { select: { name: true } } } },
          },
        });
        if (opt && opt.stock < LOW_STOCK_THRESHOLD) {
          const label = `${opt.variant.product.name} — ${opt.variant.name}: ${opt.value}`;
          return { productName: label, stock: opt.stock };
        }
      } else {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true },
        });
        if (prod && prod.stock < LOW_STOCK_THRESHOLD) {
          return { productName: prod.name, stock: prod.stock };
        }
      }
      return null;
    });

    const lowStockItems = (await Promise.all(stockChecks)).filter(
      (item): item is { productName: string; stock: number } => item !== null
    );

    for (const item of lowStockItems) {
      await notify.lowStock(admin.id, item.productName, item.stock);
    }
  }

  // Step 7: Build WhatsApp data payload
  const address = await prisma.address.findUnique({
    where: { id: data.addressId },
    select: { street: true, area: true, city: true, notes: true },
  });
  const addressStr = address
    ? [address.street, address.area, address.city, address.notes]
        .filter(Boolean)
        .join("، ")
    : "";

  const storeWhatsApp = admin?.whatsappNumber ?? null;
  const whatsapp: WhatsAppData | null = storeWhatsApp
    ? {
        storeWhatsApp,
        customerName: customer.name,
        customerPhone: customer.phone,
        orderNumber: order.orderNumber,
        items: resolvedItems.map((i) => ({
          name: i.name,
          variant: i.variant,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        deliveryFee,
        discount,
        paymentMethod: data.paymentMethod,
        address: addressStr,
      }
    : null;

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    total,
    pointsToEarn,
    whatsapp,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics: dashboard metrics
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalyticsMetrics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  abandonedCarts: number;
}

export async function getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
  const [totalOrders, revenueAgg, pendingOrders, abandonedCarts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.abandonedCart.count({ where: { reminded: false } }),
  ]);

  return {
    totalOrders,
    totalRevenue: revenueAgg._sum.total ?? 0,
    pendingOrders,
    abandonedCarts,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// T019d → T065: updateOrderStatus — status transitions + notification + loyalty wiring
// ─────────────────────────────────────────────────────────────────────────────

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
  _adminId: number
): Promise<{ id: number; status: OrderStatus }> {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      customerId: true,
      subtotal: true,
      total: true,
      status: true,
    },
  });

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });

  if (status === "DELIVERED") {
    const pointsEarned = Math.floor(order.subtotal / 10);

    // Award loyalty points
    const loyaltyAccount = await prisma.loyaltyAccount.findUnique({
      where: { customerId: order.customerId },
      select: { id: true },
    });
    if (loyaltyAccount) {
      await earnPoints(loyaltyAccount.id, pointsEarned, order.id);

      // B4: notify customer of new points balance (LOYALTY_POINTS)
      const newBalance = await getBalance(order.customerId);
      await notify.loyaltyPoints(order.customerId, pointsEarned, newBalance);
    }

    // FR-015 + FR-014: ORDER_DELIVERED notification
    await notify.orderDelivered(order.customerId, order.orderNumber, pointsEarned);
  } else if (status === "CANCELLED") {
    // FR-014: notify customer of cancellation
    await notify.orderStatus(order.customerId, order.orderNumber, "ملغي");

    // EC-6: Loyalty reversal
    const loyaltyAccount = await prisma.loyaltyAccount.findUnique({
      where: { customerId: order.customerId },
      select: { id: true },
    });

    if (loyaltyAccount) {
      // (a) Earn reversal: if points were awarded (order was DELIVERED before cancel)
      const earnTx = await prisma.loyaltyTransaction.findFirst({
        where: { orderId: id, points: { gt: 0 } },
        select: { points: true },
      });
      if (earnTx) {
        await redeemPoints(loyaltyAccount.id, earnTx.points, id);
      }

      // (b) Redeem reversal: if customer redeemed points at checkout for this order
      const redeemTx = await prisma.loyaltyTransaction.findFirst({
        where: { orderId: id, points: { lt: 0 } },
        select: { points: true },
      });
      if (redeemTx) {
        await earnPoints(loyaltyAccount.id, Math.abs(redeemTx.points), id);
      }
    }
  } else {
    // FR-014: notify customer of all other status changes
    await notify.orderStatus(order.customerId, order.orderNumber, status);
  }

  return { id: updated.id, status: updated.status as OrderStatus };
}
