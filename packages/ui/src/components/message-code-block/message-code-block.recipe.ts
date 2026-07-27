import { tv } from "../../lib/tv";

export const messageCodeBlock = tv({
  slots: {
    root: [
      "group/message-code-block relative my-2 min-w-0",
      "[&>pre]:overflow-x-auto [&>pre]:p-3 [&>pre]:pr-12",
      "[&>pre]:font-mono [&>pre]:[font-size:inherit]",
      "[&>pre]:text-[oklch(0.977_0.011_274.897)]",
      "[&>pre>code]:border-0 [&>pre>code]:bg-transparent [&>pre>code]:p-0",
      "[&>pre>code]:[font:inherit] [&>pre>code]:text-inherit",
    ],
    copyButton: [
      "absolute top-2 right-2 z-10 inline-flex size-6 items-center justify-center",
      "rounded-sm text-white/45 opacity-0 transition-[color,opacity]",
      "hover:text-white group-hover/message-code-block:opacity-100",
      "focus-visible:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
      "data-[state=copied]:text-success-base data-[state=copied]:opacity-100",
      "[@media(hover:none)]:opacity-100",
    ],
    iconSwap: [
      "relative inline-grid size-3.5",
      "[&_[data-slot=message-code-block-icon]]:col-start-1 [&_[data-slot=message-code-block-icon]]:row-start-1",
      "[&_[data-slot=message-code-block-icon]]:origin-center",
      "[&_[data-slot=message-code-block-icon]]:transition-[opacity,scale]",
      "[&_[data-slot=message-code-block-icon]]:duration-150",
      "motion-reduce:[&_[data-slot=message-code-block-icon]]:transition-none",
      "data-[state=idle]:[&_[data-icon=copy]]:scale-100 data-[state=idle]:[&_[data-icon=copy]]:opacity-100",
      "data-[state=idle]:[&_[data-icon=check]]:scale-75 data-[state=idle]:[&_[data-icon=check]]:opacity-0",
      "data-[state=copied]:[&_[data-icon=copy]]:scale-75 data-[state=copied]:[&_[data-icon=copy]]:opacity-0",
      "data-[state=copied]:[&_[data-icon=check]]:scale-100 data-[state=copied]:[&_[data-icon=check]]:opacity-100",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: ["[&>pre]:border-2 [&>pre]:border-black", "[&>pre]:bg-[oklch(0.176_0.033_256.392)]"],
      },
      elegant: {
        root: [
          "[&>pre]:rounded-md [&>pre]:border [&>pre]:border-line-subtle",
          "[&>pre]:bg-[oklch(0.22_0.01_260)]",
        ],
      },
    },
  },
});
