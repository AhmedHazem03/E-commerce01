# 🖥️ لوحة التحكم (Dashboard)

## ✅ حماية الـ Dashboard (Middleware)

```javascript
// middleware.js — في جذر المشروع
// يحمي كل routes الـ (dashboard) تلقائياً

import { NextResponse } from 'next/server'
import { jwtVerify }    from 'jose'

export async function middleware(request) {
  const token = request.cookies.get('admin_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/orders/:path*', '/products/:path*'],
}
```

---

## الرئيسية

```
✓ كروت: مبيعات اليوم / عدد الطلبات / طلبات جديدة
✓ آخر 10 طلبات
✓ تنبيه صوتي + إشعار لكل طلب جديد
✓ ⭐ جديد — كارت "سلال متروكة" (عدد العملاء اللي دخلوا Checkout ومشيوش)
```

---

## الطلبات

```
✓ تابز: الكل / جديد / قيد التحضير / في الطريق / تم
✓ بحث برقم الطلب أو اسم العميل
✓ تغيير الحالة بكليك واحد
✓ تفاصيل الطلب كاملة
✓ ⭐ جديد — عمود "المصدر" (جاي منين: إنستجرام / واتساب / جوجل)
```

---

## المنتجات

```
✓ إضافة / تعديل / حذف
✓ رفع صور متعددة (Drag & Drop)
✓ تفعيل وإيقاف
✓ إدارة المقاسات والألوان
✓ ⭐ جديد — عرض متوسط التقييم لكل منتج
```

---

## ما يحتاجه صاحب المتجر كل يوم (3 دقائق فقط)

1. فتح لوحة التحكم — شوف الطلبات الجديدة
2. تغيير حالة الطلبات الجاهزة للتوصيل
3. مراجعة السلال المتروكة الجديدة
