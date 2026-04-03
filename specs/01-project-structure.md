# 🗂️ هيكل المشروع

```
my-store/
├── middleware.js                # ✅ إضافة: حماية الـ Dashboard — يمنع الدخول بدون تسجيل
├── app/                        # Next.js App Router
│   ├── (store)/                # واجهة العميل
│   │   ├── page.jsx            # الصفحة الرئيسية
│   │   ├── products/
│   │   │   ├── page.jsx        # كل المنتجات
│   │   │   └── [id]/page.jsx   # تفاصيل منتج
│   │   │
│   │   │   # ✅ إصلاح: تم حذف cart/page.jsx — السلة هي CartDrawer فقط
│   │   │   # وليس صفحة منفصلة (Drawer يعمل على كل الصفحات)
│   │   ├── checkout/page.jsx   # إتمام الطلب
│   │   └── order/[id]/page.jsx # تتبع الطلب
│   │
│   ├── (dashboard)/            # لوحة تحكم صاحب المتجر (محمية بالـ middleware)
│   │   ├── login/page.jsx      # صفحة تسجيل دخول صاحب المتجر
│   │   ├── dashboard/page.jsx  # الرئيسية
│   │   ├── orders/page.jsx     # الطلبات
│   │   └── products/page.jsx   # المنتجات
│   │
│   └── api/                    # API Routes
│       ├── products/route.js
│       ├── orders/route.js
│       ├── auth/route.js
│       ├── payments/route.js
│       ├── reviews/route.js    # ⭐ جديد
│       ├── customers/route.js  # ✅ جديد: إنشاء عميل + عنوان في Checkout
│       ├── delivery-zones/route.js # ✅ جديد: مناطق التوصيل ورسومها
│       ├── cart/
│       │   └── abandon/route.js
│       └── cron/
│           └── abandoned-cart/route.js  # ✅ Vercel Cron Job
│
├── components/
│   ├── store/
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx     # يعرض النجوم + "باقي X قطعة"
│   │   ├── CartDrawer.jsx      # ✅ السلة كـ Drawer — ليست صفحة منفصلة
│   │   ├── ImageGallery.jsx    # مهم جداً للملابس
│   │   ├── SizeGuide.jsx       # دليل المقاسات
│   │   └── ReviewStars.jsx     # ⭐ جديد — تقييمات العملاء (بـ Tailwind — بدون مكتبة)
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
