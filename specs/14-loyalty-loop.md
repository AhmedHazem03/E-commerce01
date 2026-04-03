# 🏆 حلقة الولاء (Loyalty Loop)

## الفكرة

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

---

## منطق كسب النقاط

```javascript
// كل 10 جنيه = نقطة واحدة
const earnPoints = (orderTotal) => Math.floor(orderTotal / 10)

// تقييم = 20 نقطة إضافية
const reviewBonus = 20

// 100 نقطة = خصم 10 جنيه على الأوردر الجاي
const pointValue = 0.1  // جنيه لكل نقطة
```

---

## Database Models

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

> ملاحظة: هذه الـ models موجودة أيضاً في `02-database-schema.md`
