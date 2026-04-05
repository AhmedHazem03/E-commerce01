import { Star } from "lucide-react";

interface StarIconProps {
  filled: boolean;
  size?: number;
  className?: string;
}

export default function StarIcon({ filled, size = 16, className = "" }: StarIconProps) {
  return (
    <Star
      size={size}
      className={[filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-100", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    />
  );
}
