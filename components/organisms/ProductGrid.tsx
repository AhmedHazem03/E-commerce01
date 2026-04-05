import ProductCard from "@/components/organisms/ProductCard";
import type { ProductListItem } from "@/lib/services/product.service";

interface ProductGridProps {
  products: ProductListItem[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-lg font-cairo">لا توجد منتجات حالياً</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
