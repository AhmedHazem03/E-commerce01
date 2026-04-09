"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  text: string;
}

export default function AnnouncementBar({ text }: Props) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div
      className="relative w-full bg-plum text-warm-bg text-center text-sm font-cairo font-semibold py-2.5 px-10 z-50"
      dir="rtl"
    >
      {text}
      <button
        onClick={() => setClosed(true)}
        aria-label="إغلاق"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-bg/70 hover:text-warm-bg transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
