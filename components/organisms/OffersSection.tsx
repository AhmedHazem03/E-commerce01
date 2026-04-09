import { getDiscountedProducts, getProducts } from "@/lib/services/product.service";
import ProductGrid from "@/components/organisms/ProductGrid";
import Link from "next/link";

interface Props {
  title: string;
  limit: number;
}

export default async function OffersSection({ title, limit }: Props) {
  let products;
  let isActualOffers = true;
  try {
    products = await getDiscountedProducts(limit);
    // Fallback to best sellers if no discounted products
    if (!products.length) {
      const fallback = await getProducts({ limit, sortBy: "sold" });
      products = fallback.products;
      isActualOffers = false;
    }
  } catch {
    return null;
  }
  if (!products.length) return null;

  return (
    <section className="w-full py-14 px-4 bg-gradient-to-br from-plum/5 via-warm-bg to-gold/5" dir="rtl">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-cairo font-bold text-ink text-2xl md:text-3xl">
              {title}
            </h2>
            <p className="font-cairo text-ink/60 text-sm mt-1">
              {isActualOffers
                ? "أسعار مخفّضة لفترة محدودة — لا تفوتيها!"
                : "منتجاتنا الأكثر مبيعًا"}
            </p>
          </div>
          <Link
            href="/products"
            className="font-cairo text-plum text-sm font-semibold hover:underline underline-offset-2 transition-all"
          >
            عرض الكل ←
          </Link>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
