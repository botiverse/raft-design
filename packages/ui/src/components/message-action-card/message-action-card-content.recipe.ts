import { tv } from "../../lib/tv";

export const messageActionCardContent = tv({
  slots: {
    root: ["min-w-0 p-3"],
    details: [],
    facts: ["m-0"],
    fact: [],
    factLabel: [],
    factValue: [],
    scopeList: ["mt-3 space-y-1.5"],
    scopeLabel: ["text-xs"],
    scope: ["min-w-0 border p-1.5"],
    scopeName: ["break-all font-mono text-[11px] font-bold"],
    scopeDescription: ["text-xs leading-snug"],
    hint: [],
    completion: [],
    actions: ["flex flex-wrap items-center"],
  },
  variants: {
    theme: {
      brutal: {
        root: "pt-0",
        details: "mt-1 text-xs text-black/55",
        facts:
          "mt-1 grid grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 max-sm:grid-cols-1 max-sm:gap-y-0.5",
        fact: "contents",
        factLabel: "max-w-40 min-w-0 break-words text-xs text-black/55",
        factValue: "m-0 min-w-0 break-words text-xs text-black/75",
        scopeLabel: "text-black/55",
        scope: "border-black/15 bg-white",
        scopeName: "text-black/55",
        scopeDescription: "text-black/60",
        hint: "mt-1 border-l-2 border-black/20 pl-2 text-xs italic text-black/55",
        completion: "mt-1 text-xs text-black/55",
        actions: "mt-2.5 gap-3",
      },
      elegant: {
        root: "px-3.5 pt-2.5 pb-3.5 sm:px-4",
        details: "mt-1.5 space-y-0.5 text-[13px] leading-5 text-foreground-muted",
        facts:
          "mt-2 grid grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-6 gap-y-2 max-sm:grid-cols-1 max-sm:gap-y-0.5",
        fact: "contents",
        factLabel: "max-w-40 min-w-0 break-words text-[13px] leading-5 text-foreground-muted/80",
        factValue: "m-0 min-w-0 break-words text-[13px] leading-5 text-foreground",
        scopeList: "mt-3 space-y-2",
        scopeLabel: "text-[13px] leading-5 font-medium text-foreground",
        scope: "rounded-md border-line-subtle bg-layer-panel/70 px-2.5 py-2 shadow-xs",
        scopeName: "font-sans text-xs leading-4 font-medium text-foreground-muted",
        scopeDescription: "mt-0.5 text-[13px] leading-5 text-pretty text-foreground-muted/80",
        hint: "mt-2.5 border-l border-line-subtle pl-2.5 text-xs leading-4 italic text-foreground-muted/80",
        completion: "mt-2.5 text-[13px] leading-5 text-foreground-muted",
        actions: "mt-3 gap-2",
      },
    },
  },
});
