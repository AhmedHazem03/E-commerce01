# 🛍️ مواصفات المتجر التسويقي (Next.js)
### نموذج يناسب: ملابس | إكسسوارات | هدايا

> **الهدف:** متجر Demo احترافي تعرضه على العملاء الـ 3
> بعد الاتفاق، بتعدّل الألوان واللوجو والمنتجات لكل عميل

---

## 🗂️ هيكل المشروع

```
my-store/
├── app/                        # Next.js App Router
│   ├── (store)/                # واجهة العميل
│   │   ├── page.jsx            # الصفحة الرئيسية
│   │   ├── products/
│   │   │   ├── page.jsx        # كل المنتجات
│   │   │   └── [id]/page.jsx   # تفاصيل منتج
│   │   ├── cart/page.jsx       # السلة
│   │   ├── checkout/page.jsx   # إتمام الطلب
│   │   └── order/[id]/page.jsx # تتبع الطلب
│   │
│   ├── (dashboard)/            # لوحة تحكم صاحب المتجر
│   │   ├── dashboard/page.jsx  # الرئيسية
│   │   ├── orders/page.jsx     # الطلبات
│   │   └── products/page.jsx   # المنتجات
│   │
│   └── api/                    # API Routes
│       ├── products/route.js
│       ├── orders/route.js
│       ├── auth/route.js
│       ├── payments/route.js
│       └── reviews/route.js    # ⭐ جديد
│
├── components/
│   ├── store/
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx     # يعرض النجوم + "باقي X قطعة"
│   │   ├── CartDrawer.jsx
│   │   ├── ImageGallery.jsx    # مهم جداً للملابس
│   │   ├── SizeGuide.jsx       # دليل المقاسات
│   │   └── ReviewStars.jsx     # ⭐ جديد — تقييمات العملاء
│   └── dashboard/
│       ├── OrderCard.jsx
│       └── StatsCard.jsx
│
├── lib/
│   ├── db.js                   # اتصال قاعدة البيانات
│   ├── auth.js                 # JWT helpers
│   ├── notifications.js        # واتساب / SMS
│   └── cart.js                 # ⭐ جديد — حفظ السلة في localStorage
│
├── prisma/
│   └── schema.prisma
│
└── public/
    └── demo/                   # صور Demo للتسويق
```

---

## 🗄️ قاعدة البيانات (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String   @db.Text
  price       Float
  oldPrice    Float?   // للخصومات
  stock       Int      @default(0)
  isActive    Boolean  @default(true)
  category    String   // ملابس / إكسسوارات / هدايا
  images      ProductImage[]
  variants    ProductVariant[]
  orderItems  OrderItem[]
  reviews     Review[]         // ⭐ جديد
  createdAt   DateTime @default(now())
}

model ProductImage {
  id        Int     @id @default(autoincrement())
  url       String
  isMain    Boolean @default(false)
  product   Product @relation(fields: [productId], references: [id])
  productId Int
}

model ProductVariant {
  id        Int     @id @default(autoincrement())
  name      String  // "المقاس" أو "اللون"
  values    String  // "S,M,L,XL" أو "أحمر,أسود,أبيض"
  product   Product @relation(fields: [productId], references: [id])
  productId Int
}

// ⭐ جديد — تقييمات العملاء (Social Proof)
model Review {
  id         Int      @id @default(autoincrement())
  rating     Int      // 1-5
  comment    String?
  product    Product  @relation(fields: [productId], references: [id])
  productId  Int
  customer   Customer @relation(fields: [customerId], references: [id])
  customerId Int
  createdAt  DateTime @default(now())
}

model Customer {
  id        Int       @id @default(autoincrement())
  name      String
  phone     String    @unique
  addresses Address[]
  orders    Order[]
  reviews   Review[]  // ⭐ جديد
  createdAt DateTime  @default(now())
}

model Address {
  id         Int      @id @default(autoincrement())
  label      String   // بيت / شغل
  city       String
  area       String
  street     String
  notes      String?
  isDefault  Boolean  @default(false)
  customer   Customer @relation(fields: [customerId], references: [id])
  customerId Int
  orders     Order[]
}

