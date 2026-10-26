import { tv } from "../../lib/tv";

export const drag = tv({
  slots: {
    lift: [
      "pointer-events-none size-full",
      "rounded-control",
      "bg-layer-popover shadow-float ring-1 ring-line-seam",
    ],
    placeholder: [
      "pointer-events-none box-border",
      "rounded-control",
      "border-[1.5px] border-dashed border-line-strong bg-fill-subtle",
    ],
    hint: [
      "pointer-events-none fixed top-0 left-0 z-70 max-w-80",
      "rounded-chip px-2 py-1",
      "font-sans text-caption",
      "bg-layer-hud text-foreground-on-hud shadow-float ring-1 ring-line-seam",
    ],
  },
  variants: {
    opaque: {
      true: {
        placeholder: [
          "bg-layer-canvas",
          "bg-[linear-gradient(var(--fill-subtle),var(--fill-subtle))]",
        ],
      },
    },
  },
});
