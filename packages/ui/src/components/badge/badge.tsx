import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

export const badge = tv({
  base: [
    "inline-flex h-5 min-w-0 max-w-full items-center gap-1 px-1.5",
    "overflow-hidden whitespace-nowrap",
    "text-[10px] font-bold leading-none",
  ],
  variants: {
    theme: {
      brutal: ["border border-black"],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
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
    // Brutal renders the visual uppercase; content stays Title Case. Status badges
    // sitting next to case-sensitive identifiers (@assignee) opt out via `false`.
    uppercase: {
      true: "uppercase tracking-wide",
      false: "",
    },
  },
  defaultVariants: {
    tone: "white",
    uppercase: true,
  },
});

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  Omit<VariantProps<typeof badge>, "theme">;

export function Badge({ tone, uppercase, className, ...props }: BadgeProps) {
  const theme = useTheme();
  return (
    <span data-slot="badge" className={badge({ theme, tone, uppercase, className })} {...props} />
  );
}
