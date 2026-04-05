import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50",
  secondary:
    "bg-surface text-surface-foreground border border-gray-300 hover:bg-gray-100 disabled:opacity-50",
  ghost:
    "bg-transparent text-primary hover:bg-gray-100 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      suppressHydrationWarning
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded font-cairo font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
