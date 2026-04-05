interface StockBadgeProps {
  stock: number;
}

export default function StockBadge({ stock }: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500 font-cairo">
        نفد المخزون
      </span>
    );
  }

  if (stock < 5) {
    return (
      <span className="inline-flex items-center rounded-full bg-danger text-danger-foreground px-2.5 py-0.5 text-xs font-semibold font-cairo">
        باقي {stock} قطع بس!
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 font-cairo">
      متاح
    </span>
  );
}
