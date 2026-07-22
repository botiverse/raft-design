import { ChevronDown, FileText } from "lucide-react";

export function MessageForwardedBundleSourcePreview() {
  return (
    <article className="flex w-full max-w-xl gap-3 bg-white p-4 font-sans text-black">
      <div className="flex size-9 shrink-0 items-center justify-center border-2 border-black bg-brutal-lavender text-sm font-bold">
        AT
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-bold">Atlas</span>
          <span className="font-mono text-xs text-black/50">owner</span>
          <span className="font-mono text-xs text-black/50">2:24 PM</span>
        </div>
        <p className="mt-1 text-sm">Forwarded 4 messages</p>
        <div className="mt-2 overflow-hidden border-2 border-black bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b-2 border-black bg-brutal-stone px-3 py-2 text-xs font-bold">
            <span>Forwarded · 4 messages</span>
            <button type="button" disabled className="cursor-default truncate text-black/60">
              from release-notes
            </button>
          </div>
          <div className="grid gap-3 p-3 text-sm">
            <div>
              <p className="font-mono text-[10px] text-black/50">@Ada · Jul 15, 2:05 PM</p>
              <p>Rollout is clear for the message reference migration.</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-black/50">@Will · Jul 15, 2:09 PM</p>
              <p>Keep the source case with its attachment context.</p>
              <span className="mt-1 inline-flex items-center gap-1 border border-black px-1.5 py-0.5 text-xs">
                <FileText className="size-3" aria-hidden /> release-notes.md
              </span>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="flex w-full cursor-default items-center justify-center gap-1 border-t-2 border-black px-3 py-2 text-xs font-bold"
          >
            Show all 4 messages <ChevronDown className="size-3" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
