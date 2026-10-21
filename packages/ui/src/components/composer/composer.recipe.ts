import { tv } from "../../lib/tv";

export const composer = tv({
  slots: {
    root: [
      "flex w-full flex-col gap-2 p-2",
      "rounded-container border-[1.5px] px-3 pt-3 pb-[calc(var(--control-embedded-inset)-1px)]",
      "border-line-field bg-layer-card text-foreground shadow-none",
      "has-focus-visible:shadow-focus",
    ],
    input: [
      "max-h-32 w-full resize-none bg-transparent outline-none",
      "field-sizing-content overflow-y-auto",
      "min-h-6 px-0.5",
      // The DS composer input is `text-body` regular wherever it is hosted:
      // it states its weight rather than inheriting one (a thread footer's
      // caption type at 500 made its text and placeholder medium).
      "font-sans text-body font-normal text-foreground",
      "placeholder:text-foreground-hint",
    ],
    toolbar: [
      "flex items-center justify-between",
      "mx-[calc(var(--control-embedded-inset)-0.75rem-1px)] gap-2",
    ],
    actions: ["flex items-center gap-2"],
    meta: ["flex items-center", "gap-2"],
    iconButton: [
      "size-8 rounded-chip text-foreground-muted",
      "disabled:border-transparent disabled:bg-transparent",
      "aria-disabled:border-transparent aria-disabled:bg-transparent",
      "[&_svg:not([class*='size-'])]:size-4.5",
    ],
    submit: ["rounded-chip"],
  },
});
