import { tv } from "../../lib/tv";

export const taskCardStatus = tv({
  slots: {
    root: "",
    trigger: "",
    menuContent: "",
    menuItem: "",
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "relative min-w-0 shrink-0",
          "data-[busy=true]:pointer-events-none data-[busy=true]:opacity-60",
        ],
        trigger: [
          "mt-0.5 inline-flex touch-manipulation items-center gap-1 border-2 border-line-strong px-2 py-0.5",
          "text-xs font-bold text-foreground",
          "transition-[filter,opacity] duration-100 hover:brightness-90",
          "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "data-[busy=true]:cursor-wait data-[busy=true]:disabled:opacity-100",
          "[&_svg]:pointer-events-none [&_svg]:size-2.5 [&_svg]:shrink-0 [&_svg]:opacity-40",
        ],
        menuContent: ["min-w-[140px]"],
        menuItem: [
          "justify-between gap-2 border-0 bg-layer-panel px-3 py-2",
          "text-left text-sm font-normal text-foreground",
          "transition-colors hover:bg-soft-signal/30 data-[highlighted]:bg-soft-signal/30",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
          "[&_[data-slot=dropdown-menu-radio-item-label]]:min-w-0 [&_[data-slot=dropdown-menu-radio-item-label]]:truncate",
          "[&>span:last-child]:!size-3.5 [&>span:last-child_svg]:!size-3.5",
        ],
      },
      elegant: {},
    },
  },
});
