import { HTMLAttributes } from "react";

type BadgeVariant = "primary" | "danger" | "success" | "warning" | "gray";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary text-primary-foreground",
  danger: "bg-danger text-danger-foreground",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  gray: "bg-gray-100 text-gray-700",
};

export default function Badge({
  variant = "primary",
  className = "",
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-cairo",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}
