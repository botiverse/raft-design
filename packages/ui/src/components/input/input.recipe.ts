import { tv } from "../../lib/tv";

export const input = tv({
  slots: {
    // `text-field` / `font-field` carry the field type (size, line-height and
    // weight); the 44px height is the control's, not the type's.
    root: [
      "h-11 w-full px-3 py-0 font-heading text-field font-field outline-none",
      "rounded-control border-[1.5px] border-line-strong bg-layer-card",
      "text-foreground placeholder:text-foreground-placeholder",
      "shadow-none transition-shadow duration-90 ease-out focus:shadow-raft-focus",
      "data-invalid:border-danger-strong",
      "disabled:cursor-not-allowed disabled:border-line-muted disabled:bg-fill-muted disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
    ],
  },
});
