import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

export const badge = tv({
  slots: {
    root: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 px-1.5",
      "overflow-hidden whitespace-nowrap",
      "text-[10px] font-bold leading-none",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border border-black"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    tone: {
      white: {
        root: "bg-white text-black",
      },
      yellow: {
        root: "bg-brutal-yellow text-black",
      },
      pink: {
        root: "bg-brutal-pink text-black",
      },
      cyan: {
        root: "bg-brutal-cyan text-black",
      },
      lavender: {
        root: "bg-brutal-lavender text-black",
      },
      orange: {
        root: "bg-brutal-orange text-black",
      },
      lime: {
        root: "bg-brutal-lime text-black",
      },
      red: {
        root: "bg-brutal-red text-black",
      },
      stone: {
        root: "bg-brutal-stone text-black",
      },
    },
    // Brutal renders the visual uppercase; content stays Title Case. Status badges
    // sitting next to case-sensitive identifiers (@assignee) opt out via `false`.
    uppercase: {
      true: {
        root: "uppercase tracking-wide",
      },
      false: {
        root: "",
      },
    },
  },
  defaultVariants: {
    tone: "white",
    uppercase: true,
  },
});

export type BadgeProps = useRender.ComponentProps<"span"> &
  Omit<VariantProps<typeof badge>, "theme">;

function BadgeRoot({ tone, uppercase, className, render, ...props }: BadgeProps) {
  const theme = useTheme();
  const { root } = badge({ theme, tone, uppercase });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "badge",
      tone,
      uppercase,
    },
  });
}

// Fixed lime "Experimental" preset. The visual identity lives in Badge, so every
// experimental surface stays identical. Attached as a static because it only
// presets props.
function Experimental(props: Omit<BadgeProps, "tone" | "uppercase">) {
  return (
    <BadgeRoot tone="lime" {...props}>
      Experimental
    </BadgeRoot>
  );
}

export const Badge = Object.assign(BadgeRoot, { Experimental });
