import { getDiscountedProducts, getProducts } from "@/lib/services/product.service";
import ProductCard from "@/components/organisms/ProductCard";
import { DynamicFlashSaleCountdown } from "@/components/organisms/DynamicClientSections";
import Link from "next/link";

interface Props {
  title: string;
  endsAt: string;
}

export default async function FlashSale({ title, endsAt }: Props) {
  let products;
  try {
    products = await getDiscountedProducts(4);
    // Fallback to best sellers if no discounted products
    if (!products.length) {
      const fallback = await getProducts({ limit: 4, sortBy: "sold" });
      products = fallback.products;
    }
  } catch {
    return null;
  }
  if (!products.length) return null;

  return (
    <section
      className="w-full py-14 px-4 bg-gradient-to-br from-walnut via-plum to-walnut"
      dir="rtl"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-10 text-center">
          <span className="bg-gold text-ink font-cairo font-black text-sm px-4 py-1.5 rounded-full animate-pulse shadow">
            ⏱ عرض محدود الوقت
          </span>
          <h2 className="font-cairo font-black text-warm-bg text-3xl md:text-4xl leading-tight">
            {title}
          </h2>
          <DynamicFlashSaleCountdown endsAt={endsAt} />
        </div>

        {/* Products horizontal scroll on mobile, grid on desktop */}
        <div className="hidden md:grid md:grid-cols-4 gap-5">
          {products.map((product) => (
            <div key={product.id} className="relative">
              {product.oldPrice && (
                <div className="absolute top-3 right-3 z-10 bg-gold text-ink font-cairo font-black text-xs px-2 py-0.5 rounded-full shadow">
                  -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}٪
                </div>
              )}
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-4" style={{ width: "max-content" }}>
            {products.map((product) => (
              <div key={product.id} className="w-[200px] shrink-0 relative">
                {product.oldPrice && (
                  <div className="absolute top-3 right-3 z-10 bg-gold text-ink font-cairo font-black text-xs px-2 py-0.5 rounded-full shadow">
                    -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}٪
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Link
            href="/products?hasDiscount=true"
            className="font-cairo font-bold text-walnut bg-gold hover:bg-warm-bg px-10 py-3.5 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
          >
            شوفي كل العروض
          </Link>
        </div>
      </div>
    </section>
  );
}
