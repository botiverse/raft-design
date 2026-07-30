import { FileText, Hash, MessageSquare } from "lucide-react";

export function MessageQuotedPreviewSourcePreview() {
  return (
    <article className="group/message relative flex h-fit min-h-[3rem] w-full max-w-xl gap-3 border-2 border-transparent px-2 py-1 font-sans text-black">
      <button
        type="button"
        aria-label="Open Ada profile"
        className="mt-0.5 shrink-0 self-start transition-[filter,transform] duration-75 hover:brightness-90"
      >
        <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden border-2 border-black bg-brutal-lavender text-sm font-bold">
          A
        </span>
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
          <span className="min-w-0 shrink-0 truncate text-sm font-bold text-black">Ada</span>
          <span className="min-w-0 truncate font-mono text-xs text-black/40">owner</span>
          <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">
            2:25 PM
          </span>
        </div>
        <div className="break-words text-sm text-black">
          Quoting the state-ownership decision and its source note.
        </div>
        <button
          type="button"
          className="group mt-1.5 block w-full border border-black/15 bg-white text-left hover:border-black/30 hover:bg-black/5"
        >
          <span className="block px-2.5 py-2 sm:px-3 sm:py-2.5">
            <span className="mb-1 flex items-start gap-2 sm:mb-1.5">
              <span className="min-w-0 flex flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-none text-black/30">
                <span className="inline-flex items-center gap-1 font-bold text-black/70">
                  <Hash size={11} className="shrink-0" aria-hidden />
                  raft-ui-migration
                </span>
                <span>·</span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <span className="flex size-5 shrink-0 items-center justify-center border border-black bg-brutal-lavender text-[10px] font-bold text-black">
                    D
                  </span>
                  <span className="truncate font-bold text-black/70">Developer</span>
                  <span className="truncate font-mono text-[10px] text-black/40">member</span>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-bold text-brutal-pink">
                  <MessageSquare size={10} className="shrink-0" aria-hidden />
                  Thread
                </span>
              </span>
              <span className="shrink-0 font-mono text-[10px] text-black/40">Today · 8:17 AM</span>
            </span>
            <span className="block min-w-0">
              <span className="line-clamp-2 block text-xs leading-snug text-black sm:text-[13px]">
                Should we migrate from Zustand to Jotai? Jotai&apos;s atom model might be better for
                our store structure.
              </span>
              <span className="mt-2 inline-flex items-center gap-1 border-[1.5px] border-black bg-brutal-lavender px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-black">
                <FileText className="size-3" aria-hidden />
                state-ownership-migration-notes.md
              </span>
            </span>
          </span>
        </button>
      </div>
    </article>
  );
}
