import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...rest }, ref) => {
    const inputId = id ?? label;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          dir="rtl"
          className={[
            "w-full rounded border px-3 py-2 text-sm font-cairo bg-white text-gray-900 placeholder:text-gray-400 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            error ? "border-danger" : "border-gray-300",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
        {error && (
          <span className="text-xs text-danger" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
