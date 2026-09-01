import { InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

// مكوّن UI بحت — يدعم rtl/ltr تلقائياً عبر وراثة اتجاه الصفحة (لا افتراض اتجاه ثابت)
export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors
            focus:border-brand focus:ring-1 focus:ring-brand
            ${error ? "border-red-400" : "border-neutral-300"} ${className}`}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
