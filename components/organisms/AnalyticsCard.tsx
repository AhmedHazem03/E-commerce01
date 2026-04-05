// components/organisms/AnalyticsCard.tsx
// Metric card: label + value + trend indicator.

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AnalyticsCardProps {
  label: string;
  value: string | number;
  /** positive = up, negative = down, 0 or undefined = neutral */
  trend?: number;
  /** Optional subtitle or description */
  sub?: string;
}

export default function AnalyticsCard({ label, value, trend, sub }: AnalyticsCardProps) {
  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
      ? TrendingUp
      : TrendingDown;

  const trendColor =
    trend === undefined || trend === 0
      ? "text-gray-400"
      : trend > 0
      ? "text-green-500"
      : "text-[--danger]";

  return (
    <div className="bg-white rounded-2xl border border-[--surface] p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[--text-muted]">{label}</span>
        <TrendIcon size={18} className={trendColor} />
      </div>
      <div className="text-3xl font-bold text-[--text]">{value}</div>
      {sub && <div className="text-xs text-[--text-muted]">{sub}</div>}
    </div>
  );
}
