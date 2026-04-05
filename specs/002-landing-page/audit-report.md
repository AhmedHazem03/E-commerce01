# 🔍 تقرير تدقيق Landing Page — Warm Luxury Store
**التاريخ**: 2026-04-05 | **المُدقق**: Senior UI Review | **الفرع**: `002-landing-page`

---

## ملخص تنفيذي

| الفئة | الحالة | عدد المشاكل |
|-------|--------|-------------|
| 🔴 أخطاء حرجة | تحتاج إصلاح فوري | 6 |
| 🟠 أخطاء متوسطة | تؤثر على UX | 8 |
| 🟡 مخالفات للمواصفات | انحراف عن spec.md | 5 |
| 🔵 توصيات 2026 | رفع مستوى الواجهة | 9 |

---

## 🔴 الأخطاء الحرجة (Critical Bugs)

### BUG-001 — `DynamicClientSections.tsx` يكسر GATE-LP-4
**الملف**: `components/organisms/DynamicClientSections.tsx`
**الخطورة**: 🔴 حرجة

المشكلة: هذا الملف يحتوي على `"use client"` وهو رابع ملف — المواصفة تشترط بالضبط 3 ملفات فقط (Scrollytelling, UGCWall, StickyMobileCTA).

```diff
- "use client"; // ❌ رابع "use client" يكسر GATE-LP-4
- import dynamic from "next/dynamic";
- export const DynamicScrollytelling = dynamic(...)
```

**الإصلاح**: نقل dynamic() مباشرة لـ page.tsx (Server Component — بدون "use client") وحذف الملف.

```tsx
// ✅ في page.tsx مباشرةً — next/dynamic مسموح في Server Components
import dynamic from 'next/dynamic';
const Scrollytelling = dynamic(() => import('@/components/organisms/Scrollytelling'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-warm-bg" />
});
```

---

### BUG-002 — Cairo font لا تُطبَّق على body (يسبب CLS)
**الملف**: `app/layout.tsx`
**الخطورة**: 🔴

```diff
- <body>{children}</body>
+ <body className={`${cairo.variable} font-cairo antialiased`}>{children}</body>
```

`cairo.variable` يضع `--font-cairo` كـ CSS variable على `<html>` فقط. `font-cairo` class مطلوبة على `<body>` لتطبيق الـ font فعلاً عبر Tailwind.

---

### BUG-003 — `ProductGridSkeleton` layout يختلف عن BestSellers (CLS)
**الخطورة**: 🔴

```
Skeleton:    grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
BestSellers: ProductGrid (layout مختلف)
```
تحول مفاجئ في الشبكة عند hydration = CLS violation يكسر SC-002.

**الإصلاح**: Skeleton يجب أن يُغلَّف بنفس `<section>` + نفس grid class كـ BestSellers.

---

### BUG-004 — `Scrollytelling` dynamic import بدون loading fallback (Risk R4)
**الخطورة**: 🔴 — blank section مرئي للـ 3G users

مذكور في plan.md R4 لكن لم يُنفَّذ:

```diff
export const DynamicScrollytelling = dynamic(
  () => import("@/components/organisms/Scrollytelling"),
- { ssr: false }
+ { ssr: false, loading: () => <div className="min-h-screen bg-warm-bg" /> }
);
```

---

### BUG-005 — `UGCWall` مفقود منه `dir="rtl"` على `<Swiper>` (Risk R5)
**الملف**: `components/organisms/UGCWall.tsx`
**الخطورة**: 🔴

```diff
<Swiper
  modules={[Autoplay, Pagination]}
+ dir="rtl"
  autoplay={{ delay: 3000 }}
>
```

بدون هذا، swipe direction معكوس في RTL — المستخدم يسحب يميناً لكن الشريحة تتحرك يساراً.

---

### BUG-006 — Missing CSS variables في globals.css
**الملف**: `app/globals.css`
**الخطورة**: 🔴

`tailwind.config.ts` يُشير لـ `var(--primary)`, `var(--danger)`, `var(--surface)`, `var(--radius)`, `var(--spacing-*)` لكنها غير معرّفة — أي مكون يستخدمها يرث transparent/undefined.

