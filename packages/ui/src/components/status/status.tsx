import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

// The DS status pixel: a square of the status colour with an ink edge. It
// never animates; a working agent is a steady light.
const status = tv({
  slots: {
    root: [
      "relative inline-block shrink-0",
      "bg-(--status-color)",
      "rounded-[2px] border-[1.5px] border-sticker-ink",
    ],
  },
  variants: {
    variant: {
      default: {
        root: "[--status-color:var(--presence-offline)]",
      },
      primary: {
        root: "[--status-color:var(--color-primary-400)]",
      },
      information: {
        root: "[--status-color:var(--color-info)]",
      },
      muted: {
        root: "[--status-color:var(--color-secondary-400)]",
      },
      accent: {
        root: "[--status-color:var(--color-accent-400)]",
      },
      success: {
        root: "[--status-color:var(--color-success)]",
      },
      warning: {
        root: "[--status-color:var(--color-warning)]",
      },
      danger: {
        root: "[--status-color:var(--color-danger)]",
      },
      // Presence: the five status lights. Each colour is a fixed meaning, and
      // each needs its word nearby (or an aria-label where there is none).
      online: {
        root: "[--status-color:var(--presence-online)]",
      },
      busy: {
        root: "[--status-color:var(--presence-busy)]",
      },
      error: {
        root: "[--status-color:var(--presence-error)]",
      },
      offline: {
        root: "[--status-color:var(--presence-offline)]",
      },
      external: {
        root: "[--status-color:var(--presence-external)]",
      },
    },
    size: {
      xs: { root: "size-1.5 rounded-[1px] border" },
      sm: { root: "size-2" },
      md: { root: "size-[9px]" },
      lg: { root: "size-[11px]" },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type StatusProps = Omit<useRender.ComponentProps<"span">, "children"> &
  VariantProps<typeof status>;

function StatusRoot({ size, variant, className, render, ...props }: StatusProps) {
  const { root } = status({ size, variant });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "status",
      variant,
      size,
    },
  });
}

export const Status = StatusRoot;
