import { searchHit } from "../../lib/search-hit";
import { tv } from "../../lib/tv";

export const markdown = tv({
  slots: {
    heading: ["leading-tight", "font-bold text-foreground"],
    paragraph: ["mb-1 last:mb-0"],
    link: [
      "select-text underline decoration-2 underline-offset-2",
      "rounded-[2px]",
      "text-foreground-link hover:text-[color-mix(in_oklab,var(--foreground-link)_80%,var(--foreground))]",
      "decoration-foreground-link/40 hover:decoration-current",
      "outline-none focus-visible:shadow-focus",
    ],
    mark: searchHit,
    list: ["mb-1 pl-5"],
    listItem: ["mb-0.5"],
    blockquote: ["my-1 border-l-2 border-line-seam pl-2.5", "text-foreground-muted not-italic"],
    rule: ["my-3 border-0 border-t border-line-hairline"],
    tableScroll: [
      "overflow-x-auto",
      "my-2 w-fit max-w-full",
      "rounded-container border border-line-hairline bg-layer-card",
    ],
    table: ["border-collapse", "border-0 text-callout"],
    tableRow: ["last:[&>td]:border-b-0"],
    headerCell: [
      "px-3 py-1.5",
      "border-0 border-b border-line-hairline not-last:border-r",
      "bg-fill-muted",
      "text-left font-semibold whitespace-nowrap text-foreground",
    ],
    cell: ["px-3 py-1.5", "border-0 border-b border-line-hairline not-last:border-r"],
    checkbox: ["mr-1.5 align-middle"],
    image: [
      "image-transparency-bg max-w-full",
      "my-2 rounded-container border border-line-hairline",
    ],
    inlineCode: ["inline leading-[inherit] wrap-anywhere"],
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
  },
  compoundVariants: [
    { level: 1, class: { heading: "mt-4 mb-1 text-title" } },
    { level: 2, class: { heading: "mt-3 mb-1 text-headline" } },
    { level: 3, class: { heading: "mt-3 mb-0.5 text-subhead font-bold" } },
    {
      level: [4, 5, 6],
      class: { heading: "mt-2 mb-0.5 text-footnote font-bold text-foreground-muted" },
    },
  ],
  defaultVariants: {
    ordered: false,
  },
});