model Order {
  id            Int           @id @default(autoincrement())
  orderNumber   String        @unique // مثال: ORD-2026-0042
  status        OrderStatus   @default(NEW)
  paymentMethod PaymentMethod
  paymentStatus PaymentStatus @default(PENDING)
  subtotal      Float
  deliveryFee   Float
  discount      Float         @default(0)
  total         Float
  notes         String?
  source        String?       // ⭐ جديد — instagram / whatsapp / google / direct
  customer      Customer      @relation(fields: [customerId], references: [id])
  customerId    Int
  address       Address       @relation(fields: [addressId], references: [id])
  addressId     Int
  items         OrderItem[]
  createdAt     DateTime      @default(now())
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  name      String  // نسخة من اسم المنتج وقت الطلب
  price     Float   // نسخة من السعر وقت الطلب
  quantity  Int
  variant   String? // المقاس أو اللون المختار
  image     String? // صورة المنتج
  product   Product @relation(fields: [productId], references: [id])
  productId Int
  order     Order   @relation(fields: [orderId], references: [id])
  orderId   Int
}

model Coupon {
  id        Int      @id @default(autoincrement())
  code      String   @unique
  type      String   // percentage / fixed
  value     Float
  minOrder  Float    @default(0)
  maxUses   Int?
  usedCount Int      @default(0)
  expiresAt DateTime?
  isActive  Boolean  @default(true)
}

// ⭐ جديد — سلل متروكة (Abandoned Cart Recovery)
model AbandonedCart {
  id        Int      @id @default(autoincrement())
  phone     String?
  items     Json     // snapshot من السلة
  reminded  Boolean  @default(false)
  createdAt DateTime @default(now())
}

enum OrderStatus {
  NEW
  PREPARING
  ON_WAY
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  CASH
  VODAFONE_CASH
  INSTAPAY
  CARD
}

enum PaymentStatus {
  PENDING
  PAID
}
```

---

## 🔌 API Routes (Next.js)

### المنتجات
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

### الطلبات
```javascript
// app/api/orders/route.js

// POST /api/orders — إنشاء طلب جديد
export async function POST(request) {
  const body = await request.json()
  // body: { customerId, addressId, items, paymentMethod, couponCode, notes, source }

  // 1. تحقق من الكوبون
  // 2. احسب الإجمالي
  // 3. أنشئ الطلب مع حفظ source (UTM)
  // 4. ابعت إشعار للعميل وصاحب المتجر
  // 5. رجع رقم الطلب
}
```

### المدفوعات
```javascript
// app/api/payments/route.js

// POST /api/payments/vodafone-cash
// POST /api/payments/instapay
// POST /api/payments/card (Paymob أو Fawry)
// POST /api/payments/confirm — تأكيد الدفع
```

### ⭐ جديد — السلة المتروكة
```javascript
// app/api/cart/abandon/route.js

// POST /api/cart/abandon
// يُحفظ تلقائياً لو العميل دخل رقمه في Checkout ومشيش
export async function POST(request) {
  const { phone, items } = await request.json()
  await prisma.abandonedCart.upsert({
    where: { phone },
    update: { items, reminded: false },
    create: { phone, items }
  })
  // Cron job بعد 24 ساعة يبعت واتساب تذكير
}
```

---

## 📱 شاشات الواجهة

### 1. الصفحة الرئيسية
```
✓ Hero كبير — صورة Lifestyle + اسم المتجر + CTA
✓ التصنيفات — أيقونات أفقية (ملابس / إكسسوارات / هدايا)
✓ "وصل حديثاً" — Grid منتجات
✓ بانر عرض خاص
✓ "الأكثر مبيعاً"
✓ Bottom Nav ثابت (موبايل فقط)
```

### 2. صفحة المنتجات
```
✓ بحث في الأعلى
✓ فلتر: التصنيف / السعر / المقاس / اللون
✓ ترتيب: الأحدث / الأرخص / الأغلى
✓ Grid: عمودين موبايل / 4 لابتوب
✓ كارت المنتج: صورة + اسم + سعر + زرار السلة
✓ ⭐ جديد — نجوم التقييم على الكارت
✓ ⭐ جديد — "باقي 3 قطع بس!" لو stock < 5
```

### 3. صفحة تفاصيل المنتج ⭐ (الأهم للملابس)
```
✓ Swiper صور متعددة مع Zoom
✓ الاسم والسعر (مع السعر القديم لو في خصم)
✓ اختيار المقاس + دليل المقاسات
✓ اختيار اللون مع صورة لكل لون
✓ الكمية
✓ "أضف للسلة" + "اشتري دلوقتي"
✓ الوصف والتفاصيل
✓ منتجات مشابهة
✓ ⭐ جديد — قسم تقييمات العملاء (اسم + نجوم + تعليق)
✓ ⭐ جديد — "X شخص اشتراه الأسبوع ده" (Social Proof ديناميكي)
✓ ⭐ جديد — عداد Countdown لو في عرض منتهي الصلاحية
```

### 4. السلة (Drawer من الجانب)
```
✓ قائمة المنتجات مع صورة صغيرة
✓ تعديل الكمية وحذف
✓ ملخص: مجموع + توصيل + خصم
✓ ⭐ جديد — حقل الكوبون مخفي وراء "عندك كوبون خصم؟" (لينك صغير)
         (عشان متبقيش العميل يدور عليه ويخرج من الموقع)
