import {
  ArrowDownUp,
  ArrowLeft,
  AtSign,
  CalendarRange,
  ChevronDown,
  Hash,
  MessageSquare,
  Search,
  User,
  UserCircle2,
  X,
} from "lucide-react";
import { Kbd } from "raft-ui";

import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { SearchComparisonPreviewFrame } from "./search-comparison-preview-frame.tsx";

const SOURCE_FILTERS = [
  { label: "From", icon: UserCircle2 },
  { label: "Scope", icon: AtSign },
  { label: "Channel", icon: Hash },
  { label: "Any Time", icon: CalendarRange },
  { label: "Relevant", icon: ArrowDownUp },
] as const;

const SOURCE_ROBOT_ROWS = [
  "_KKKKKK_",
  "KCKWWKCK",
  "KWKWWKWK",
  "KKKKKKKK",
  "_KWKKWK_",
  "_KKKKKK_",
  "_KK__KK_",
  "_KK__KK_",
] as const;

const SOURCE_PIXEL_COLORS = {
  _: "transparent",
  K: "#141111",
  W: "white",
  C: "var(--color-brutal-cyan)",
} as const;

function SourceIdentityAvatar({ type, size }: { type: "human" | "agent"; size: "list" | "mini" }) {
  const boxClass = size === "list" ? "size-8 border-2" : "size-[14px] border";
  const tone = type === "agent" ? "bg-brutal-cyan" : "bg-brutal-lavender";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border-black ${boxClass} ${tone}`}
    >
      {type === "agent" ? (
        <div
          aria-hidden
          className="grid size-full shrink-0 grid-cols-8 grid-rows-8"
          style={{ backgroundColor: SOURCE_PIXEL_COLORS.C, imageRendering: "pixelated" }}
        >
          {SOURCE_ROBOT_ROWS.flatMap((row, rowIndex) =>
            row.split("").map((color, columnIndex) => (
              <div
                key={`${rowIndex}-${columnIndex}`}
                style={{
                  backgroundColor:
                    SOURCE_PIXEL_COLORS[color as keyof typeof SOURCE_PIXEL_COLORS] ?? "transparent",
                }}
              />
            )),
          )}
        </div>
      ) : (
        <User aria-hidden size={size === "list" ? 16 : 10} />
      )}
    </div>
  );
}

function SourceFilterChip({ label, icon: Icon }: { label: string; icon: typeof UserCircle2 }) {
  return (
    <button
      type="button"
      aria-disabled="true"
      tabIndex={-1}
      className="inline-flex items-center gap-2 border-2 border-black/30 bg-white px-3 py-1.5 text-xs font-bold text-black/70 transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon aria-hidden size={14} />
      <span>{label}</span>
      <ChevronDown aria-hidden size={12} />
    </button>
  );
}

function SourceMessageHit({ nested = false }: { nested?: boolean }) {
  return (
    <button
      type="button"
      aria-disabled="true"
      tabIndex={-1}
      className={`w-full bg-white text-left transition-colors ${
        nested
          ? "border-t-2 border-black/10 px-3 py-3 hover:bg-black/[0.03]"
          : "border-2 border-black/30 p-3 hover:border-black hover:shadow-raft-sm active:border-black active:shadow-raft-sm"
      }`}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-black/50">#proj-uiux</span>
        {nested ? (
          <span className="inline-flex items-center gap-1 font-bold text-black/40">
            <MessageSquare aria-hidden size={10} /> thread
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 font-bold text-black">
          <SourceIdentityAvatar type={nested ? "agent" : "human"} size="mini" />
          <span>{nested ? "Atlas" : "Maya Chen"}</span>
        </span>
        <span className="font-mono text-black/40">2 hours ago</span>
      </div>
      <div className="line-clamp-2 text-sm leading-relaxed text-black/70">
        The Search <mark className="bg-primary px-0.5 font-bold text-black">preview</mark> keeps the
        original result structure and selected-state treatment.
      </div>
    </button>
  );
}

function FrozenSourceSearchPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex h-panel-header items-center gap-3 border-b-2 border-black bg-white px-5">
        <button
          type="button"
          title="Back"
          aria-disabled="true"
          tabIndex={-1}
          className="btn-brutal-sm inline-flex size-7 shrink-0 items-center justify-center bg-white font-bold leading-none text-black md:hidden"
        >
          <span className="sr-only">Back</span>
          <ArrowLeft aria-hidden size={14} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex size-icon-header shrink-0 items-center justify-center border-2 border-black bg-primary">
              <Search aria-hidden size={18} />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 border-2 border-black bg-white px-3 py-2 shadow-raft-sm focus-within:shadow-raft-md">
              <input
                value="preview"
                readOnly
                tabIndex={-1}
                aria-label="Search channels, DMs, people, agents, and messages"
                className="min-w-0 flex-1 bg-transparent text-sm font-display font-medium outline-none placeholder:text-black/40"
              />
              <button
                type="button"
                aria-disabled="true"
                tabIndex={-1}
                className="btn-brutal-sm bg-white p-1"
                aria-label="Clear search"
              >
                <X aria-hidden size={12} />
              </button>
              <Kbd className="hidden text-[10px] font-bold uppercase text-black/50 sm:inline">
                Esc
              </Kbd>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-b-2 border-black bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {SOURCE_FILTERS.map((filter) => (
            <SourceFilterChip key={filter.label} {...filter} />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <div className="p-4">
          <div className="mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-black/60">
              5 results
            </span>
          </div>

          <div className="mb-3">
            <div className="px-1 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black/50">
              Server entities
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex w-full items-stretch border-2 border-black bg-white text-left shadow-raft-sm transition-colors">
                <button
                  type="button"
                  aria-disabled="true"
                  tabIndex={-1}
                  className="min-w-0 flex-1 p-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex shrink-0">
                      <div className="flex size-8 items-center justify-center overflow-hidden border-2 border-black bg-primary text-black">
                        <Hash aria-hidden size={14} />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-black">proj-uiux</span>
                        <span className="border border-black bg-white px-1 py-0.5 text-[9px] font-bold uppercase leading-none text-black/60">
                          Channel
                        </span>
                      </div>
                      <div className="truncate text-xs text-black/50">Channel</div>
                    </div>
                  </div>
                </button>
              </div>
              <div className="flex w-full items-stretch border-2 border-black/30 bg-white text-left transition-colors hover:border-black hover:shadow-raft-sm active:border-black active:shadow-raft-sm">
                <button
                  type="button"
                  aria-disabled="true"
                  tabIndex={-1}
                  className="min-w-0 flex-1 p-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex shrink-0">
                      <SourceIdentityAvatar type="agent" size="list" />
                      <span
                        aria-label="Active"
                        className="absolute -right-0.5 -bottom-0.5 inline-block size-2.5 shrink-0 rounded-full border border-black bg-brutal-lime"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-black">Atlas</span>
                        <span className="border border-black bg-white px-1 py-0.5 text-[9px] font-bold uppercase leading-none text-black/60">
                          Agent
                        </span>
                      </div>
                      <div className="truncate text-xs text-black/50">@atlas</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="px-1 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black/50">
              Messages
            </div>
            <div className="flex flex-col gap-2">
              <SourceMessageHit />
              <div className="overflow-hidden border-2 border-black/30 bg-white transition-colors hover:border-black hover:shadow-raft-sm">
                <div className="border-b-2 border-black bg-[#ffeefb] px-3 py-2">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-black/70">
                    <span className="inline-flex items-center gap-1 border border-black bg-white px-1.5 py-0.5">
                      <MessageSquare aria-hidden size={11} /> Thread
                    </span>
                    <span className="normal-case">#proj-uiux</span>
                    <span>2 hits</span>
                    <span className="font-mono normal-case text-black/50">2 hours ago</span>
                  </div>
                  <div className="text-sm font-bold text-black">Search source-parity review</div>
                </div>
                <div className="flex flex-col [&>*:first-child]:border-t-0">
                  <SourceMessageHit nested />
                  <SourceMessageHit nested />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchSourcePreview() {
  return (
    <SearchComparisonPreviewFrame>
      <SourceThemeScope className="flex h-full min-h-0 flex-col">
        <FrozenSourceSearchPanel />
      </SourceThemeScope>
    </SearchComparisonPreviewFrame>
  );
}
