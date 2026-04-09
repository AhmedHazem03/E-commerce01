interface ProductGridSkeletonProps {
  count?: number;
}

export default function ProductGridSkeleton({
  count = 8,
}: ProductGridSkeletonProps) {
  return (
    // Section wrapper matches BestSellers exactly to prevent CLS on hydration
    <section className="w-full py-12 px-4 bg-warm-bg" dir="rtl">
      <div className="mx-auto max-w-5xl">
        {/* Skeleton heading matching BestSellers header row */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 bg-walnut/15 rounded-lg w-36 animate-pulse" />
          <div className="h-4 bg-walnut/10 rounded w-16 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl overflow-hidden border border-walnut/10 bg-white animate-pulse"
            >
              <div className="aspect-[3/4] w-full bg-walnut/10" />
              <div className="flex flex-col gap-2 p-3">
                <div className="h-4 bg-walnut/10 rounded w-3/4" />
                <div className="h-3 bg-walnut/10 rounded w-1/2" />
                <div className="h-5 bg-walnut/10 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
