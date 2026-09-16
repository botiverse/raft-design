import { tv } from "../../lib/tv";

export const floatButton = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center select-none",
      "outline-none transition-all duration-150",
      "disabled:pointer-events-none disabled:opacity-40",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "motion-reduce:transition-none",
    ],
    content: "inline-flex items-center justify-center gap-1.5",
    description: "text-center leading-tight truncate",
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 font-bold",
          "shadow-raft-md",
          "hover:-translate-px  hover:shadow-raft-lg active:translate-x-0 active:translate-y-0 active:shadow-raft-sm",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-line-strong",
        ],
      },
      elegant: {
        root: [
          "border font-sans font-medium antialiased",
          "shadow-raft-md",
          "hover:brightness-105 active:scale-[0.97]",
          "focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--button-focus-ring,var(--primary-400))_80%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-layer-canvas-muted",
        ],
      },
    },
    variant: {
      default: {
        root: ["border-line-strong bg-layer-panel text-foreground", "hover:bg-fill-muted"],
      },
      primary: {
        root: ["border-line-strong bg-primary-400 text-primary-950", "hover:bg-primary-500"],
      },
      accent: {
        root: ["border-line-strong bg-accent-400 text-accent-950", "hover:bg-accent-500"],
      },
      outline: {
        root: ["border-line-strong bg-layer-panel text-foreground", "hover:bg-fill-muted"],
      },
      ghost: {
        root: [
          "border-transparent bg-transparent text-foreground-strong shadow-none",
          "hover:border-line-strong hover:bg-fill-muted hover:shadow-raft-sm",
        ],
      },
      warning: {
        root: ["border-line-strong bg-warning text-warning-foreground", "hover:brightness-95"],
      },
      danger: {
        root: [
          "border-line-strong bg-danger text-danger-foreground",
          "hover:border-danger-hover hover:bg-danger-hover",
        ],
      },
    },
    shape: {
      circle: {
        root: "rounded-full",
      },
      square: {
        root: "rounded-none",
      },
    },
    size: {
      sm: {
        root: "size-9 p-0 text-xs [&_svg:not([class*='size-'])]:size-4",
        description: "text-[10px]",
      },
      md: {
        root: "size-10 p-0 text-sm [&_svg:not([class*='size-'])]:size-4.5",
        description: "text-[11px]",
      },
      lg: {
        root: "size-12 p-0 text-base [&_svg:not([class*='size-'])]:size-5",
        description: "text-xs",
      },
    },
  },
  compoundVariants: [
    {
      theme: "elegant",
      shape: "square",
      size: "sm",
      class: { root: "rounded-sm" },
    },
    {
      theme: "elegant",
      shape: "square",
      size: "md",
      class: { root: "rounded-md" },
    },
    {
      theme: "elegant",
      shape: "square",
      size: "lg",
      class: { root: "rounded-lg" },
    },
    {
      theme: "brutal",
      variant: "default",
      class: {
        root: "border-line-strong bg-layer-panel text-foreground-strong hover:bg-layer-panel",
      },
    },
    {
      theme: "brutal",
      variant: "primary",
      class: {
        root: "border-line-strong bg-brutal-yellow text-foreground-strong hover:bg-brutal-yellow",
      },
    },
    {
      theme: "brutal",
      variant: "accent",
      class: {
        root: "border-line-strong bg-brutal-pink text-foreground-strong hover:bg-brutal-pink",
      },
    },
    {
      theme: "brutal",
      variant: "outline",
      class: {
        root: "border-line-strong bg-layer-panel text-foreground-strong hover:bg-layer-panel",
      },
    },
    {
      theme: "brutal",
      variant: "ghost",
      class: {
        root: "border-transparent bg-transparent text-foreground-strong hover:border-line-strong hover:bg-fill-muted",
      },
    },
    {
      theme: "brutal",
      variant: "warning",
      class: {
        root: "border-line-strong bg-brutal-orange text-foreground-strong hover:bg-brutal-orange",
      },
    },
    {
      theme: "brutal",
      variant: "danger",
      class: {
        root: "border-line-strong bg-brutal-red text-foreground-strong hover:bg-brutal-red",
      },
    },
    {
      theme: "elegant",
      variant: "default",
      class: {
        root: "border-line-muted bg-layer-panel text-foreground hover:bg-fill-muted",
      },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: {
        root: "border-transparent bg-primary-400 text-primary-950 hover:bg-primary-500",
      },
    },
    {
      theme: "elegant",
      variant: "accent",
      class: {
        root: "border-transparent bg-accent-400 text-accent-950 hover:bg-accent-500",
      },
    },
    {
      theme: "elegant",
      variant: "outline",
      class: {
        root: "border-line-strong bg-layer-panel text-foreground hover:bg-fill-muted",
      },
    },
    {
      theme: "elegant",
      variant: "ghost",
      class: {
        root: "border-transparent bg-transparent text-foreground hover:border-line-muted hover:bg-fill-muted hover:shadow-raft-sm",
      },
    },
    {
      theme: "elegant",
      variant: "warning",
      class: {
        root: "border-transparent bg-warning text-warning-foreground hover:brightness-95",
      },
    },
    {
      theme: "elegant",
      variant: "danger",
      class: {
        root: "border-transparent bg-danger text-danger-foreground hover:bg-danger-hover",
      },
    },
  ],
  defaultVariants: {
    variant: "default",
    shape: "circle",
    size: "md",
  },
});

