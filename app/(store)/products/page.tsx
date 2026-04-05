import { Suspense } from "react";
import ProductGrid from "@/components/organisms/ProductGrid";
import ProductGridSkeleton from "@/components/organisms/ProductGridSkeleton";
import { getProducts } from "@/lib/services/product.service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المنتجات",
  description: "تصفح جميع منتجاتنا",
};

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

async function ProductList({ category, page }: { category?: string; page?: number }) {
  const { products } = await getProducts({ category, page, limit: 20 });
  return <ProductGrid products={products} />;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;
  const page = params.page ? Number(params.page) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-cairo text-gray-900">
          {category ? `${category}` : "جميع المنتجات"}
        </h1>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductList category={category} page={page} />
      </Suspense>
    </div>
  );
}
