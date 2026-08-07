import { tv } from "../../lib/tv";

export const input = tv({
  slots: {
    root: ["w-full px-3 py-2 font-heading outline-none"],
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      class: {
        root: [
          "border-2 border-line-strong bg-layer-panel",
          "shadow-raft-sm focus:shadow-raft-md",
          "data-invalid:border-brutal-red data-invalid:bg-brutal-red/5 data-invalid:shadow-none data-invalid:ring-2 data-invalid:ring-brutal-red/60",
        ],
      },
    },
    {
      theme: "elegant",
      class: {
        root: [
          "rounded-md border border-line-field bg-layer-panel",
          "dark:bg-layer-card dark:not-data-invalid:border-transparent",
          "dark:shadow-[inset_0_1px_2px_oklch(0_0_0/0.3),inset_0_0_0_1px_oklch(0_0_0/0.35),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
          "dark:hover:not-data-invalid:border-ink-8",
          "px-3 py-2 text-sm text-foreground transition duration-200 ease-out dark:text-foreground-strong",
          "placeholder:text-foreground-placeholder/70",
          "shadow-none hover:not-data-invalid:border-line-field-hover",
          "focus:bg-layer-panel dark:focus:bg-layer-card",
          "focus-visible:ring-1 focus-visible:ring-primary-400",
          "dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
          "data-invalid:border-danger/45 data-invalid:hover:border-danger/75 data-invalid:focus-visible:border-danger/75 data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-danger/12",
          "disabled:cursor-not-allowed disabled:border-line-muted/60 disabled:bg-fill-muted/50 disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
          "disabled:hover:border-line-muted/60",
          "data-invalid:disabled:border-line-muted/60 data-invalid:disabled:ring-0",
        ],
      },
    },
  ],
});
