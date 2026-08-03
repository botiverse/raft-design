import { tv } from "../../lib/tv";

export const filterTrigger = tv({
  variants: {
    theme: {
      brutal: [
        "border-black/30 bg-layer-panel text-black/70 shadow-none",
        "hover:border-black hover:bg-layer-panel hover:shadow-none",
        "disabled:cursor-not-allowed disabled:bg-layer-panel disabled:text-black/70 disabled:opacity-50",
        "data-[active]:border-black data-[active]:bg-soft-signal data-[active]:text-black data-[active]:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        "data-[active]:hover:bg-soft-signal data-[active]:hover:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)] data-[active]:active:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
      ],
      elegant: [],
    },
  },
});
