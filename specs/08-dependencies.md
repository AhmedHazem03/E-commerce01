# 📦 المكتبات المطلوبة (Dependencies)

```json
{
  "dependencies": {
    "next":             "14.2.29",
    "react":            "18.3.1",
    "react-dom":        "18.3.1",
    "@prisma/client":   "5.22.0",
    "tailwindcss":      "3.4.17",
    "swiper":           "11.1.15",
    "zustand":          "4.5.5",
    "react-hot-toast":  "2.4.1",
    "cloudinary":       "2.5.1",
    "jsonwebtoken":     "9.0.2",
    "axios":            "1.7.9",
    "lucide-react":     "0.468.0"
  },
  "devDependencies": {
    "prisma":           "5.22.0",
    "@types/jsonwebtoken": "9.0.7"
  }
}
```

> ⚠️ ولا تستخدم `"latest"` في الـ Production — أي update ممكن يكسر الـ app.
> دايماً حدد إصدارات ثابتة (**pinned versions**).

---

## المكتبات حسب الوظيفة

| المكتبة | الوظيفة |
|---|---|
| `next 14.2.29` | Framework الأساسي (App Router) |
| `tailwindcss 3.4` | التصميم |
| `prisma 5.22` | قاعدة البيانات ORM |
| `zustand 4.5` | إدارة الـ State (السلة) |
| `swiper 11` | Slider صور المنتج |
| `lucide-react 0.468` | ✅ بديل react-stars — أيقونات النجوم بـ Tailwind (لا تحتاج مكتبة منفصلة) |
| `react-hot-toast 2.4` | Toast Notifications |
| `cloudinary 2.5` | رفع وتخزين الصور |
| `jsonwebtoken 9.0` | JWT للمصادقة (Dashboard) |
| `axios 1.7` | HTTP requests |
