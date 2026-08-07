import { tv } from "../../lib/tv";

export const activityInboxToolbar = tv({
  slots: {
    controls: ["flex shrink-0 flex-nowrap items-center gap-2 px-3 py-2.5"],
    selectionToolbar: [
      "flex min-h-11 shrink-0 items-center gap-2 px-3",
      "max-md:flex-wrap max-md:py-2",
      "md:h-11 md:flex-nowrap md:py-0",
    ],
    selectionCount: ["mr-1 text-xs"],
    toolbarAction: [],
  },
  variants: {
    theme: {
      brutal: {
        controls: ["border-b-2 border-black bg-white"],
        selectionToolbar: ["border-b-2 border-black bg-black/3"],
        selectionCount: ["font-black text-black"],
      },
      elegant: {
        controls: [
          "border-b border-line-hairline bg-layer-panel",
          "dark:border-line-hairline dark:bg-transparent",
          "px-7 max-md:pl-5 max-md:pr-3.5",
        ],
        selectionToolbar: ["px-7 max-md:pl-5 max-md:pr-3.5"],
        selectionCount: ["font-medium text-foreground-strong"],
      },
    },
    toolbarActionVariant: {
      secondary: {
        toolbarAction: [],
      },
      primary: {
        toolbarAction: [],
      },
      link: {
        toolbarAction: [],
      },
      ghost: {
        toolbarAction: [],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      toolbarActionVariant: "primary",
      class: {
        toolbarAction: ["bg-brutal-cyan text-foreground-strong", "hover:bg-brutal-cyan"],
      },
    },
    {
      theme: "brutal",
      toolbarActionVariant: "link",
      class: {
        toolbarAction: ["text-xs underline font-bold decoration-2 text-black"],
      },
    },
    {
      theme: "brutal",
      toolbarActionVariant: "ghost",
      class: {
        toolbarAction: [
          "font-mono font-bold text-black/60",
          "hover:border-transparent hover:bg-transparent hover:text-black",
        ],
      },
    },
    {
      theme: "elegant",
      toolbarActionVariant: "link",
      class: {
        toolbarAction: [
          "text-xs underline font-medium text-foreground-muted",
          "hover:text-foreground-strong",
        ],
      },
    },
    {
      theme: "elegant",
      toolbarActionVariant: "ghost",
      class: {
        toolbarAction: ["font-medium hover:bg-transparent hover:text-foreground-strong"],
      },
    },
  ],
});
