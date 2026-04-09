export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-lg overflow-hidden border border-gray-200 bg-white animate-pulse"
          >
            <div className="aspect-[3/4] w-full bg-gray-200" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-5 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
