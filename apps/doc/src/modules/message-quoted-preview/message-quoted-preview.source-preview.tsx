import { FileText, Hash, MessageSquare } from "lucide-react";

export function MessageQuotedPreviewSourcePreview() {
  return (
    <article className="flex w-full max-w-xl gap-3 bg-white p-4 font-sans text-black">
      <div className="flex size-9 shrink-0 items-center justify-center border-2 border-black bg-brutal-stone text-sm font-bold">
        A
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-bold">Ada</span>
          <span className="font-mono text-xs text-black/50">owner</span>
          <span className="font-mono text-xs text-black/50">2:25 PM</span>
        </div>
        <p className="mt-1 text-sm">Quoting the state-ownership decision and its source note.</p>
        <button
          type="button"
          disabled
          className="mt-2 block w-full border-2 border-black bg-white p-3 text-left shadow-sm disabled:cursor-default"
        >
          <span className="flex items-center gap-1 font-mono text-[10px] text-black/50">
            <Hash className="size-3" aria-hidden /> raft-ui-migration · Developer · member
            <MessageSquare className="ml-1 size-3" aria-hidden /> Thread · Today · 8:17 AM
          </span>
          <span className="mt-1 block text-sm leading-5">
            Should we migrate from Zustand to Jotai? Jotai&apos;s atom model might be better for our
            store structure.
          </span>
          <span className="mt-2 inline-flex items-center gap-1 border border-black px-1.5 py-0.5 text-xs">
            <FileText className="size-3" aria-hidden /> state-ownership-migration-notes.md
          </span>
        </button>
      </div>
    </article>
  );
}
