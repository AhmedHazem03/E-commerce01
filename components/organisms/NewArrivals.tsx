import { getNewArrivals, getProducts } from "@/lib/services/product.service";
import ProductCard from "@/components/organisms/ProductCard";
import Link from "next/link";

interface Props {
  title: string;
  limit: number;
}

export default async function NewArrivals({ title, limit }: Props) {
  let products;
  try {
    products = await getNewArrivals(limit);
    // Fallback to any active products if none found
    if (!products.length) {
      const fallback = await getProducts({ limit });
      products = fallback.products;
    }
  } catch {
    return null;
  }
  if (!products.length) return null;

  return (
    <section className="w-full py-12 bg-warm-bg" dir="rtl">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-cairo font-bold text-ink text-2xl md:text-3xl">
            {title}
          </h2>
          <Link
            href="/products?sort=newest"
            className="font-cairo text-plum text-sm font-semibold hover:underline underline-offset-2 transition-all"
          >
            عرض الكل ←
          </Link>
        </div>
      </div>
      {/* Horizontal scroll container */}
      <div className="px-4 md:px-8 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4" style={{ width: "max-content" }}>
          {products.map((product) => (
            <div key={product.id} className="w-[220px] md:w-[260px] shrink-0 relative">
              {/* "جديد" badge */}
              <div className="absolute top-3 right-3 z-10 bg-plum text-warm-bg font-cairo font-bold text-xs px-2.5 py-1 rounded-full shadow">
                ✨ جديد
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
