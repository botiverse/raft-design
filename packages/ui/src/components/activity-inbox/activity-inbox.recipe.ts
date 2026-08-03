import { tv } from "../../lib/tv";

const sourceShadowSm = "shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]";
const sourceButtonMotion = [
  sourceShadowSm,
  "transition-all duration-100",
  "hover:-translate-y-px",
  "hover:shadow-[4px_4px_0px_oklch(0.1812926_0.0049716_17.6198)]",
  "active:translate-x-px active:translate-y-px",
  "active:shadow-[1px_1px_0px_oklch(0.1812926_0.0049716_17.6198)]",
];

export const activityInbox = tv({
  slots: {
    list: ["flex flex-col gap-2"],
    item: ["relative flex w-full items-start gap-3 border-2 p-3 text-left", "transition-colors"],
    itemOpen: ["absolute inset-0 z-0 outline-none"],
    itemSelection: [
      "relative z-10 mt-0.5 flex size-5 shrink-0 items-center justify-center border-2",
      "outline-none",
      "[&_svg]:size-[13px]",
    ],
    itemContent: ["pointer-events-none relative z-10 min-w-0 flex-1 text-left"],
    itemSubtitle: ["mb-0.5 min-w-0 text-[11px] font-bold leading-3"],
    itemHeading: ["mb-0.5 flex min-w-0 items-start gap-2"],
    itemTitle: ["line-clamp-2 min-w-0 flex-1 text-sm leading-5"],
    itemTitleIcon: ["mr-1.5 inline-block align-[-2px]", "[&_svg]:size-[13px]"],
    itemTimestamp: ["shrink-0 font-mono text-xs leading-5"],
    itemBody: ["line-clamp-2 text-xs leading-4"],
    itemSender: ["font-bold"],
    itemMetadata: ["mt-1 flex min-h-5 flex-wrap items-center gap-1.5"],
    itemActions: ["relative z-10 flex shrink-0 items-center gap-1.5"],
    itemAction: [
      "inline-flex shrink-0 items-center justify-center p-1.5 outline-none",
      "[&_svg]:size-3.5",
    ],
    itemSavedAction: [
      "inline-flex shrink-0 items-center justify-center p-1.5 outline-none",
      "[&_svg]:size-3.5",
    ],
    itemMenuContent: [],
    itemMenuItem: [],
  },
  variants: {
    theme: {
      brutal: {
        item: [
          "border-black/30 bg-white",
          "hover:border-black hover:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
          "active:border-black active:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
          "aria-disabled:pointer-events-none aria-disabled:hover:border-black/30 aria-disabled:hover:shadow-none",
          "data-[active=true]:border-black data-[active=true]:bg-white data-[active=true]:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
          "data-[focused=true]:border-black data-[focused=true]:bg-brutal-cyan/25 data-[focused=true]:shadow-[4px_4px_0px_oklch(0.1812926_0.0049716_17.6198)]",
          "has-[[data-slot=activity-inbox-item-open]:focus-visible]:border-black has-[[data-slot=activity-inbox-item-open]:focus-visible]:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        ],
        itemSelection: [
          "border-black bg-white",
          "aria-checked:bg-soft-signal",
          "focus-visible:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        ],
        itemSubtitle: ["text-black/45"],
        itemTitle: [
          "font-semibold text-black/55",
          "group-data-[unread=true]/activity-item:font-bold",
          "group-data-[unread=true]/activity-item:text-black",
        ],
        itemTitleIcon: ["text-black/45"],
        itemTimestamp: ["text-black/40"],
        itemBody: ["text-black/55", "group-data-[unread=true]/activity-item:text-black"],
        itemSender: ["text-black/70"],
        itemAction: [
          "border-2 border-black bg-white",
          ...sourceButtonMotion,
          "focus-visible:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        ],
        itemSavedAction: [
          "border-2 border-black bg-brutal-orange/15 text-brutal-orange",
          ...sourceButtonMotion,
          "focus-visible:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        ],
        itemMenuContent: [
          "border-2 border-black bg-white p-0 shadow-[4px_4px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        ],
        itemMenuItem: ["font-medium hover:bg-soft-signal/30 data-[highlighted]:bg-soft-signal/30"],
      },
      elegant: {},
    },
  },
});
