import type { ComponentPropsWithRef } from "react";
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

export type BadgeProps = ComponentPropsWithRef<"span"> & Omit<VariantProps<typeof badge>, "theme">;

function BadgeRoot({ tone, uppercase, className, ...props }: BadgeProps) {
  const theme = useTheme();
  return (
    <span data-slot="badge" className={badge({ theme, tone, uppercase, className })} {...props} />
  );
}

// Fixed lime "Experimental" preset. The visual identity lives in Badge, so every
// experimental surface stays identical. Attached as a static (not a separate
// component) because it only presets props — see BadgeButton for the structurally
// distinct, standalone variant.
function Experimental(props: ComponentPropsWithRef<"span">) {
  return (
    <BadgeRoot tone="lime" {...props}>
      Experimental
    </BadgeRoot>
  );
}

export const Badge = Object.assign(BadgeRoot, { Experimental });
