import { Download } from "lucide-react";

export function MessageAttachmentSourcePreview() {
  return (
    <article className="flex w-full max-w-xl gap-3 bg-white p-4 font-sans text-black">
      <div className="flex size-9 shrink-0 items-center justify-center border-2 border-black bg-brutal-cyan text-sm font-bold">
        AP
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-bold">App Planner</span>
          <span className="font-mono text-xs text-black/50">3:04 PM</span>
        </div>
        <p className="mt-1 text-sm">Here is the source parity pass.</p>
        <div className="mt-2 flex min-w-0 flex-wrap gap-2">
          <button
            type="button"
            disabled
            aria-label="Download migration.diff"
            className="group/img relative inline-flex h-20 w-44 cursor-default flex-col justify-between overflow-hidden border border-black/15 bg-white px-2.5 py-2 text-left transition-colors hover:border-black/30 hover:bg-black/5"
          >
            <div className="w-full min-w-0 overflow-hidden">
              <p className="truncate text-xs font-bold">migration.diff</p>
              <p className="font-mono text-[10px] text-black/50">Diff · 18 KB</p>
            </div>
            <span className="pr-5 font-mono text-[10px] font-bold">+42 -7</span>
            <Download className="absolute right-1.5 bottom-1.5 size-3 text-black/60" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
