import { tv } from "../../lib/tv";

export const taskCardStatus = tv({
  base: [
    "inline-flex min-w-0 shrink-0 touch-manipulation items-center",
    "transition-[filter,opacity] duration-100 outline-none",
    "data-[busy=true]:pointer-events-none data-[busy=true]:cursor-wait data-[busy=true]:opacity-60 data-[busy=true]:disabled:opacity-100",
    "h-[22px] gap-1.5 rounded-chip border-0 py-0 pr-2 pl-1.5",
    "font-sans text-[12px] leading-4 font-semibold text-foreground",
    "[&:not(:has([data-slot=task-card-status-label]))]:hidden",
    "**:data-[slot=task-card-status-label]:inline-flex **:data-[slot=task-card-status-label]:items-center [&_[data-slot=task-card-status-label]]:gap-1.5",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-3 [&_svg:not([data-slot=task-status-icon])]:-mx-0.5 [&_svg[data-slot=task-status-icon]]:size-[9px]",
    "[button&]:cursor-pointer [button&]:enabled:hover:overlay-medium [button&]:enabled:active:overlay-medium",
    "disabled:cursor-default disabled:opacity-100",
    "focus-visible:shadow-focus",
  ],
});