```css
/* يجب إضافة في :root */
--primary: #8B2E5A;
--primary-foreground: #F0EEE9;
--danger: #DC2626;
--danger-foreground: #FFFFFF;
--surface: #FFFFFF;
--surface-foreground: #1A1A1A;
--radius: 0.5rem;
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
```

---

## 🟠 الأخطاء المتوسطة (Medium Bugs)

### BUG-007 — Cairo font بدون `weight` (bold/black لن يظهرا صح)
**الملف**: `app/layout.tsx`

```diff
const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
+ weight: ['400', '600', '700', '900'],
});
```

---

### BUG-008 — HeroSection CTA زر `rounded-lg` بدلاً من `rounded-full`
**الملف**: `components/organisms/HeroSection.tsx`

الـ spec تقول `rounded-full` (pill shape) للـ CTA الرئيسي — يُعطي look أكثر حداثة.

---

### BUG-009 — HeroSection headline: مفقود `font-black`, `text-warm-bg`, `lg:text-7xl`
**الملف**: `components/organisms/HeroSection.tsx`

| الكود الحالي | المطلوب في spec |
|---|---|
| `font-bold` | `font-black` (weight 900) |
| `text-white` | `text-warm-bg` (token صحيح) |
| `md:text-6xl` | `md:text-6xl lg:text-7xl` |

---

### BUG-010 — `SocialProofBar` ترتيب العناصر
الـ spec يقول: **اليسار (RTL-start): +5000 طلب | الوسط: النجوم | اليمين: صُمم بحب في مصر**
الكود الحالي: النجوم أول — يجب مراجعة الترتيب البصري.

---

### BUG-011 — `BestSellers` heading `text-center` بدلاً من `text-right`
**spec**: `text-right` — يتناسق مع RTL layout.

---

### BUG-012 — `FinalCTA` زر يستخدم `bg-plum` على `bg-walnut` (contrast ضعيف)
**plan.md**: `bg-gold text-ink hover:bg-plum hover:text-warm-bg`  
Gold على Walnut = contrast أعلى وأجمل بصرياً.

---

### BUG-013 — `CategoryGrid` bento layout مكسور على desktop
`aspect-square + md:row-span-2` يتعارضان — الصورة الكبيرة لا تملأ الـ 2 rows بشكل صحيح.

**الإصلاح**:
```tsx
// الـ grid container:
className="grid grid-cols-1 md:grid-cols-2 gap-4 [grid-auto-rows:280px]"

// الصورة الكبيرة:
className="relative overflow-hidden rounded-2xl group md:row-span-2"
// بدون aspect-square
```

---

### BUG-014 — `UGCWall` heading `text-center` غير متناسق مع RTL
```diff
- <h2 className="... text-center">إطلالات عملائنا</h2>
+ <h2 className="... text-right">إطلالات عملائنا</h2>
```

---

## 🟡 مخالفات المواصفات (Spec Violations)

### SPEC-001 — `ProductGridSkeleton` غير مُغلَّف بـ section wrapper مطابق
عند ظهور Skeleton كـ Suspense fallback، لا يوجد py-10/heading — layout shift عند hydration.

### SPEC-002 — `Scrollytelling` key يعتمد على image path (قد يتكرر)
```diff
- key={section.image}
+ key={index}
```
`sections[3].image = "/hero/hero-main.jpg"` نفس الـ Hero — React key conflict محتمل.

### SPEC-003 — `page.tsx` لا يحتوي على metadata خاصة بالـ homepage
لا يوجد `export const metadata` — صفحة الـ homepage ترث metadata العامة فقط.

### SPEC-004 — `TrustSection` بدون section heading عنوان
بقية الأقسام كلها لها `<h2>` إلا TrustSection.

### SPEC-005 — Instagram URL في `UGCWall` تُقرأ من `process.env` في Client Component
في production (Next.js 16+)، `NEXT_PUBLIC_*` variables تُحقن في build time — لا مشكلة فعلية لكن يُفضَّل التوثيق.

---

## 🔵 توصيات 2026 — رفع مستوى الواجهة

### REC-001 — Hero: shimmer effect على CTA button
```tsx
className="relative overflow-hidden before:absolute before:inset-0 before:bg-white/10 
           before:translate-x-[-100%] hover:before:translate-x-[100%] 
           before:transition-transform before:duration-700 before:ease-out"
```