✓ زرار "إتمام الطلب"
```

### 5. الـ Checkout (خطوتين بدل 3) ⭐ مُبسَّط
```
⚠️ قلّلنا الخطوات لتقليل نسبة التخلي عن الطلب

Step 1 — بياناتك:
  ✓ الاسم
  ✓ رقم الموبايل  ← يُحفظ هنا للـ Abandoned Cart
  ✓ العنوان (مدينة / منطقة / شارع)
  ✓ اختيار منطقة التوصيل
  ✗ OTP اتحذف — ممكن يتبعت بعد الطلب اختياري

Step 2 — الدفع والتأكيد:
  ✓ كاش عند الاستلام
  ✓ فودافون كاش (رقم + تأكيد)
  ✓ انستاباي (QR Code)
  ✓ بطاقة بنكية (Paymob)
  ✓ ملخص الطلب النهائي
  ✓ زرار "تأكيد الطلب"
```

### 6. تتبع الطلب ⭐ مُحسَّن
```
✓ رقم الطلب والتاريخ
✓ Timeline مرئي: جديد ← قيد التحضير ← في الطريق ← تم
✓ تفاصيل المنتجات
✓ زرار واتساب للتواصل
✓ ⭐ جديد — زرار "اطلب تاني" (Reorder بكليك واحد)
✓ ⭐ جديد — "منتجات ممكن تعجبك" بعد التسليم
```

---

## 🖥️ لوحة التحكم

### الرئيسية
```
✓ كروت: مبيعات اليوم / عدد الطلبات / طلبات جديدة
✓ آخر 10 طلبات
✓ تنبيه صوتي + إشعار لكل طلب جديد
✓ ⭐ جديد — كارت "سلال متروكة" (عدد العملاء اللي دخلوا Checkout ومشيوش)
```

### الطلبات
```
✓ تابز: الكل / جديد / قيد التحضير / في الطريق / تم
✓ بحث برقم الطلب أو اسم العميل
✓ تغيير الحالة بكليك واحد
✓ تفاصيل الطلب كاملة
✓ ⭐ جديد — عمود "المصدر" (جاي منين: إنستجرام / واتساب / جوجل)
```

### المنتجات
```
✓ إضافة / تعديل / حذف
✓ رفع صور متعددة (Drag & Drop)
✓ تفعيل وإيقاف
✓ إدارة المقاسات والألوان
✓ ⭐ جديد — عرض متوسط التقييم لكل منتج
```

---

## 🔔 الإشعارات

```javascript
// للعميل عبر واتساب
const confirmMsg = `
مرحباً ${name} 👋
تم استلام طلبك رقم #${orderNumber} ✅
الإجمالي: ${total} جنيه
سيتم التواصل معك قريباً 🚗
`

const shippingMsg = `
طلبك رقم #${orderNumber} في الطريق إليك 🚗
`

// ⭐ جديد — تذكير السلة المتروكة (بعد 24 ساعة)
const abandonedCartMsg = `
مرحباً! 👋
لسه عندك منتجات في سلتك 🛒
إتمام طلبك: ${cartUrl}
`

