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
      "[&_a:not([data-message-reference])]:select-text [&_a:not([data-message-reference])]:underline [&_a:not([data-message-reference])]:decoration-2 [&_a:not([data-message-reference])]:underline-offset-2",
      "[&_mark]:bg-soft-signal/70 [&_mark]:text-inherit [&_mark]:[font:inherit]",
      "[&_ul]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5",
      "[&_li]:mb-0.5",
      "[&_blockquote]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic",
      "[&_hr]:my-2 [&_hr]:border-t-2",
      "[&_table]:border-collapse [&_table]:border-2 [&_table]:text-sm",
      "[&_th]:border-2 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-bold [&_th]:whitespace-nowrap",
      "[&_td]:border [&_td]:px-2 [&_td]:py-1",
      "[&_img]:image-transparency-bg [&_img]:my-2 [&_img]:max-w-full [&_img]:border-2",
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
          "[&_a:not([data-message-reference])]:text-[oklch(0.488_0.243_264.376)] [&_a:not([data-message-reference]):hover]:text-brutal-pink",
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
        // Live Slock CodeBlock: bg-[#07111f] text-[#f5f7ff]
        codeBlock: [
          "border-black bg-[oklch(0.176_0.033_256.392)]",
          "text-[oklch(0.977_0.011_274.897)]",
        ],
      },
      elegant: {
        root: [
          "[&_h1]:mt-2 [&_h1]:font-medium [&_h1]:text-foreground-strong",
          "[&_h2]:font-medium [&_h2]:text-foreground-strong",
          "[&_h3]:font-medium [&_h3]:text-foreground-strong",
          "[&_h4]:font-medium [&_h4]:text-foreground-strong",
          "[&_h5]:font-medium [&_h5]:text-foreground-strong",
          "[&_h6]:font-medium [&_h6]:text-foreground-strong",
          "[&_a:not([data-message-reference])]:text-foreground-strong [&_a:not([data-message-reference])]:decoration-1 [&_a:not([data-message-reference])]:decoration-foreground/30",
          "[&_a:not([data-message-reference]):hover]:text-foreground [&_a:not([data-message-reference]):hover]:decoration-foreground/70",
          "[&_p]:max-w-[72ch] [&_ul]:max-w-[72ch] [&_ol]:max-w-[72ch] [&_blockquote]:max-w-[72ch]",
          "[&_mark]:rounded-sm [&_mark]:bg-primary-400/15 [&_mark]:px-0.5 [&_mark]:text-foreground-strong",
          "[&_blockquote]:border-l [&_blockquote]:border-line-subtle [&_blockquote]:bg-layer-muted/70",
          "[&_blockquote]:rounded-r-sm [&_blockquote]:py-1 [&_blockquote]:pr-3 [&_blockquote]:not-italic [&_blockquote]:text-foreground-muted",
          "[&_hr]:border-t [&_hr]:border-line-subtle",
          "[&_table]:w-full [&_table]:border-0",
          "[&_th]:border-0 [&_th]:border-b [&_th]:border-line-subtle [&_th]:bg-layer-muted",
          "[&_th]:font-medium [&_th]:text-foreground-strong [&_th:not(:last-child)]:border-r",
          "[&_td]:border-0 [&_td]:border-b [&_td]:border-line-subtle [&_td:not(:last-child)]:border-r",
          "[&_tbody>tr:last-child>td]:border-b-0",
          "[&_img]:rounded-md [&_img]:border [&_img]:border-line-subtle",
        ],
        tableScroll: ["rounded-md border border-line-subtle bg-layer-panel"],
        inlineCode: [
          "inline rounded-sm px-1 py-0",
          "bg-layer-strong font-mono text-[0.92em] font-normal leading-[inherit] text-foreground-strong",
          "[overflow-wrap:anywhere]",
        ],
        codeBlock: [
          "my-2 rounded-md border border-line-subtle bg-[oklch(0.22_0.01_260)]",
          "text-[oklch(0.97_0_0)]",
        ],
      },
    },
  },
});
