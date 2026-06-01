import { Button as BaseButton } from "@base-ui/react/button";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const button = tv({
  base: [
    "inline-flex shrink-0 items-center justify-center",
    "font-display border-border rounded-[var(--radius)] shadow-[var(--shadow)]",
    "transition-all duration-100",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    theme: {
      brutal: [
        "border-2 font-bold uppercase tracking-wide",
        "active:translate-x-px active:translate-y-px",
      ],
      elegant: ["border font-medium", "active:scale-[0.98]"],
    },
    variant: {
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
    },
    size: {
      sm: ["h-7 gap-1.5 px-2.5", "text-xs"],
      md: ["h-8 gap-2 px-3", "text-sm"],
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

// Base UI types `className` as `string | ((state) => string)`; narrow it to a
// plain string so it can flow into the tv() recipe, which only accepts strings.
export type ButtonProps = Omit<BaseButton.Props, "className"> &
  Omit<VariantProps<typeof button>, "theme"> & {
    className?: string;
  };

export function Button({ variant, size, className, ...props }: ButtonProps) {
  const theme = useTheme();
  return <BaseButton className={button({ theme, variant, size, className })} {...props} />;
}