// ⭐ جديد — طلب تقييم بعد التسليم (بعد يومين)
const reviewMsg = `
وصلك طلبك كويس؟ 😊
يسعدنا رأيك في المنتجات: ${reviewUrl}
`

// لصاحب المتجر
// Browser Notification + صوت تنبيه عند كل طلب جديد
```

---

## 🎨 Design System (للنموذج التسويقي)

```css
:root {
  --bg:          #FAFAF8;
  --bg-2:        #F5F0EB;
  --text:        #1C1C1C;
  --text-muted:  #888888;
  --border:      #E5E0DA;

  /* Accent — بيتغير لكل عميل */
  --accent:      #C9956A;   /* ذهبي دافئ — مناسب للهدايا والإكسسوارات */
  --accent-light:#FDF3EB;

  /* ⭐ جديد — ألوان Urgency */
  --danger:      #E53E3E;   /* "باقي 3 قطع بس" */
  --success:     #38A169;   /* "متاح" */
}

/* خط عربي احترافي */
font-family: 'Cairo', sans-serif;

/* Border Radius */
--r-card:   12px;
--r-btn:    10px;
--r-input:  8px;
```

---

## 📦 المكتبات المطلوبة

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "@prisma/client": "latest",
    "tailwindcss": "latest",
    "swiper": "latest",
    "zustand": "latest",
    "react-hot-toast": "latest",
    "cloudinary": "latest",
    "jsonwebtoken": "latest",
    "axios": "latest",
    "react-stars": "latest"    // ⭐ جديد — نجوم التقييم
  }
}
```

---

## ⏱️ خطة التنفيذ (4 أسابيع للـ Demo)

```
الأسبوع 1 — الأساس:
  ✓ إعداد Next.js + Prisma + Tailwind
  ✓ قاعدة البيانات وبيانات تجريبية
  ✓ صفحة المنتجات وتفاصيل المنتج
  ✓ ⭐ Social Proof: نجوم + عدد المشترين

الأسبوع 2 — الشراء:
  ✓ السلة (Zustand) + حفظها في localStorage
  ✓ Checkout خطوتين (مبسّط)
  ✓ كل طرق الدفع
  ✓ ⭐ Urgency: "باقي X قطعة" + Countdown للعروض

الأسبوع 3 — التحكم:
  ✓ لوحة التحكم
  ✓ إدارة الطلبات والمنتجات
  ✓ الإشعارات
  ✓ ⭐ UTM Tracking + كارت السلل المتروكة

الأسبوع 4 — التلميع:
  ✓ تحسين التصميم والأنيميشن
  ✓ صور Demo احترافية
  ✓ ⭐ Abandoned Cart: Cron job + واتساب تذكير
  ✓ ⭐ Reorder Button في صفحة تتبع الطلب
  ✓ Deploy على Vercel
  ✓ جاهز للعرض على العملاء ✅
```

---

## ✅ Checklist قبل العرض على العميل

```
□ الموقع شغال على الموبايل بشكل ممتاز
□ صور المنتجات احترافية (حتى لو Demo)
□ إتمام طلب كامل من الأول للآخر شغال
□ لوحة التحكم واضحة وسهلة
□ الإشعارات وصلت
□ Deployed على Vercel برابط جاهز للمشاركة
□ سرعة الموقع ممتازة على الموبايل
□ ⭐ التقييمات بتتعرض على المنتجات
□ ⭐ "باقي X قطعة" شغال على المنتجات قليلة الـ stock
□ ⭐ حقل الكوبون مخفي (مش ظاهر بشكل كامل)
□ ⭐ السلة بتتحفظ لو العميل سكر المتصفح وفتحه
□ ⭐ صفحة تتبع الطلب فيها زرار "اطلب تاني"
□ ⭐ المصدر (source) بيتسجل مع كل طلب
```

---

## 📊 ملخص التعديلات التسويقية المضافة

