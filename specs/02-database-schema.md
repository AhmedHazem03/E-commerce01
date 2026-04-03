# 🗄️ قاعدة البيانات (Prisma Schema)

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
  updatedAt   DateTime @updatedAt
}

model ProductImage {
  id        Int     @id @default(autoincrement())
  url       String
  isMain    Boolean @default(false)
  product   Product @relation(fields: [productId], references: [id])
  productId Int
}

// ✅ إصلاح: تم استبدال values كـ comma-separated String بـ model منفصل
// لأن String مش بتسمح بـ stock منفصل لكل قيمة ولا بالفلترة الصحيحة
model ProductVariant {
  id        Int             @id @default(autoincrement())
  name      String          // "المقاس" أو "اللون"
  product   Product         @relation(fields: [productId], references: [id])
  productId Int
  options   VariantOption[]
}

model VariantOption {
  id        Int            @id @default(autoincrement())
  value     String         // "S" / "M" / "أحمر" / "أسود"
  stock     Int            @default(0)
  variant   ProductVariant @relation(fields: [variantId], references: [id])
  variantId Int
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
  id             Int             @id @default(autoincrement())
  name           String
  phone          String          @unique
  addresses      Address[]
  orders         Order[]
  reviews        Review[]        // ⭐ جديد
  loyaltyAccount LoyaltyAccount? // ✅ إصلاح: relation مضافة
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
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
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Order {
  id             Int           @id @default(autoincrement())
  orderNumber    String        @unique // مثال: ORD-2026-0042
  status         OrderStatus   @default(NEW)
  paymentMethod  PaymentMethod
  paymentStatus  PaymentStatus @default(PENDING)
  subtotal       Float
  deliveryFee    Float
  discount       Float         @default(0)
  total          Float
  notes          String?
  // ✅ إصلاح: source أصبح enum بدل String لضمان قيم ثابتة وسهولة الفلترة
  source         OrderSource?
  customer       Customer      @relation(fields: [customerId], references: [id])
  customerId     Int
  address        Address       @relation(fields: [addressId], references: [id])
  addressId      Int
  // ✅ إضافة: ربط الكوبون بالطلب لمعرفة أي كوبون اتستخدم في أي طلب
  coupon         Coupon?       @relation(fields: [couponId], references: [id])
  couponId       Int?
  // ✅ إضافة: منطقة التوصيل لحساب الـ deliveryFee تلقائياً
  deliveryZone   DeliveryZone? @relation(fields: [deliveryZoneId], references: [id])
  deliveryZoneId Int?
  items          OrderItem[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
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
  // ✅ إضافة: relation بالطلبات لمعرفة أي كوبون اتستخدم في أي طلب
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ⭐ جديد — سلل متروكة (Abandoned Cart Recovery)
// ✅ إصلاح: phone أصبح @unique وغير nullable عشان upsert يشتغل صح
model AbandonedCart {
  id        Int      @id @default(autoincrement())
  phone     String   @unique  // ✅ @unique مطلوب لعمل upsert where: { phone }
  items     Json     // snapshot من السلة
  reminded  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ⭐ حلقة الولاء
model LoyaltyAccount {
  id           Int                  @id @default(autoincrement())
  points       Int                  @default(0)
  customer     Customer             @relation(fields: [customerId], references: [id])
  customerId   Int                  @unique
  transactions LoyaltyTransaction[]
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt
}

model LoyaltyTransaction {
  id        Int      @id @default(autoincrement())
  points    Int      // موجب = كسب، سالب = صرف
  reason    String   // "مراجعة منتج" / "طلب #123" / "استرداد خصم"
  account   LoyaltyAccount @relation(fields: [accountId], references: [id])
  accountId Int
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

// ✅ إضافة: enum للـ source بدل String? لضمان قيم ثابتة
enum OrderSource {
  INSTAGRAM
  WHATSAPP
  GOOGLE
  DIRECT
  FACEBOOK
  TIKTOK
}

// ✅ إضافة: مناطق التوصيل ورسومها — هذا الـ model يحسم سؤال "مين بيحسب deliveryFee?"
model DeliveryZone {
  id          Int     @id @default(autoincrement())
  name        String  // "القاهرة" / "الجيزة" / "الإسكندرية"
  deliveryFee Float   // الرسوم بالجنيه
  isActive    Boolean @default(true)
  orders      Order[]
}
```
