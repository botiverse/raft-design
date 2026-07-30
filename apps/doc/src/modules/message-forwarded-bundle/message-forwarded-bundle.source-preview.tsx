import { FileText } from "lucide-react";

export function MessageForwardedBundleSourcePreview() {
  return (
    <div
      className="mt-1 max-w-[min(34rem,100%)] border border-black/20 bg-white"
      data-testid="forwarded-bundle-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 bg-white px-2.5 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex shrink-0 text-[11px] font-black uppercase leading-none text-black/70">
            Forwarded
          </span>
          <span className="shrink-0 text-[11px] font-bold text-black/55">4 messages</span>
        </div>
        <button
          type="button"
          className="min-w-0 truncate text-[11px] font-bold text-black/50 underline-offset-2 transition-colors hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          data-testid="forwarded-bundle-source-label"
        >
          from release-notes
        </button>
      </div>
      <div className="relative max-h-[144px] overflow-hidden divide-y divide-black/10 sm:max-h-[180px]">
        <article className="bg-white px-3 py-2" data-testid="forwarded-bundle-item">
          <div className="mb-1 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-mono text-black/55">
            <span className="font-bold text-black/75">@Ada</span>
            <span aria-hidden>·</span>
            <time dateTime="2026-07-15T06:05:00.000Z">Jul 15, 2:05 PM</time>
          </div>
          <div className="text-sm text-black">
            Rollout is clear for the message reference migration.
          </div>
        </article>
        <article className="bg-white px-3 py-2" data-testid="forwarded-bundle-item">
          <div className="mb-1 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-mono text-black/55">
            <span className="font-bold text-black/75">@Will</span>
            <span aria-hidden>·</span>
            <time dateTime="2026-07-15T06:09:00.000Z">Jul 15, 2:09 PM</time>
          </div>
          <div className="text-sm text-black">
            Keep the source case with its attachment context.
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="inline-flex max-w-full items-center gap-1 border border-black/20 bg-white px-1.5 py-1 text-[11px] font-bold text-black/80">
              <FileText size={12} />
              <span className="min-w-0 truncate">release-notes.md</span>
              <span className="shrink-0 text-black/50">· MARKDOWN</span>
            </span>
          </div>
        </article>
        <article className="bg-white px-3 py-2" data-testid="forwarded-bundle-item">
          <div className="mb-1 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-mono text-black/55">
            <span className="font-bold text-black/75">@Mia</span>
            <span aria-hidden>·</span>
            <time dateTime="2026-07-15T06:12:00.000Z">Jul 15, 2:12 PM</time>
          </div>
          <div className="text-sm text-black">
            Keep the original context available to reviewers.
          </div>
        </article>
        <article className="bg-white px-3 py-2" data-testid="forwarded-bundle-item">
          <div className="mb-1 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-mono text-black/55">
            <span className="font-bold text-black/75">@Nia</span>
            <span aria-hidden>·</span>
            <time dateTime="2026-07-15T06:16:00.000Z">Jul 15, 2:16 PM</time>
          </div>
          <div className="text-sm text-black">
            Follow the same message state contract in the thread.
          </div>
        </article>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/80 to-white/0" />
      </div>
      <div className="border-t border-black/10 bg-white px-3 py-1.5">
        <button
          type="button"
          className="text-[11px] font-black text-black/60 underline underline-offset-2 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Show all 4 messages
        </button>
      </div>
    </div>
  );
}
