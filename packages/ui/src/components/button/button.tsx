import { Button as BaseButton } from "@base-ui/react/button";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const button = tv({
  base: [
    "inline-flex shrink-0 items-center justify-center",
    "font-display leading-none",
    "border-border rounded-[var(--radius)]",
    "shadow-[var(--shadow)] transition-all duration-100",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-40 disabled:transform-none disabled:shadow-[var(--shadow)]",
  ],
  variants: {
    theme: {
      brutal: [
        "border-2 font-bold",
        "hover:-translate-y-px hover:shadow-[var(--shadow-hover)]",
        "active:translate-x-px active:translate-y-px active:shadow-[var(--shadow-active)]",
      ],
      elegant: ["border font-medium", "active:scale-[0.98]"],
    },
    tone: {
      white: "bg-white text-black",
      yellow: "bg-brutal-yellow text-black",
      pink: "bg-brutal-pink text-black",
      cyan: "bg-brutal-cyan text-black",
      lavender: "bg-brutal-lavender text-black",
      orange: "bg-brutal-orange text-black",
      lime: "bg-brutal-lime text-black",
      red: "bg-brutal-red text-black",
      stone: "bg-brutal-stone text-black",
    },
    size: {
      xs: "text-[11px]",
      sm: "text-xs",
      md: "text-sm",
      lg: "text-sm",
    },
    shape: {
      icon: "",
      text: "",
      iconText: "",
    },
  },
  compoundVariants: [
    { shape: "icon", size: "xs", class: "size-6" },
    { shape: "icon", size: "sm", class: "size-7" },
    { shape: "icon", size: "md", class: "size-8" },
    { shape: "icon", size: "lg", class: "size-10" },
    { shape: "text", size: "xs", class: "h-6 px-2" },
    { shape: "text", size: "sm", class: "h-7 px-2.5" },
    { shape: "text", size: "md", class: "h-8 px-3" },
    { shape: "text", size: "lg", class: "h-10 px-4" },
    { shape: "iconText", size: "xs", class: "h-6 gap-1 px-2" },
    { shape: "iconText", size: "sm", class: "h-7 gap-1.5 px-2.5" },
    { shape: "iconText", size: "md", class: "h-8 gap-2 px-3" },
    { shape: "iconText", size: "lg", class: "h-10 gap-2 px-4" },
  ],
  defaultVariants: {
    tone: "yellow",
    size: "sm",
    shape: "text",
  },
});

// Base UI types `className` as `string | ((state) => string)`; narrow it to a
// plain string so it can flow into the tv() recipe, which only accepts strings.
export type ButtonProps = Omit<BaseButton.Props, "className"> &
  Omit<VariantProps<typeof button>, "theme"> & {
    className?: string;
  };

export function Button({ tone, size, shape, className, ...props }: ButtonProps) {
  const theme = useTheme();
  return <BaseButton className={button({ theme, tone, size, shape, className })} {...props} />;
}
