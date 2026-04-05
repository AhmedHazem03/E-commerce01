type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="جار التحميل"
      className={[
        "inline-block animate-spin rounded-full border-primary border-t-transparent",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
