interface DividerProps {
  label?: string;
  className?: string;
}

export default function Divider({ label, className = "" }: DividerProps) {
  if (!label) {
    return <hr className={["border-gray-200", className].filter(Boolean).join(" ")} />;
  }

  return (
    <div className={["flex items-center gap-3", className].filter(Boolean).join(" ")}>
      <hr className="flex-1 border-gray-200" />
      <span className="text-xs text-gray-400 font-cairo whitespace-nowrap">{label}</span>
      <hr className="flex-1 border-gray-200" />
    </div>
  );
}
