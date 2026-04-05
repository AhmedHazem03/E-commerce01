import Image from "next/image";
import Link from "next/link";

const categories = [
  { name: "ملابس فاخرة", slug: "ملابس", src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" },
  { name: "إكسسوارات وحقائب", slug: "إكسسوارات", src: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1035&auto=format&fit=crop" },
  { name: "هدايا استثنائية", slug: "هدايا", src: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1140&auto=format&fit=crop" },
];

export default function CategoryGrid() {
  return (
    <section className="w-full py-12 px-4 bg-warm-bg" dir="rtl">
      <div className="mx-auto max-w-5xl mb-8">
        <h2 className="font-cairo font-bold text-ink text-2xl md:text-3xl text-right">
          تسوق حسب الفئة
        </h2>
      </div>
      {/* Bento grid: 1 large tile left + 2 stacked tiles right on desktop */}
      <div
        className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 [grid-auto-rows:280px]"
      >
        {/* Large tile — spans 2 rows on desktop */}
        <Link
          href={`/products?category=${categories[0].slug}`}
          className="relative overflow-hidden rounded-2xl group md:row-span-2"
        >
          <Image
            fill
            src={categories[0].src}
            alt={categories[0].name}
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-walnut/80 via-walnut/20 to-transparent flex items-end p-6">
            <span className="text-warm-bg font-cairo font-black text-2xl md:text-3xl drop-shadow-lg backdrop-blur-sm bg-black/10 px-3 py-1 rounded-xl">
              {categories[0].name}
            </span>
          </div>
        </Link>
        {/* Two stacked tiles — right column on desktop */}
        {categories.slice(1).map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className="relative overflow-hidden rounded-2xl group"
          >
            <Image
              fill
              src={cat.src}
              alt={cat.name}
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-walnut/80 via-walnut/20 to-transparent flex items-end p-5">
              <span className="text-warm-bg font-cairo font-black text-xl drop-shadow-lg backdrop-blur-sm bg-black/10 px-3 py-1 rounded-xl">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

