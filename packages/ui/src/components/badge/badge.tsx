import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

export const badge = tv({
  slots: {
    root: [
      "inline-flex h-[22px] w-fit min-w-0 max-w-full shrink-0 items-center gap-1 overflow-hidden whitespace-nowrap rounded-chip px-1.5",
      "font-sans text-caption font-semibold normal-case tracking-normal",
      "transition-[filter,opacity] duration-100",
      "[&_svg]:size-3.5 [&_svg]:shrink-0 [&_[data-slot='spinner']]:size-3 [&_[data-slot='spinner']]:text-xs",
      "*:data-[slot=status]:lead-dot",
      "disabled:cursor-not-allowed disabled:bg-fill-muted disabled:text-foreground-disabled disabled:opacity-100 disabled:inset-ring-0",
    ],
  },
  variants: {
    appearance: {
      // A sticker: a count or a mark that waits for you, with an ink edge.
      solid: {
        root: [
          "h-5 min-w-5 justify-center rounded-sticker",
          "font-bold tabular-nums",
          "text-sticker-ink inset-ring-[1.5px] inset-ring-sticker-ink ring-[1.5px] ring-sticker-edge",
          "[&_svg]:size-[13px]",
          "enabled:hover:overlay-sticker-medium enabled:active:overlay-sticker-medium",
        ],
      },
      // A soft fill: a highlight, with no edge.
      soft: {
        root: ["text-foreground", "enabled:hover:overlay-medium enabled:active:overlay-medium"],
      },
      // A hairline label in machine type.
      outline: {
        root: [
          "font-mono text-mono-meta font-normal",
          "bg-transparent text-foreground-muted inset-ring inset-ring-line-hairline",
          "enabled:hover:bg-fill-medium enabled:active:bg-fill-medium",
        ],
      },
    },
    // The tone; each appearance gives it its own colour below.
    variant: {
      default: "",
      primary: "",
      you: "",
      information: "",
      muted: "",
      accent: "",
      success: "",
      warning: "",
      danger: "",
    },
  },
  defaultVariants: {
    appearance: "solid",
    variant: "default",
  },
  compoundVariants: [
    { appearance: "solid", variant: "default", class: { root: "bg-sticker-paper" } },
    { appearance: "solid", variant: "muted", class: { root: "bg-inactive" } },
    { appearance: "solid", variant: "primary", class: { root: "bg-brand" } },
    { appearance: "solid", variant: "you", class: { root: "bg-you" } },
    { appearance: "solid", variant: "information", class: { root: "bg-info" } },
    {
      appearance: "solid",
      variant: "accent",
      class: { root: "bg-attention font-mono text-mono-meta" },
    },
    { appearance: "solid", variant: "success", class: { root: "bg-success" } },
    { appearance: "solid", variant: "warning", class: { root: "bg-warning" } },
    { appearance: "solid", variant: "danger", class: { root: "bg-danger" } },
    { appearance: "soft", variant: "default", class: { root: "bg-fill-muted" } },
    { appearance: "soft", variant: "muted", class: { root: "bg-inactive-soft" } },
    { appearance: "soft", variant: "primary", class: { root: "bg-brand-soft" } },
    { appearance: "soft", variant: "information", class: { root: "bg-info-soft" } },
    { appearance: "soft", variant: "accent", class: { root: "bg-attention-soft" } },
    { appearance: "soft", variant: "success", class: { root: "bg-success-soft" } },
    { appearance: "soft", variant: "warning", class: { root: "bg-warning-soft" } },
    { appearance: "soft", variant: "danger", class: { root: "bg-danger-soft" } },
    { appearance: "outline", variant: "primary", class: { root: "text-brand-strong" } },
    { appearance: "outline", variant: "information", class: { root: "text-info-strong" } },
    { appearance: "outline", variant: "accent", class: { root: "text-attention-strong" } },
    { appearance: "outline", variant: "success", class: { root: "text-success-strong" } },
    { appearance: "outline", variant: "warning", class: { root: "text-warning-strong" } },
    { appearance: "outline", variant: "danger", class: { root: "text-danger-strong" } },
  ],
});

export type BadgeProps = useRender.ComponentProps<"span"> & VariantProps<typeof badge>;

function BadgeRoot({ appearance, variant, className, render, ...props }: BadgeProps) {
  const resolvedAppearance = appearance ?? "solid";
  const { root } = badge({ appearance: resolvedAppearance, variant });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "badge",
      appearance: resolvedAppearance,
      variant,
    },
  });
}

// A fixed success "Experimental" label. The look lives in Badge, so every
// experimental surface stays identical. Attached as a static because it only
// presets props.
function Experimental(props: Omit<BadgeProps, "appearance" | "variant">) {
  return (
    <BadgeRoot variant="success" {...props}>
      Experimental
    </BadgeRoot>
  );
}

export const Badge = Object.assign(BadgeRoot, { Experimental });
