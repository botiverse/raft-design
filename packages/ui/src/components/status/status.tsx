import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
import { PRESENCE_COLOR } from "../../lib/presence";
import type { Presence } from "../../lib/presence";
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
        root: "[--status-color:var(--brand-400)]",
      },
      information: {
        root: "[--status-color:var(--info)]",
      },
      muted: {
        root: "[--status-color:var(--secondary-400)]",
      },
      accent: {
        root: "[--status-color:var(--attention-400)]",
      },
      success: {
        root: "[--status-color:var(--success)]",
      },
      warning: {
        root: "[--status-color:var(--warning)]",
      },
      danger: {
        root: "[--status-color:var(--danger)]",
      },
    },
    size: {
      xs: { root: "size-1.5 rounded-[1px] border" },
      sm: { root: "size-2" },
      md: { root: "size-2.5" },
      lg: { root: "size-[11px]" },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type StatusProps = Omit<useRender.ComponentProps<"span">, "children"> &
  VariantProps<typeof status> & {
    /** A status light (online, busy, error, offline, external): a fixed
     *  meaning that needs its word nearby, or an aria-label. It takes the
     *  place of `variant`'s colour. */
    presence?: Presence;
  };

function StatusRoot({ size, variant, presence, className, render, ...props }: StatusProps) {
  const { root } = status({ size, variant });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className: cn(presence && PRESENCE_COLOR[presence], className) }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "status",
      variant,
      presence,
      size,
    },
  });
}

export const Status = StatusRoot;
