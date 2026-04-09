"use client";

import { useEffect, useState } from "react";

interface Props {
  endsAt: string; // ISO string
}

export default function FlashSaleCountdown({ endsAt }: Props) {
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function compute() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    }
    compute();
    const id = setInterval(compute, 1_000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (expired) return null;

  return (
    <div className="flex items-center gap-2 justify-center" dir="ltr">
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((unit, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="bg-warm-bg/20 backdrop-blur-sm text-warm-bg font-cairo font-black text-2xl md:text-3xl w-14 h-14 flex items-center justify-center rounded-xl shadow-inner tabular-nums">
            {unit}
          </span>
          {i < 2 && (
            <span className="text-warm-bg/70 font-black text-2xl animate-pulse">:</span>
          )}
        </span>
      ))}
    </div>
  );
}