### REC-002 — Hero: scroll indicator (chevron متحرك للأسفل)
يدل الزائر على التمرير — رفع engagement بشكل مثبت.

### REC-003 — SocialProofBar: animated count-up لـ "+5000"
يزيد المصداقية ويجذب الانتباه — `useEffect` مع `requestAnimationFrame`.

### REC-004 — CategoryGrid: gradient overlay أوسع مع glassmorphism
```tsx
className="absolute inset-0 bg-gradient-to-t from-walnut/80 via-black/10 to-transparent"
// + اسم الفئة بـ backdrop-blur-sm للـ label
```

### REC-005 — TrustSection: cards مع hover effect
```tsx
<div className="p-6 rounded-2xl hover:bg-walnut/5 hover:shadow-md transition-all duration-300">
```

### REC-006 — BestSellers: "عرض الكل ←" link
```tsx
<div className="flex items-center justify-between mb-6">
  <h2>الأكثر مبيعًا</h2>
  <Link href="/products" className="text-plum text-sm hover:underline">عرض الكل ←</Link>
</div>
```

### REC-007 — FinalCTA: urgency badge متحرك
```tsx
<span className="animate-bounce inline-block bg-gold text-ink text-xs font-bold px-3 py-1 rounded-full mb-4">
  🔥 الكميات تنفد بسرعة
</span>
```

### REC-008 — StickyMobileCTA: slide-up entrance animation
```tsx
// استخدام framer-motion AnimatePresence لـ smooth slide-up
<motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}>
```

### REC-009 — OpenGraph metadata للـ homepage
```tsx
export const metadata: Metadata = {
  title: "متجر الأزياء المصرية الفاخرة | ملابس وإكسسوارات وهدايا",
  description: "اكتشفي أحدث تشكيلات الأزياء المصرية الفاخرة. شحن سريع لكل مكان في مصر.",
  openGraph: { images: ['/hero/hero-main.jpg'], locale: 'ar_EG' },
};
```

---

## 📋 خريطة الإصلاحات بالأولوية

```
🔴 أولوية 1 — فوري (قبل أي عرض):
├── BUG-001: نقل dynamic() لـ page.tsx + حذف DynamicClientSections.tsx
├── BUG-002: font-cairo على <body>
├── BUG-005: dir="rtl" على <Swiper>
└── BUG-006: CSS variables في globals.css

🟠 أولوية 2 — خلال يومين:
├── BUG-003: إصلاح Skeleton CLS
├── BUG-004: loading fallback للـ Scrollytelling
├── BUG-007: font weights للـ Cairo
├── BUG-008+09: rounded-full + font-black + lg:text-7xl للـ hero
├── BUG-011: text-right للـ BestSellers heading
└── BUG-012: bg-gold للـ FinalCTA button

🔵 أولوية 3 — للمستوى 2026:
├── REC-002: scroll indicator في الـ hero
├── REC-005: hover cards في TrustSection
├── REC-006: "عرض الكل" في BestSellers
├── REC-007: urgency badge في FinalCTA
└── REC-009: OpenGraph metadata
```

---

## ✅ ما تم بشكل صحيح — نقاط القوة

| العنصر | التقييم |
|--------|---------|
| تسلسل الأقسام الـ 8 | ✅ FR-031 محقق بالضبط |
| `next/image` في كل مكان | ✅ GATE-LP-1 محقق |
| ألوان Tailwind tokens فقط | ✅ GATE-LP-2 محقق (لا hex في TSX) |
| `<Suspense>` حول BestSellers | ✅ GATE-LP-3 محقق |
| StickyMobileCTA IntersectionObserver | ✅ cleanup صحيح |
| graceful degradation BestSellers | ✅ try/catch → null |
| framer-motion exact pin | ✅ "11.18.2" بدون ^ أو ~ |
| `dir="rtl"` على html + main | ✅ GATE-LP-7 |
| hero sentinel للـ IntersectionObserver | ✅ في DOM قبل hydration |
| mobile-first CSS | ✅ base → md → lg |
| Instagram URL في env var | ✅ GATE-8 |
| لا Prisma في components | ✅ GATE-LP-5 |

