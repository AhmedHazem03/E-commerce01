import StarIcon from "@/components/atoms/StarIcon";

interface ReviewStarsProps {
  averageRating: number | null;
  count?: number;
  size?: number;
}

export default function ReviewStars({ averageRating, count, size = 16 }: ReviewStarsProps) {
  const rating = averageRating ?? 0;
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" aria-label={`تقييم ${rating.toFixed(1)} من 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon key={i} filled={i <= rounded} size={size} />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500 font-cairo">({count})</span>
      )}
    </div>
  );
}
