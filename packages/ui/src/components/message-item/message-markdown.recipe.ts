import { tv } from "../../lib/tv";

export const messageMarkdown = tv({
  slots: {
    root: [
      "message-markdown",
      "[&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-[1.286em] [&_h1]:leading-tight [&_h1]:font-bold",
      "[&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:text-[1.143em] [&_h2]:leading-tight [&_h2]:font-bold",
      "[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-[1.071em] [&_h3]:leading-tight [&_h3]:font-bold",
      "[&_h4]:mt-1 [&_h4]:mb-0.5 [&_h4]:text-[1em] [&_h4]:leading-tight [&_h4]:font-bold",
      "[&_h5]:mt-1 [&_h5]:mb-0.5 [&_h5]:text-[1em] [&_h5]:leading-tight [&_h5]:font-bold",
      "[&_h6]:mt-1 [&_h6]:mb-0.5 [&_h6]:text-[1em] [&_h6]:leading-tight [&_h6]:font-bold",
      "[&_p]:mb-1 [&_p:last-child]:mb-0",
      "[&_a:not([data-slot^=message-reference])]:select-text [&_a:not([data-slot^=message-reference])]:underline [&_a:not([data-slot^=message-reference])]:decoration-2 [&_a:not([data-slot^=message-reference])]:underline-offset-2",
      "[&_mark]:bg-soft-signal/70 [&_mark]:text-inherit [&_mark]:[font:inherit]",
      "[&_ul]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5",
      "[&_li]:mb-0.5",
      "[&_blockquote]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic",
      "[&_hr]:my-2 [&_hr]:border-t-2",
      "[&_table]:border-collapse [&_table]:border-2 [&_table]:text-sm",
      "[&_th]:border-2 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-bold [&_th]:whitespace-nowrap",
      "[&_td]:border [&_td]:px-2 [&_td]:py-1",
      "[&_img]:my-2 [&_img]:max-w-full [&_img]:border-2",
    ],
    tableScroll: ["my-2 overflow-x-auto"],
    inlineCode: [],
    codeBlock: [
      "overflow-x-auto border-2 p-3 pr-12",
      "font-mono [font-size:inherit]",
      "[&>code]:border-0 [&>code]:bg-transparent [&>code]:p-0",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "[&_h6]:text-black/70",
          "[&_a:not([data-slot^=message-reference])]:text-[oklch(0.488_0.243_264.376)] [&_a:not([data-slot^=message-reference]):hover]:text-brutal-pink",
          "[&_blockquote]:border-black/40 [&_blockquote]:text-black/70",
          "[&_hr]:border-black",
          "[&_table]:border-black",
          "[&_th]:border-black [&_th]:bg-brutal-cyan",
          "[&_td]:border-black",
          "[&_img]:border-black",
        ],
        inlineCode: [
          "border-0 bg-soft-signal/40 px-1",
          "[font-size:inherit] font-normal leading-[1.5] text-inherit [overflow-wrap:anywhere]",
        ],
        codeBlock: ["border-black bg-[oklch(0.21_0.034_264.665)]", "text-[oklch(1_0_0)]"],
      },
      elegant: {
        root: [
          "[&_h6]:text-foreground/70",
          "[&_a:not([data-slot^=message-reference])]:text-info-dark [&_a:not([data-slot^=message-reference]):hover]:text-accent-500",
          "[&_blockquote]:border-line-strong [&_blockquote]:text-foreground/70",
          "[&_hr]:border-line-strong",
          "[&_table]:border-line-strong",
          "[&_th]:border-line-strong [&_th]:bg-info-light",
          "[&_td]:border-line-strong",
          "[&_img]:border-line-strong",
        ],
        inlineCode: [],
        codeBlock: ["border-line-strong bg-[oklch(0.22_0.01_260)]", "text-[oklch(0.97_0_0)]"],
      },
    },
  },
});
