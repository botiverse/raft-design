import { tv } from "../../lib/tv";

export const taskCardStatus = tv({
  slots: {
    root: [
      "relative min-w-0 shrink-0",
      "data-[busy=true]:pointer-events-none data-[busy=true]:opacity-60",
    ],
    trigger: [
      "mt-[2px] inline-flex touch-manipulation items-center gap-[4px]",
      "transition-[filter,opacity] duration-100",
      "outline-none",
      "disabled:cursor-not-allowed disabled:opacity-60",
      "data-[busy=true]:cursor-wait data-[busy=true]:disabled:opacity-100",
      "[&_svg]:pointer-events-none [&_svg]:size-[10px] [&_svg]:shrink-0 [&_svg]:opacity-40",
    ],
    menuContent: ["min-w-[140px]"],
    menuItem: [
      "justify-between gap-[8px] text-left",
      "[&_[data-slot=dropdown-menu-radio-item-label]]:min-w-0 [&_[data-slot=dropdown-menu-radio-item-label]]:truncate",
      "[&>span:last-child]:!size-[14px] [&>span:last-child_svg]:!size-[14px]",
    ],
  },
  variants: {
    theme: {
      brutal: {
        trigger: [
          "border-2 border-line-strong px-[8px] py-[2px]",
          "text-[12px] leading-[16px] font-bold text-foreground",
          "hover:brightness-90",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
        menuItem: [
          "border-0 bg-layer-panel px-[12px] py-[8px]",
          "text-[14px] font-normal text-foreground",
          "transition-colors hover:bg-soft-signal/30 data-[highlighted]:bg-soft-signal/30",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
      },
      elegant: {
        trigger: [
          "rounded-full border border-transparent px-[10px] py-[2px]",
          "font-sans text-[11px] leading-[12px] font-medium tracking-[0.22px]",
          "transition-[filter,opacity]",
          "hover:brightness-[0.96] active:scale-[0.985]",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
          "focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-1 focus-visible:ring-offset-layer-panel",
          "[@media(forced-colors:active)]:focus-visible:[outline-color:CanvasText]",
        ],
      },
    },
  },
});
