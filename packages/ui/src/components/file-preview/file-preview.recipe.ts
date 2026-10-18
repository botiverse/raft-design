import { tv } from "../../lib/tv";

export const filePreview = tv({
  slots: {
    root: ["relative flex h-10 w-10 shrink-0 items-center justify-center"],
    document: [
      "relative h-10 w-8 space-y-1.5 rounded-md rounded-tr-[15%] p-1.5 ring-1",
      "bg-layer-card shadow-none ring-line-hairline",
    ],
    file: [
      "relative flex h-10 w-8 items-center justify-center rounded-md rounded-tr-[15%] ring-1",
      "bg-layer-card shadow-none ring-line-hairline",
    ],
    code: [
      "relative flex h-10 w-8 items-center justify-center rounded-md rounded-tr-[15%] ring-1",
      "bg-layer-card shadow-none ring-line-hairline",
    ],
    fileZip: ["flex h-7 items-center justify-center"],
    fileZipStack: ["relative -translate-y-0.5 flex flex-col items-center"],
    fileZipTeeth: ["space-y-px"],
    fileZipRow: ["flex overflow-hidden rounded-full"],
    fileZipDark: ["size-0.5", "bg-foreground/40"],
    fileZipLight: ["size-0.5", "bg-foreground/15"],
    fileZipPull: ["mt-0.5 h-1 w-2.5 rounded-sm border", "border-foreground/40 bg-foreground/10"],
    codeStack: ["-translate-y-0.5 space-y-px"],
    codeRow: ["flex items-center gap-0.5 leading-none"],
    codeRowIndent: ["flex items-center gap-0.5 pl-1.5 leading-none"],
    codeTextRow: ["block pl-3"],
    codeGlyph: ["font-mono text-[4px] leading-none text-foreground/30"],
    codeTagLine: ["h-0.5 w-3 rounded-full", "bg-foreground/40"],
    codeAttributeLine: ["h-0.5 w-2.5 rounded-full", "bg-foreground/25"],
    codeTextLine: ["h-0.5 w-6 rounded-full bg-foreground/10"],
    codeSelfClosingLine: ["h-0.5 w-2 rounded-full", "bg-foreground/40"],
    // A file type is a quiet neutral chip; the name beside it says the rest.
    badge: [
      "w-fit whitespace-nowrap",
      "rounded-sticker bg-fill-muted px-1 py-0.5 ring-1 ring-line-hairline",
      "font-mono text-[10px] leading-none font-bold text-foreground-muted",
    ],
    media: [
      "relative h-10 w-8 overflow-hidden rounded-md ring-1",
      "bg-fill-muted shadow-none ring-line-hairline",
    ],
  },
  variants: {
    // On a file's icon, the type tags its corner; in a row or a head it is a
    // chip of its own before the name.
    placement: {
      corner: { badge: "absolute -right-1.5 bottom-0.5 z-10" },
      inline: {
        badge: "inline-flex h-3.5 w-7 shrink-0 items-center justify-center px-0 py-0",
      },
    },
  },
  defaultVariants: {
    placement: "corner",
  },
});