export const floatButtonGroup = tv({
  slots: {
    root: "inline-flex items-center select-none",
  },
  variants: {
    theme: {
      brutal: {
        root: "",
      },
      elegant: {
        root: "",
      },
    },
    direction: {
      vertical: {
        root: "flex-col",
      },
      horizontal: {
        root: "flex-row",
      },
    },
    attached: {
      true: {
        root: "",
      },
      false: {
        root: "",
      },
    },
    shape: {
      circle: {
        root: "",
      },
      square: {
        root: "",
      },
    },
  },
  compoundVariants: [
    {
      attached: true,
      direction: "vertical",
      class: {
        root: [
          "[&>[data-slot=float-button]:not(:last-child)]:border-b-0",
          "[&>[data-slot=float-button]:not(:first-child):not(:last-child)]:rounded-none",
        ],
      },
    },
    {
      attached: true,
      direction: "horizontal",
      class: {
        root: [
          "[&>[data-slot=float-button]:not(:last-child)]:border-r-0",
          "[&>[data-slot=float-button]:not(:first-child):not(:last-child)]:rounded-none",
        ],
      },
    },
    {
      attached: true,
      direction: "vertical",
      shape: "square",
      theme: "brutal",
      class: {
        root: [
          "[&>[data-slot=float-button]:first-child]:rounded-none",
          "[&>[data-slot=float-button]:last-child]:rounded-none",
        ],
      },
    },
    {
      attached: true,
      direction: "vertical",
      shape: "square",
      theme: "elegant",
      class: {
        root: [
          "[&>[data-slot=float-button]:first-child]:rounded-t-md [&>[data-slot=float-button]:first-child]:rounded-b-none",
          "[&>[data-slot=float-button]:last-child]:rounded-b-md [&>[data-slot=float-button]:last-child]:rounded-t-none",
        ],
      },
    },
    {
      attached: true,
      direction: "vertical",
      shape: "circle",
      class: {
        root: [
          "[&>[data-slot=float-button]:first-child]:rounded-t-full [&>[data-slot=float-button]:first-child]:rounded-b-none",
          "[&>[data-slot=float-button]:last-child]:rounded-b-full [&>[data-slot=float-button]:last-child]:rounded-t-none",
        ],
      },
    },
    {
      attached: true,
      direction: "horizontal",
      shape: "square",
      theme: "brutal",
      class: {
        root: [
          "[&>[data-slot=float-button]:first-child]:rounded-none",
          "[&>[data-slot=float-button]:last-child]:rounded-none",
        ],
      },
    },
    {
      attached: true,
      direction: "horizontal",
      shape: "square",
      theme: "elegant",
      class: {
        root: [
          "[&>[data-slot=float-button]:first-child]:rounded-l-md [&>[data-slot=float-button]:first-child]:rounded-r-none",
          "[&>[data-slot=float-button]:last-child]:rounded-r-md [&>[data-slot=float-button]:last-child]:rounded-l-none",
        ],
      },
    },
    {
      attached: true,
      direction: "horizontal",
      shape: "circle",
      class: {
        root: [
          "[&>[data-slot=float-button]:first-child]:rounded-l-full [&>[data-slot=float-button]:first-child]:rounded-r-none",
          "[&>[data-slot=float-button]:last-child]:rounded-r-full [&>[data-slot=float-button]:last-child]:rounded-l-none",
        ],
      },
    },
  ],
  defaultVariants: {
    direction: "vertical",
    attached: false,
    shape: "circle",
  },
});
