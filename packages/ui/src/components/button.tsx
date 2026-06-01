import type { ButtonHTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  base: [
    "inline-flex items-center justify-center",
    "rounded-md text-sm font-medium",
    "transition-colors disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary: ["bg-blue-600 hover:bg-blue-700", "text-white"],
      secondary: ["bg-gray-100 hover:bg-gray-200", "text-gray-900"],
    },
    size: {
      sm: ["px-3 py-1.5", "text-xs"],
      md: ["px-4 py-2", "text-sm"],
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>;

export function Button({ type = "button", variant, size, className, ...props }: ButtonProps) {
  return <button type={type} className={button({ variant, size, className })} {...props} />;
}