| المشكلة | الحل المضاف | أين في الكود |
|---|---|---|
| مفيش Social Proof | نجوم + عدد المشترين | `Review` model + `ReviewStars.jsx` |
| مفيش Urgency | "باقي X قطعة" + Countdown | `ProductCard.jsx` + صفحة المنتج |
| Checkout طويل | خطوتين بدل 3، OTP اختياري | `checkout/page.jsx` |
| السلة بتتمسح | حفظ في localStorage | `lib/cart.js` |
| مفيش Abandoned Cart | Cron + واتساب تذكير | `AbandonedCart` model + API |
| صفحة التتبع مش بتبيع | Reorder + منتجات مقترحة | `order/[id]/page.jsx` |
| مفيش UTM Tracking | حقل `source` في الطلب | `Order` model |
| الكوبون بيبعد العميل | مخفي وراء لينك صغير | `CartDrawer.jsx` |

---

> **نصيحة:** اعمل Demo بمنتجات جميلة وصور احترافية —
> العميل بيشتري اللي بيشوفه مش اللي بتشرحه 🎯

---

## 🗺️ رحلة المستخدم

### 1. رحلة المشتري

```
[اكتشاف] → [تصفح] → [تفاصيل المنتج] → [السلة] → [دفع]
  إنستجرام    فلاتر     صور+مقاس+تقييمات   كوبون      كاش/فودافون/كارت
                                                          ↓
                                                    أكمل الطلب؟
                                                   ↙           ↘
                                                 لا              نعم
                                                  ↓               ↓
                                           سلة متروكة       تأكيد الطلب
                                         واتساب بعد 24h    رقم + واتساب
                                                  ↓               ↓
                                          (يرجع للسلة)       تتبع الطلب
                                                           Timeline + واتساب
                                                                   ↓
                                                            تم التسليم
                                                                   ↓
                                                           طلب تقييم
                                                         واتساب بعد يومين
                                                                   ↓
                                                            اطلب تاني
                                                          Reorder بكليك
```

**نقاط الاحتكاك الحرجة وحلولها:**

| النقطة | المشكلة | الحل المطبّق |
|---|---|---|
| صفحة المنتج | مفيش ثقة | نجوم التقييم + عدد المشترين |
| السلة | عميل يدور كوبون ويخرج | حقل الكوبون مخفي |
| Checkout | خطوات كتير = تخلّي | خطوتين بدل 3، بدون OTP |
| بعد الدفع | مفيش حافز للتكرار | Reorder + طلب تقييم |
| خروج بدون شراء | مفيش استرداد | Abandoned Cart + تذكير واتساب |

---

### 2. رحلة صاحب المتجر

#### الإعداد (مرة واحدة)
```
[إضافة المنتجات] → [كوبونات الخصم] → [مناطق التوصيل] → [نشر على Vercel]
 صور+مقاسات+سعر    نوع+قيمة+تاريخ    رسوم لكل منطقة     رابط جاهز للعرض
```

#### الطلبات اليومية (يومياً)
```
[طلب جديد!] → [مراجعة الطلب] → [تغيير الحالة] → [إشعار العميل تلقائي]
صوت + Browser    منتجات+عنوان    قيد التحضير        واتساب تلقائي
                                 / في الطريق
```

#### المتابعة والتحليل (أسبوعياً)
```
[لوحة التحكم] → [سلال متروكة] → [مصدر الطلبات] → [التقييمات]
مبيعات اليوم    كم عميل خرج     إنستجرام/جوجل      متوسط النجوم
                بدون شراء        /واتساب             لكل منتج
```

#### التحسين المستمر
```
[تعديل المنتجات] → [إيقاف / تفعيل] → [عروض وخصومات] → [مراجعة الموسم]
سعر+مخزون+صور     منتج نفد أو       سعر قديم+كوبون     أكثر منتج مبيعاً
                   موسمي              جديد
```

**ما يحتاجه صاحب المتجر كل يوم (3 دقائق فقط):**
1. فتح لوحة التحكم — شوف الطلبات الجديدة
2. تغيير حالة الطلبات الجاهزة للتوصيل
3. مراجعة السلال المتروكة الجديدة

---

## 🔄 رحلة المشتري v2 — بعد التحسينات التسويقية

### التغييرات على كل مرحلة

