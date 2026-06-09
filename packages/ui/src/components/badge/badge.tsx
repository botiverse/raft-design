import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

export const badge = tv({
  slots: {
    root: [
      "inline-flex h-5 w-fit min-w-0 max-w-full items-center gap-1 px-1.5",
      "overflow-hidden whitespace-nowrap",
      "text-[10px] font-bold leading-none",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border border-black"],
      },
      elegant: {
        root: ["border border-border"],
      },
    },
    variant: {
      default: {
        root: "bg-neutral text-neutral-foreground",
      },
      primary: {
        root: "bg-primary text-primary-foreground",
      },
      information: {
        root: "bg-information text-information-foreground",
      },
      muted: {
        root: "bg-muted text-muted-foreground",
      },
      accent: {
        root: "bg-accent text-accent-foreground",
      },
      success: {
        root: "bg-success text-success-foreground",
      },
      warning: {
        root: "bg-warning text-warning-foreground",
      },
      destructive: {
        root: "bg-destructive text-destructive-foreground",
      },
    },
    // Enables the old brutal casing recipe when a badge should read as a compact
    // label. It defaults off so case-sensitive content stays intact.
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
    variant: "default",
    uppercase: false,
  },
});

export type BadgeProps = useRender.ComponentProps<"span"> &
  Omit<VariantProps<typeof badge>, "theme">;

function BadgeRoot({ variant, uppercase, className, render, ...props }: BadgeProps) {
  const theme = useTheme();
  const resolvedUppercase = uppercase ?? false;
  const { root } = badge({ theme, variant, uppercase: resolvedUppercase });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "badge",
      variant,
      uppercase: resolvedUppercase,
    },
  });
}

// Fixed success + uppercase "Experimental" preset. The visual identity lives in
// Badge, so every experimental surface stays identical. Attached as a static
// because it only presets props.
function Experimental(props: Omit<BadgeProps, "variant" | "uppercase">) {
  return (
    <BadgeRoot variant="success" uppercase {...props}>
      Experimental
    </BadgeRoot>
  );
}

export const Badge = Object.assign(BadgeRoot, { Experimental });
