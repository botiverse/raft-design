import type { HTMLAttributes } from "react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const skeleton = tv({
  slots: {
    root: ["animate-pulse", "pointer-events-none"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["data-[variant=line]:bg-ink-10", "data-[variant=block]:bg-ink-10"],
      },
      elegant: {
        root: [
          "data-[variant=line]:rounded-full data-[variant=line]:bg-foreground-strong/8",
          "data-[variant=block]:rounded-md data-[variant=block]:bg-foreground-strong/8",
        ],
      },
    },
    variant: {
      line: {
        root: "h-3",
      },
      block: {
        root: "",
      },
      circle: {
        root: "rounded-full",
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      variant: "circle",
      class: {
        root: "bg-ink-10",
      },
    },
    {
      theme: "elegant",
      variant: "circle",
      class: {
        root: "bg-foreground-strong/8",
      },
    },
  ],
  defaultVariants: {
    variant: "block",
  },
});

export type SkeletonVariant = NonNullable<VariantProps<typeof skeleton>["variant"]>;

export type SkeletonProps = HTMLAttributes<HTMLDivElement> &
  Omit<VariantProps<typeof skeleton>, "theme">;

export function Skeleton({ variant = "block", className, ...props }: SkeletonProps) {
  const theme = useThemeFamily();
  const { root } = skeleton({ theme, variant });

  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      data-variant={variant}
      className={root({ className })}
      {...props}
    />
  );
}
