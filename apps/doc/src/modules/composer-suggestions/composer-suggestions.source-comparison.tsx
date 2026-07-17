import { UserX } from "lucide-react";

const sourcePeople = [
  {
    name: "Atlas",
    description: "Design",
    handle: "atlas",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=96&q=80",
  },
  {
    name: "Avery",
    description: "Engineering",
    handle: "avery",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=80",
  },
] as const;

/** Static reference of the source MessageInput mention popup. */
export function ComposerSuggestionsSourceComparison() {
  return (
    <div className="h-[21rem] w-full max-w-[560px] p-3">
      <div className="flex h-full flex-col justify-end gap-1">
        <div className="max-h-44 overflow-y-auto border-2 border-black bg-white shadow-brutal">
          <div className="px-3 py-1.5 text-xs font-semibold text-black">In this channel</div>
          {sourcePeople.map((person, index) => (
            <div
              key={person.handle}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-black ${
                index === 0 ? "bg-[oklch(0.94_0.08_90)] font-bold" : ""
              }`}
            >
              <img
                src={person.avatar}
                alt=""
                className="size-6 shrink-0 rounded-full object-cover ring-1 ring-black/10"
              />
              <span className="min-w-0 shrink-0 truncate">{person.name}</span>
              <span className="min-w-0 flex-1 truncate text-xs font-normal text-black/50">
                {person.description}
              </span>
              <span className="ml-auto shrink-0 font-mono text-xs font-normal text-black/40">
                @{person.handle}
              </span>
            </div>
          ))}
          <div className="border-t-2 border-black px-3 py-1.5 text-xs font-semibold text-black">
            Not in this channel
          </div>
          <div className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-black/50">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-semibold">
              M
            </span>
            <UserX aria-hidden className="-ml-1 size-3 shrink-0 text-black/40" />
            <span className="min-w-0 flex-1 truncate">Morgan</span>
            <span className="ml-auto shrink-0 font-mono text-xs font-normal text-black/30">
              @morgan
            </span>
          </div>
        </div>
        <div className="shrink-0 border-2 border-black bg-white p-2 shadow-brutal">
          <div className="min-h-8 text-sm text-black/40">@</div>
          <div className="mt-2 flex items-center justify-between border-t-2 border-black pt-2 text-xs font-medium text-black">
            <span>Attach</span>
            <span className="border-2 border-black bg-[oklch(0.78_0.19_0)] px-2 py-1">Send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
