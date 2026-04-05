import { getProducts } from "@/lib/services/product.service";
import ProductGrid from "@/components/organisms/ProductGrid";
import Link from "next/link";

export default async function BestSellers() {
  try {
    const { products } = await getProducts({ limit: 4, sortBy: "sold" });
    if (!products.length) return null;
    return (
      <section className="w-full py-12 px-4 bg-warm-bg" dir="rtl">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-cairo font-bold text-ink text-2xl md:text-3xl text-right">
              الأكثر مبيعًا
            </h2>
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
  } catch (err) {
    console.error("[BestSellers] Failed to load products:", err);
    return null;
  }
}
