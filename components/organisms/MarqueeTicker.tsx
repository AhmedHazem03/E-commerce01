"use client";

interface Props {
  items: string[];
}

export default function MarqueeTicker({ items }: Props) {
  // Duplicate items so the loop appears seamless
  const doubled = [...items, ...items];

  return (
    <div
      className="w-full bg-walnut text-warm-bg overflow-hidden py-2.5 select-none"
      dir="ltr"
      aria-hidden="true"
    >
      <div className="flex gap-10 whitespace-nowrap animate-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="font-cairo font-semibold text-sm shrink-0">
            {item}
            <span className="mx-4 opacity-40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
