interface PriceDisplayProps {
  price: number;
  oldPrice?: number | null;
  className?: string;
}

export default function PriceDisplay({ price, oldPrice, className = "" }: PriceDisplayProps) {
  return (
    <div className={["flex items-center gap-2 font-cairo", className].filter(Boolean).join(" ")}>
      <span className="font-bold text-primary">
        {price.toFixed(2)} <span className="text-sm font-normal">ج.م</span>
      </span>
      {oldPrice != null && oldPrice > price && (
        <span className="text-sm text-gray-400 line-through">
          {oldPrice.toFixed(2)} ج.م
        </span>
      )}
    </div>
  );
}
