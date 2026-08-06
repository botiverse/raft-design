import { tv } from "../../lib/tv";

export const filterTrigger = tv({
  variants: {
    theme: {
      brutal: [
        "h-8 w-auto px-3 py-0 text-xs font-bold",
        "border-black/30 bg-layer-panel text-black/70 shadow-none",
        "hover:border-black hover:bg-layer-panel hover:shadow-none",
        "disabled:cursor-not-allowed disabled:bg-layer-panel disabled:text-black/70 disabled:opacity-50",
        "[&>span[data-slot='combobox-trigger-content']]:gap-2 [&>span[data-slot='select-trigger-content']]:gap-2",
        "[&>span[data-slot='combobox-trigger-content']>svg:not([class*='size-'])]:!size-3.5 [&>span[data-slot='select-trigger-content']>svg]:size-3.5",
        "[&_[data-slot='select-icon']>svg]:size-3",
        "data-[active]:border-black data-[active]:bg-primary data-[active]:text-black data-[active]:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        "data-[active]:hover:bg-primary data-[active]:hover:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)] data-[active]:active:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
      ],
      elegant: [
        "h-8 w-auto px-3 py-0 text-xs font-medium text-foreground-muted",
        "disabled:cursor-not-allowed disabled:text-foreground-disabled disabled:opacity-100",
        "disabled:[&_svg]:text-foreground-disabled",
      ],
    },
  },
});
