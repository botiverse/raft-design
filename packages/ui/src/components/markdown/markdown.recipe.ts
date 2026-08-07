import { tv } from "../../lib/tv";

export const markdown = tv({
  slots: {
    heading: ["leading-tight font-bold"],
    paragraph: ["mb-1 last:mb-0"],
    link: [
      "select-text underline decoration-2 underline-offset-2",
      "text-[oklch(0.81_0.19_88.08)]",
    ],
    mark: ["bg-primary/70 text-inherit [font:inherit]"],
    list: ["mb-1 pl-5"],
    listItem: ["mb-0.5"],
    blockquote: [],
    rule: [],
    tableScroll: ["overflow-x-auto"],
    table: ["border-collapse"],
    tableRow: [],
    headerCell: [],
    cell: [],
    checkbox: ["mr-1.5 align-middle"],
    image: ["image-transparency-bg max-w-full"],
    inlineCode: [],
  },
  variants: {
    level: {
      1: { heading: "mt-3 mb-1 text-[1.286em]" },
      2: { heading: "mt-2 mb-1 text-[1.143em]" },
      3: { heading: "mt-2 mb-1 text-[1.071em]" },
      4: { heading: "mt-1 mb-0.5 text-[1em]" },
      5: { heading: "mt-1 mb-0.5 text-[1em]" },
      6: { heading: "mt-1 mb-0.5 text-[1em]" },
    },
    ordered: {
      false: { list: "list-disc" },
      true: { list: "list-decimal" },
    },
    theme: {
      brutal: {
        link: ["hover:text-brutal-pink"],
        blockquote: ["my-1 border-l-2 border-black/40 pl-3 italic", "text-black/70"],
        rule: ["my-2 border-t-2 border-black"],
        tableScroll: ["my-2"],
        table: ["border-2 border-black text-sm"],
        headerCell: [
          "border-2 border-black px-3 py-1.5",
          "bg-brutal-cyan",
          "text-left font-bold whitespace-nowrap",
        ],
        cell: ["border border-black px-3 py-1.5"],
        image: ["my-2 border-2 border-black"],
      },
      elegant: {
        heading: ["font-medium text-foreground"],
        paragraph: ["max-w-[72ch]"],
        list: ["max-w-[72ch]"],
        link: [
          "decoration-1 decoration-[oklch(0.81_0.19_88.08)]",
          "hover:text-primary-active hover:decoration-primary-active",
        ],
        blockquote: [
          "my-1 max-w-[72ch] rounded-r-sm px-4 py-2",
          "border-l-2 border-line-muted bg-fill-muted/70",
          "text-foreground-muted not-italic",
        ],
        rule: ["my-2 border-t border-line-muted"],
        tableScroll: ["my-2 w-fit max-w-full", "rounded-md border border-ink-6 bg-layer-panel"],
        table: ["border-0 text-sm"],
        tableRow: ["last:[&>td]:border-b-0"],
        headerCell: [
          "px-3 py-1.5",
          "border-0 border-b border-ink-6 not-last:border-r not-last:border-ink-6",
          "bg-fill-muted/50",
          "text-left font-medium whitespace-nowrap text-foreground",
        ],
        cell: ["px-3 py-1.5", "border-0 border-b border-ink-6 not-last:border-r"],
        image: ["my-2 rounded-md border border-line-muted"],
        inlineCode: ["inline leading-[inherit] wrap-anywhere"],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      level: 6,
      class: { heading: "text-black/70" },
    },
    {
      theme: "elegant",
      level: 1,
      class: { heading: "mt-2" },
    },
  ],
  defaultVariants: {
    ordered: false,
  },
});