| المرحلة | النسخة القديمة | النسخة المحدّثة | السبب |
|---|---|---|---|
| الاكتشاف | إنستجرام + واتساب | + تيك توك + UGC | UGC أقوى في بناء الثقة من الإعلان المباشر |
| تفاصيل المنتج | صور + مقاس + تقييمات | + AR Try-on | يقلل معدل الإرجاع بشكل ملحوظ للملابس |
| السلة | كوبون مخفي + ملخص | + Upsell ذكي | العميل منفتح للشراء في هذه اللحظة تحديداً |
| الدفع | كاش / فودافون / كارت | + BNPL (Sympl / Paymob) | يرفع التحويل خصوصاً للأوردرات الكبيرة |
| السلة المتروكة | واتساب بعد 24 ساعة | واتساب بعد ساعة + كود خصم 10% | التوقيت المبكر + الحافز يرجّع نسبة كبيرة |
| التسليم | إشعار واتساب فقط | + صورة تأكيد التوصيل | تقلل شكاوى "ما وصلني" وتبني ثقة |
| طلب التقييم | رسالة واتساب بعد يومين | طلب تقييم = نقاط مكافأة | التحويل يتضاعف لما يكون فيه حافز حقيقي |

---

### حلقة الولاء (أهم إضافة)

بدل ما كل عميل يبدأ رحلته من الصفر في كل مرة:

```
تسليم ناجح
    ↓
طلب تقييم → العميل يكسب نقاط
    ↓
النقاط تتراكم → خصم على الأوردر الجاي
    ↓
واتساب: "عندك X نقطة، استخدمها في طلبك الجديد"
    ↓
Reorder بكليك واحد ← يعود مباشرة للسلة
    ↓
↻ حلقة متكررة بدون بداية من الصفر
```

**المكوّنات التقنية المطلوبة لحلقة الولاء:**

```prisma
model LoyaltyAccount {
  id           Int      @id @default(autoincrement())
  points       Int      @default(0)
  customer     Customer @relation(fields: [customerId], references: [id])
  customerId   Int      @unique
  transactions LoyaltyTransaction[]
}

model LoyaltyTransaction {
  id        Int      @id @default(autoincrement())
  points    Int      // موجب = كسب، سالب = صرف
  reason    String   // "مراجعة منتج" / "طلب #123" / "استرداد خصم"
  account   LoyaltyAccount @relation(fields: [accountId], references: [id])
  accountId Int
  createdAt DateTime @default(now())
}
```

**منطق كسب النقاط:**
```javascript
// كل 10 جنيه = نقطة واحدة
const earnPoints = (orderTotal) => Math.floor(orderTotal / 10)

// تقييم = 20 نقطة إضافية
const reviewBonus = 20

// 100 نقطة = خصم 10 جنيه على الأوردر الجاي
const pointValue = 0.1  // جنيه لكل نقطة
```

---

### التحسينات التقنية المطلوبة

#### 1. AR Try-on (للملابس والإكسسوارات)
```javascript
// استخدام Snapchat AR أو Google AR لعرض المنتج على العميل
// أو: رابط لتجربة 3D spin viewer

// الحد الأدنى (بدون AR كامل):
// صور المنتج على موديلات بأجسام مختلفة
// + جدول مقاسات تفصيلي بالسنتيمتر
```

#### 2. Upsell ذكي في السلة
```javascript
// عند فتح السلة: جلب منتجات مكمّلة
// GET /api/products/upsell?cartItems=[1,2,3]

// منطق الاقتراح:
// - منتجات اشتراها عملاء اشتروا نفس المنتجات
// - أو: من نفس التصنيف بسعر أقل من 30% من إجمالي السلة
```

#### 3. BNPL
```javascript
// Sympl: متاح في مصر، تقسيط 0% على 3-6 أشهر
// Paymob Installments: بطاقات بنكية بالتقسيط
// ValU: تمويل استهلاكي

// في الـ UI: اعرض السعر الشهري بجانب السعر الكامل
// "أو 3 أقساط × 83 جنيه"
```

#### 4. صورة تأكيد التسليم
```javascript
// المندوب يرفع صورة قبل تغيير الحالة لـ DELIVERED
// POST /api/orders/:id/delivery-photo
// + الصورة تتبعت في رسالة واتساب للعميل
```

