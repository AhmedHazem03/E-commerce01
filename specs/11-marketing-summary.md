# 📊 ملخص التعديلات التسويقية

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
