import { tv } from "../../lib/tv";

export const filePreview = tv({
  slots: {
    root: ["relative flex h-10 w-10 shrink-0 items-center justify-center"],
    document: [
      "relative h-10 w-8 space-y-1.5 rounded-md rounded-tr-[15%] bg-layer-panel p-1.5 shadow-sm ring-1 ring-line-subtle",
    ],
    badge: [
      "absolute -right-1.5 bottom-1 z-10 w-fit whitespace-nowrap rounded-sm px-1.5 py-0.5",
      "font-mono text-[10px] leading-none font-semibold text-[oklch(1_0_0)]",
      "shadow-[0_3px_6px_oklch(0.42_0.12_20_/_0.25)] [text-shadow:0_1px_1px_oklch(0.25_0.08_20_/_0.45)]",
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-sm after:border after:border-[oklch(1_0_0_/_0.2)] after:content-['']",
    ],
    media: [
      "relative size-8 overflow-hidden rounded-md bg-layer-muted shadow-sm ring-1 ring-line-subtle",
    ],
    image: ["size-8 rounded-md object-cover shadow-sm ring-1 ring-line-subtle"],
    video: ["size-8 rounded-md object-cover shadow-sm ring-1 ring-line-subtle"],
  },
  variants: {
    badgeTone: {
      rose: { badge: "bg-[oklch(0.63_0.21_20)]" },
      blue: { badge: "bg-[oklch(0.56_0.16_250)]" },
      amber: { badge: "bg-[oklch(0.52_0.13_75)]" },
      emerald: { badge: "bg-[oklch(0.54_0.14_160)]" },
      violet: { badge: "bg-[oklch(0.52_0.16_300)]" },
      neutral: { badge: "bg-foreground-strong" },
    },
    theme: {
      brutal: {
        document:
          "flex size-4 items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-black/70",
      },
      elegant: {},
    },
  },
  defaultVariants: {
    badgeTone: "rose",
  },
});
