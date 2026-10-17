import { tv } from "../../lib/tv";

export const filePreview = tv({
  slots: {
    root: ["relative flex h-10 w-10 shrink-0 items-center justify-center"],
    document: [
      "relative h-10 w-8 space-y-1.5 rounded-md rounded-tr-[15%] bg-layer-panel p-1.5 shadow-raft-sm ring-1 ring-line-muted",
      "dark:ring-transparent",
    ],
    file: [
      "relative flex h-10 w-8 items-center justify-center rounded-md rounded-tr-[15%] bg-layer-panel shadow-raft-sm ring-1 ring-line-muted",
      "dark:ring-transparent",
    ],
    code: [
      "relative flex h-10 w-8 items-center justify-center rounded-md rounded-tr-[15%] bg-layer-panel shadow-raft-sm ring-1 ring-line-muted",
      "dark:ring-transparent",
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
    codeGlyph: ["font-mono text-[4px] leading-none text-foreground-strong/30"],
    codeTagLine: ["h-0.5 w-3 rounded-full bg-primary-400/60"],
    codeAttributeLine: ["h-0.5 w-2.5 rounded-full bg-accent-400/60"],
    codeTextLine: ["h-0.5 w-6 rounded-full bg-foreground-strong/10"],
    codeSelfClosingLine: ["h-0.5 w-2 rounded-full bg-primary-400/60"],
    badge: [
      "absolute -right-1.5 bottom-0.5 z-10 w-fit whitespace-nowrap rounded-sm px-1.5 py-0.5",
      "font-mono text-[10px] leading-none font-semibold text-white",
      "shadow-[0_3px_6px_oklch(0.42_0.12_20/0.25)] [text-shadow:0_1px_1px_oklch(0.25_0.08_20/0.45)]",
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-sm after:border after:border-[oklch(1_0_0/0.2)] after:content-['']",
      "dark:shadow-none dark:text-shadow-none dark:after:border-[oklch(1_0_0/0.08)]",
    ],
    media: [
      "relative h-10 w-8 overflow-hidden rounded-md bg-layer-panel shadow-raft-sm ring-1 ring-line-muted",
      "dark:ring-transparent",
    ],
  },
  variants: {
    badgeColor: {
      rose: {
        badge:
          "bg-[oklch(0.63_0.21_20)] dark:bg-[oklch(0.42_0.14_20)] dark:text-[oklch(0.88_0.06_18)]",
      },
      blue: {
        badge:
          "bg-[oklch(0.56_0.16_250)] dark:bg-[oklch(0.4_0.12_250)] dark:text-[oklch(0.87_0.06_250)]",
      },
      amber: {
        badge:
          "bg-[oklch(0.52_0.13_75)] dark:bg-[oklch(0.42_0.1_75)] dark:text-[oklch(0.89_0.08_80)]",
      },
      emerald: {
        badge:
          "bg-[oklch(0.54_0.14_160)] dark:bg-[oklch(0.4_0.11_160)] dark:text-[oklch(0.86_0.09_160)]",
      },
      violet: {
        badge:
          "bg-[oklch(0.52_0.16_300)] dark:bg-[oklch(0.4_0.13_300)] dark:text-[oklch(0.87_0.06_300)]",
      },
      neutral: { badge: "bg-foreground dark:bg-fill-strong dark:text-foreground-strong" },
    },
    theme: {
      brutal: {
        document: "rounded-none border-2 border-black bg-white shadow-raft-sm ring-0",
        file: "rounded-none border-2 border-black bg-white shadow-raft-sm ring-0",
        code: "rounded-none border-2 border-black bg-white shadow-raft-sm ring-0",
        media: "rounded-none border-2 border-black bg-white shadow-raft-sm ring-0",
        badge: [
          "-right-0.5 bottom-0.5 rounded-none border-2 border-black px-1 py-0.5",
          "font-bold text-foreground-inverse shadow-raft-sm text-shadow-none after:hidden",
        ],
      },
      elegant: {
        badge: "px-1",
      },
      raft: {
        document: "bg-layer-card shadow-none ring-line-muted dark:ring-line-muted",
        file: "bg-layer-card shadow-none ring-line-muted dark:ring-line-muted",
        code: "bg-layer-card shadow-none ring-line-muted dark:ring-line-muted",
        media: "bg-fill-muted shadow-none ring-line-muted dark:ring-line-muted",
        fileZipDark: "bg-foreground/40",
        fileZipLight: "bg-foreground/15",
        fileZipPull: "border-foreground/40 bg-foreground/10",
        codeTagLine: "bg-foreground/40",
        codeAttributeLine: "bg-foreground/25",
        codeSelfClosingLine: "bg-foreground/40",
        badge: [
          "rounded-sticker px-1 font-bold",
          "bg-fill-muted text-foreground-muted ring-1 ring-line-muted",
          "shadow-none text-shadow-none [text-shadow:none] after:hidden",
          "dark:bg-fill-muted dark:text-foreground-muted",
        ],
      },
    },
  },
  defaultVariants: {
    badgeColor: "rose",
  },
});
