import { Button as BaseButton } from "@base-ui/react/button";
import { tv, type VariantProps } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const button = tv({
  base: [
    "inline-flex shrink-0 items-center justify-center",
    "font-display leading-none whitespace-nowrap select-none",
    "border-border rounded-[var(--radius)]",
    "shadow-[var(--shadow)] transition-all duration-100",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-40 disabled:transform-none disabled:shadow-[var(--shadow)]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  variants: {
    theme: {
      brutal: [
        "border-2 font-bold",
        "hover:-translate-y-px hover:shadow-[var(--shadow-hover)]",
        "active:not-aria-[haspopup]:translate-x-px active:not-aria-[haspopup]:translate-y-px",
        "active:shadow-[var(--shadow-active)]",
      ],
      elegant: ["border font-medium", "active:not-aria-[haspopup]:scale-[0.98]"],
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
      xs: [
        "h-6 gap-1 px-2 text-[11px]",
        "has-data-[icon=inline-start]:pl-1.5 has-data-[icon=inline-end]:pr-1.5",
        "[&_svg:not([class*='size-'])]:size-3",
      ],
      sm: [
        "h-7 gap-1.5 px-2.5 text-xs",
        "has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2",
        "[&_svg:not([class*='size-'])]:size-3.5",
      ],
      md: [
        "h-8 gap-2 px-3 text-sm",
        "has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
      ],
      lg: [
        "h-10 gap-2 px-4 text-sm",
        "has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
      ],
      "icon-xs": ["size-6 text-[11px]", "[&_svg:not([class*='size-'])]:size-3"],
      "icon-sm": ["size-7 text-xs", "[&_svg:not([class*='size-'])]:size-3.5"],
      "icon-md": "size-8 text-sm",
      "icon-lg": "size-10 text-sm",
    },
  },
  defaultVariants: {
    tone: "white",
    size: "sm",
  },
});

export type ButtonProps = StyledProps<BaseButton.Props> &
  Omit<VariantProps<typeof button>, "theme">;

export function Button({ tone, size, className, ...props }: ButtonProps) {
  const theme = useTheme();
  return <BaseButton className={button({ theme, tone, size, className })} {...props} />;
}
