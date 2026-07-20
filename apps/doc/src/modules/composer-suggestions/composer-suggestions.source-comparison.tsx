import { ImagePlus, Paperclip, Send, UserX } from "lucide-react";

import LegacyAvatarSlot from "../../../../../packages/ui/src/legacy/AvatarSlot.tsx";
import SectionEyebrow from "../../../../../packages/ui/src/legacy/SectionEyebrow.tsx";

const sourcePeople = [
  {
    name: "Atlas",
    description: "Design",
    handle: "atlas",
    type: "agent" as const,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=96&q=80",
  },
  {
    name: "Avery",
    description: "Engineering",
    handle: "avery",
    type: "human" as const,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=80",
  },
] as const;

/**
 * Static reference of the source MessageInput mention popup + composer chrome.
 * ClassNames mirror MessageInput.tsx (mention autocomplete + composer card).
 */
export function ComposerSuggestionsSourceComparison() {
  return (
    <div className="h-[21rem] w-full max-w-[560px] p-3">
      <div className="flex h-full flex-col justify-end gap-1">
        <div className="max-h-48 overflow-y-auto border-2 border-black bg-white shadow-brutal">
          <SectionEyebrow as="div" className="px-3 py-1.5">
            In this channel
          </SectionEyebrow>
          {sourcePeople.map((person, index) => {
            const selected = index === 0;
            return (
              <div
                key={person.handle}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  selected ? "bg-soft-signal font-bold text-black" : "text-black"
                }`}
              >
                <LegacyAvatarSlot
                  context="compact-list"
                  type={person.type}
                  agentAvatarUrl={person.type === "agent" ? person.avatar : undefined}
                  humanAvatarUrl={person.type === "human" ? person.avatar : undefined}
                />
                <div className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                  <span className="max-w-[45%] shrink-0 truncate text-black sm:max-w-[35%]">
                    {person.name}
                  </span>
                  {person.type === "agent" ? (
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 animate-pulse rounded-full border border-black bg-soft-signal"
                    />
                  ) : null}
                  <span
                    className={`min-w-0 flex-1 truncate text-xs font-normal ${
                      selected ? "text-black/70" : "text-black/50"
                    }`}
                  >
                    {person.description}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-xs text-black/40">
                    @{person.handle}
                  </span>
                </div>
              </div>
            );
          })}
          <SectionEyebrow as="div" className="border-t-2 border-black px-3 py-1.5">
            Not in this channel
          </SectionEyebrow>
          <div className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-black/50 transition-colors">
            <LegacyAvatarSlot
              context="compact-list"
              type="human"
              humanPlaceholder
              className="!border-black/40 opacity-60 [&_svg]:opacity-50"
            />
            <UserX aria-hidden size={12} className="-ml-1 shrink-0 text-black/40" />
            <div className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
              <span className="min-w-0 truncate text-black/50">Morgan</span>
              <span className="ml-auto shrink-0 font-mono text-xs text-black/30">@morgan</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-2 border-black bg-white p-2 shadow-brutal-sm">
          <div className="min-h-5 font-display text-base leading-5 text-black/40 md:min-h-10 md:text-sm">
            @
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="btn-brutal-sm bg-white p-1" aria-hidden>
                <ImagePlus className="size-3.5" />
              </span>
              <span className="btn-brutal-sm bg-white p-1" aria-hidden>
                <Paperclip className="size-3.5" />
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex select-none items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-flex size-3.5 shrink-0 items-center justify-center border-2 border-black bg-white"
                />
                <span className="text-xs font-bold text-black/60">As Task</span>
              </span>
              <span
                aria-hidden
                className="btn-brutal-sm flex size-7 shrink-0 items-center justify-center bg-brutal-pink p-0"
              >
                <Send className="size-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
