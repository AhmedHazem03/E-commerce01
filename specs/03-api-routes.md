# 🔌 API Routes (Next.js)

## المنتجات

```javascript
// app/api/products/route.js

// GET /api/products?category=&search=&sort=
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search   = searchParams.get('search')
  const sort     = searchParams.get('sort') || 'newest'

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
      ...(search && { name: { contains: search } }),
    },
    include: {
      images: true,
      variants: true,
      reviews: { select: { rating: true } }, // ⭐ جديد — لحساب متوسط التقييم
    },
    orderBy: sort === 'price_asc'  ? { price: 'asc' }
           : sort === 'price_desc' ? { price: 'desc' }
           : { createdAt: 'desc' }
  })

  return Response.json(products)
}
```

---

## الطلبات

```javascript
// app/api/orders/route.js

// POST /api/orders — إنشاء طلب جديد
export async function POST(request) {
  const body = await request.json()
  // body: { customerId, addressId, items, paymentMethod, couponCode, notes, source }

  // 1. تحقق من الكوبون
  // 2. احسب الإجمالي (deliveryFee من DeliveryZone)
  // 3. أنشئ الطلب مع حفظ source + couponId + deliveryZoneId
  // 4. ابعت إشعار للعميل وصاحب المتجر
  // 5. رجع رقم الطلب
}
```

---

## ✅ إنشاء عميل + عنوان (Checkout Flow — عميل جديد)

```javascript
// app/api/customers/route.js

// POST /api/customers
// الخطوة الأولى من Checkout: إنشاء أو جلب العميل وإنشاء العنوان معاً
export async function POST(request) {
  const { name, phone, address } = await request.json()
  // address: { label, city, area, street, notes }

  // upsert العميل بالهاتف (لو جاي ثاني مرة مينشئش حساب جديد)
  const customer = await prisma.customer.upsert({
    where:  { phone },
    update: { name },
    create: { name, phone }
  })

  // أنشئ العنوان واختره كـ default
  const newAddress = await prisma.address.create({
    data: { ...address, customerId: customer.id, isDefault: true }
  })

  return Response.json({ customerId: customer.id, addressId: newAddress.id })
}

---

## المدفوعات

```javascript
// app/api/payments/route.js

// POST /api/payments/vodafone-cash
// POST /api/payments/instapay
// POST /api/payments/card (Paymob أو Fawry)
// POST /api/payments/confirm — تأكيد الدفع
```

---

## ⭐ السلة المتروكة (Abandoned Cart)

```javascript
// app/api/cart/abandon/route.js

// POST /api/cart/abandon
// يُحفظ تلقائياً لو العميل دخل رقمه في Checkout ومشيش
export async function POST(request) {
  const { phone, items } = await request.json()

  // ✅ إصلاح: phone أصبح @unique في الـ Schema فالـ upsert يشتغل صح
  if (!phone) return Response.json({ error: 'phone required' }, { status: 400 })

  await prisma.abandonedCart.upsert({
    where:  { phone },
    update: { items, reminded: false, updatedAt: new Date() },
    create: { phone, items }
  })

  return Response.json({ ok: true })
}
```

---

## ✅ Vercel Cron Job — تذكير السلة المتروكة

```javascript
// app/api/cron/abandoned-cart/route.js
// يشتغل أوتوماتيكياً عبر Vercel Cron كل ساعة

export async function GET(request) {
  // تحقق من الـ secret عشان محدش يقدر يجي فتفجر التذكيرات
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 1 * 60 * 60 * 1000) // بعد ساعة
  const pending = await prisma.abandonedCart.findMany({
    where: { reminded: false, createdAt: { lte: cutoff } }
  })

  for (const cart of pending) {
    await sendWhatsApp(cart.phone, buildAbandonedCartMsg(cart))
    await prisma.abandonedCart.update({
      where: { id: cart.id },
      data:  { reminded: true }
    })
  }

  return Response.json({ processed: pending.length })
}
```

```json
// vercel.json — لتشغيل Vercel Cron Job كل ساعة
{
  "crons": [{
    "path": "/api/cron/abandoned-cart",
    "schedule": "0 * * * *"
  }]
}
```

---

## ⭐ Upsell ذكي في السلة

```javascript
// GET /api/products/upsell?cartItems=[1,2,3]

// منطق الاقتراح:
// - منتجات اشتراها عملاء اشتروا نفس المنتجات
// - أو: من نفس التصنيف بسعر أقل من 30% من إجمالي السلة
```

---

## ⭐ صورة تأكيد التسليم

```javascript
// POST /api/orders/:id/delivery-photo
// المندوب يرفع صورة قبل تغيير الحالة لـ DELIVERED
// + الصورة تتبعت في رسالة واتساب للعميل
```
---

## ✅ تقييمات العملاء (Reviews)

```javascript
// app/api/reviews/route.js

// GET /api/reviews?productId=
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const productId = parseInt(searchParams.get('productId'))

  const reviews = await prisma.review.findMany({
    where:   { productId },
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return Response.json(reviews)
}

// POST /api/reviews — العميل لازم يكون عنده طلب مكتمل على المنتج قبل التقييم
// ❗ لا يجوز تقييم منتج لم يشتره العميل — "شراء مؤكد"
export async function POST(request) {
  const { customerId, productId, rating, comment } = await request.json()

  // تحقق: هل اشترى العميل هذا المنتج فعلاً؟
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { customerId, status: 'DELIVERED' }
    }
  })

  if (!hasPurchased) {
    return Response.json(
      { error: 'ممكنش تقييم منتج مش اشتريته' },
      { status: 403 }
    )
  }

  // تجنب التقييم المكرر لنفس المنتج
  const existing = await prisma.review.findFirst({ where: { customerId, productId } })
  if (existing) {
    return Response.json({ error: 'سبق تقييمك لهذا المنتج' }, { status: 409 })
  }

  const review = await prisma.review.create({
    data: { customerId, productId, rating: Math.min(5, Math.max(1, rating)), comment }
  })

  return Response.json(review, { status: 201 })
}
```