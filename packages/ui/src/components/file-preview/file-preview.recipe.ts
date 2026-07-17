import { tv } from "../../lib/tv";

export const filePreview = tv({
  slots: {
    root: ["relative flex h-10 w-10 shrink-0 items-center justify-center"],
    document: [
      "relative h-10 w-8 space-y-1.5 rounded-md rounded-tr-[15%] bg-layer-panel p-1.5 shadow-sm ring-1 ring-line-subtle",
    ],
    file: [
      "relative flex h-10 w-8 items-center justify-center rounded-md rounded-tr-[15%] bg-layer-panel shadow-sm ring-1 ring-line-subtle",
    ],
    code: [
      "relative flex h-10 w-8 items-center justify-center rounded-md rounded-tr-[15%] bg-layer-panel shadow-sm ring-1 ring-line-subtle",
    ],
    fileZip: ["flex h-7 items-center justify-center"],
    fileZipStack: ["relative -translate-y-0.5 flex flex-col items-center"],
    fileZipTeeth: ["space-y-px"],
    fileZipRow: ["flex overflow-hidden rounded-full"],
    fileZipDark: ["size-0.5 bg-primary-400/60"],
    fileZipLight: ["size-0.5 bg-accent-400/35"],
    fileZipPull: ["mt-0.5 h-1 w-2.5 rounded-sm border border-primary-400/40 bg-accent-400/20"],
    codeStack: ["-translate-y-0.5 space-y-px"],
    codeRow: ["flex items-center gap-0.5 leading-none"],
    codeRowIndent: ["flex items-center gap-0.5 pl-1.5 leading-none"],
    codeTextRow: ["block pl-3"],
    codeGlyph: ["font-mono text-[4px] leading-none text-foreground/30"],
    codeTagLine: ["h-[2px] w-3 rounded-full bg-primary-400/60"],
    codeAttributeLine: ["h-[2px] w-2.5 rounded-full bg-accent-400/60"],
    codeTextLine: ["h-[2px] w-6 rounded-full bg-foreground/10"],
    codeSelfClosingLine: ["h-[2px] w-2 rounded-full bg-primary-400/60"],
    badge: [
      "absolute -right-1.5 bottom-0.5 z-10 w-fit whitespace-nowrap rounded-sm px-1.5 py-0.5",
      "font-mono text-[10px] leading-none font-semibold text-[oklch(1_0_0)]",
      "shadow-[0_3px_6px_oklch(0.42_0.12_20_/_0.25)] [text-shadow:0_1px_1px_oklch(0.25_0.08_20_/_0.45)]",
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-sm after:border after:border-[oklch(1_0_0_/_0.2)] after:content-['']",
    ],
    media: [
      "relative h-10 w-8 overflow-hidden rounded-md bg-[oklch(1_0_0)] shadow-sm ring-1 ring-line-subtle",
    ],
  },
  variants: {
    badgeColor: {
      rose: { badge: "bg-[oklch(0.63_0.21_20)]" },
      blue: { badge: "bg-[oklch(0.56_0.16_250)]" },
      amber: { badge: "bg-[oklch(0.52_0.13_75)]" },
      emerald: { badge: "bg-[oklch(0.54_0.14_160)]" },
      violet: { badge: "bg-[oklch(0.52_0.16_300)]" },
      neutral: { badge: "bg-foreground-strong" },
    },
    theme: {
      brutal: {
        document: "rounded-none border-2 border-black bg-white shadow-brutal-sm ring-0",
        file: "rounded-none border-2 border-black bg-white shadow-brutal-sm ring-0",
        code: "rounded-none border-2 border-black bg-white shadow-brutal-sm ring-0",
        media: "rounded-none border-2 border-black bg-white shadow-brutal-sm ring-0",
        badge: [
          "-right-2 -bottom-1 rounded-none border-2 border-black px-1 py-0.5",
          "font-bold text-foreground-inverse shadow-brutal-sm [text-shadow:none] after:hidden",
        ],
      },
      elegant: {
        badge: "px-1",
      },
    },
  },
  defaultVariants: {
    badgeColor: "rose",
  },
});
