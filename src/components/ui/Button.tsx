import { ButtonHTMLAttributes, forwardRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
};

// مكوّن UI بحت — لا Business Logic هنا (راجع CLAUDE.md القسم 8)
export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className = "", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2.5
          text-sm font-semibold text-brand-fg transition-opacity
          hover:opacity-90 focus-visible:outline focus-visible:outline-2
          focus-visible:outline-offset-2 focus-visible:outline-brand
          disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
