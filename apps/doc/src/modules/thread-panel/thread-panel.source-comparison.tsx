import { ChevronDown, ChevronUp, Search, User, X } from "lucide-react";

import { ThreadPanelComposition } from "./thread-panel.composition.tsx";

export function ThreadPanelComparisonComposition() {
  return (
    <div className="h-[36rem] w-full max-w-[34rem] overflow-hidden bg-layer-panel">
      <ThreadPanelComposition search />
    </div>
  );
}

export function ThreadPanelSourcePreview() {
  return (
    <section className="flex h-[36rem] w-full max-w-[34rem] flex-col overflow-hidden border-2 border-black bg-white font-sans text-black">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b-2 border-black px-4">
        <h3 className="min-w-0 flex-1 truncate font-bold">Thread — #acme-design</h3>
        <Search className="size-4" aria-hidden />
        <X className="size-4" aria-hidden />
      </header>
      <div className="flex shrink-0 items-center gap-2 border-b-2 border-black p-2">
        <Search className="size-4 shrink-0 text-black/50" aria-hidden />
        <span className="min-w-0 flex-1 border-2 border-black px-2 py-1 text-sm">chrome</span>
        <span className="font-mono text-xs text-black/50">1/2</span>
        <ChevronUp className="size-4" aria-hidden />
        <ChevronDown className="size-4" aria-hidden />
      </div>
      <div className="shrink-0 border-b-2 border-black p-3">
        <SourceThreadMessage sender="Cindy" time="10:08">
          Should ThreadPanel own the right-panel chrome?
        </SourceThreadMessage>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden p-3">
        <p className="mb-3 border-b-2 border-black pb-2 font-mono text-xs font-bold uppercase">
          10 replies · Today
        </p>
        <div className="grid gap-4">
          <SourceThreadMessage sender="Atlas" time="10:11">
            ThreadPanel owns the header, body, action, and footer chrome.
          </SourceThreadMessage>
          <SourceThreadMessage sender="Noah" time="10:14">
            Keep the original message pinned above the scroll body.
          </SourceThreadMessage>
          <SourceThreadMessage sender="Mia" time="10:19">
            Verify the message list overflow and composer clearance.
          </SourceThreadMessage>
        </div>
      </div>
      <footer className="shrink-0 border-t-2 border-black p-3">
        <div className="border-2 border-black px-3 py-2 text-sm text-black/50">Message thread</div>
      </footer>
    </section>
  );
}

function SourceThreadMessage({
  sender,
  time,
  children,
}: {
  sender: string;
  time: string;
  children: string;
}) {
  return (
    <article className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center border-2 border-black bg-brutal-lavender">
        <User className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <p>
          <strong>{sender}</strong> <span className="font-mono text-xs text-black/50">{time}</span>
        </p>
        <p>{children}</p>
      </div>
    </article>
  );
}
