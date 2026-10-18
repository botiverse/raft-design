import type { HTMLAttributes } from "react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

const skeleton = tv({
  slots: {
    root: [
      "animate-pulse motion-reduce:animate-none",
      "pointer-events-none",
      "data-[variant=line]:rounded-sticker data-[variant=line]:bg-fill-muted",
      "data-[variant=block]:rounded-sticker data-[variant=block]:bg-fill-muted",
    ],
  },
  variants: {
    variant: {
      line: {
        root: "h-3",
      },
      block: {
        root: "",
      },
      circle: {
        root: ["rounded-sticker bg-fill-muted"],
      },
    },
  },
  defaultVariants: {
    variant: "block",
  },
});

export type SkeletonVariant = NonNullable<VariantProps<typeof skeleton>["variant"]>;

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof skeleton>;

export function Skeleton({ variant = "block", className, ...props }: SkeletonProps) {
  const { root } = skeleton({ variant });

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
