import { tv } from "../../lib/tv";

export const input = tv({
  slots: {
    // `text-field` / `font-field` carry the field type (size, line-height and
    // weight); the height is the control's (`h-control`), not the type's.
    root: [
      "h-control w-full px-3 py-0 font-heading text-field font-field outline-none",
      "rounded-control border-[1.5px] border-line-strong bg-layer-card",
      "text-foreground placeholder:text-foreground-hint",
      "shadow-none transition-shadow duration-90 ease-out focus-visible:shadow-focus",
      "data-invalid:border-danger-strong",
      "disabled:cursor-not-allowed disabled:border-line-hairline disabled:bg-fill-muted disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
    ],
  },
});
