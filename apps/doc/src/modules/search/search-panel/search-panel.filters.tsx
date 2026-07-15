import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownUp,
  AtSign,
  CalendarRange,
  ChevronDown,
  Hash,
  UserCircle2,
  X,
} from "lucide-react";
import type { SearchChannelFixture, SearchSenderFixture } from "../search.fixtures.ts";
import {
  BrutalSelectionPopover,
  FilterChip,
  SourceIdentityAvatar,
  type BrutalSearchScope,
  type BrutalSearchSort,
  type BrutalSearchTimeRange,
} from "./search-panel.parts.tsx";

type SearchFiltersProps = {
  senders: readonly SearchSenderFixture[];
  channels: readonly SearchChannelFixture[];
  query: string;
  sender: SearchSenderFixture | null;
  channel: SearchChannelFixture | null;
  scopes: readonly BrutalSearchScope[];
  timeRange: BrutalSearchTimeRange;
  sort: BrutalSearchSort;
  showEmptySenderPopup?: boolean;
  onSenderChange: (sender: SearchSenderFixture | null) => void;
  onChannelChange: (channel: SearchChannelFixture | null) => void;
  onScopesChange: (scopes: BrutalSearchScope[]) => void;
  onTimeRangeChange: (range: BrutalSearchTimeRange) => void;
  onSortChange: (sort: BrutalSearchSort) => void;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function matches(value: string, query: string) {
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => normalize(value).includes(token));
}

function timeLabel(value: BrutalSearchTimeRange) {
  if (value === "today") return "Today";
  if (value === "7d") return "Last 7 Days";
  if (value === "30d") return "Last 30 Days";
  return "Any Time";
}

function scopeLabel(value: BrutalSearchScope) {
  if (value === "mentioned") return "@ Me";
  if (value === "humans") return "Humans";
  return "Agents";
}

export function BrutalSearchFilters({
  senders,
  channels,
  query,
  sender,
  channel,
  scopes,
  timeRange,
  sort,
  showEmptySenderPopup = false,
  onSenderChange,
  onChannelChange,
  onScopesChange,
  onTimeRangeChange,
  onSortChange,
}: SearchFiltersProps) {
  const activeMenuRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<"sender" | "scope" | "channel" | "time" | "sort" | null>(
    showEmptySenderPopup ? "sender" : null,
  );
  const [senderQuery, setSenderQuery] = useState(showEmptySenderPopup ? "Nobody" : "");
  const [channelQuery, setChannelQuery] = useState("");
  const scopeSet = useMemo(() => new Set(scopes), [scopes]);
  const filteredSenders = senders.filter((item) =>
    matches(`${item.label} ${item.handle}`, senderQuery),
  );
  const filteredChannels = channels.filter((item) => matches(item.name, channelQuery));
  const hasActiveFilters = Boolean(sender || channel || scopes.length || timeRange !== "any");

  useEffect(() => {
    if (!openMenu) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!activeMenuRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [openMenu]);

  return (
    <div
      className="shrink-0 border-b-2 border-black bg-white px-4 py-3"
      onKeyDown={(event) => {
        if (!openMenu || event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        setOpenMenu(null);
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div ref={openMenu === "sender" ? activeMenuRef : undefined} className="relative">
          <FilterChip
            active={Boolean(sender)}
            onClick={() => setOpenMenu(openMenu === "sender" ? null : "sender")}
          >
            <UserCircle2 aria-hidden size={14} />
            <span>{sender ? `From: ${sender.isCurrentUser ? "Me" : sender.label}` : "From"}</span>
            <ChevronDown aria-hidden size={12} />
          </FilterChip>
          {openMenu === "sender" ? (
            <BrutalSelectionPopover
              title="From"
              search={senderQuery}
              onSearchChange={setSenderQuery}
              onSearchKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setOpenMenu(null);
                } else if (event.key === "Enter" && filteredSenders[0]) {
                  event.preventDefault();
                  onSenderChange(filteredSenders[0]);
                  setOpenMenu(null);
                }
              }}
              showClear={Boolean(sender)}
              onClear={() => {
                onSenderChange(null);
                setOpenMenu(null);
              }}
              options={filteredSenders.map((item) => ({
                key: item.id,
                checked: sender?.id === item.id,
                label: item.isCurrentUser ? "Me" : item.label,
                reserveLeadingSlot: true,
                leading: (
                  <SourceIdentityAvatar
                    context="compact-list"
                    type={item.kind}
                    avatar={item.avatar}
                  />
                ),
                onClick: () => {
                  onSenderChange(item);
                  setOpenMenu(null);
                },
              }))}
            />
          ) : null}
        </div>

        <div ref={openMenu === "scope" ? activeMenuRef : undefined} className="relative">
          <FilterChip
            active={scopes.length > 0}
            onClick={() => setOpenMenu(openMenu === "scope" ? null : "scope")}
          >
            <AtSign aria-hidden size={14} />
            <span>
              {scopes.length === 0
                ? "Scope"
                : scopes.length === 1 && scopes[0]
                  ? scopeLabel(scopes[0])
                  : `${scopes.length} filters`}
            </span>
            <ChevronDown aria-hidden size={12} />
          </FilterChip>
          {openMenu === "scope" ? (
            <BrutalSelectionPopover
              title="Scope"
              showClear={scopes.length > 0}
              onClear={() => onScopesChange([])}
              options={(["mentioned", "humans", "agents"] as const).map((item) => ({
                key: item,
                checked: scopeSet.has(item),
                label: scopeLabel(item),
                onClick: () =>
                  onScopesChange(
                    scopes.includes(item)
                      ? scopes.filter((scope) => scope !== item)
                      : [...scopes, item],
                  ),
              }))}
            />
          ) : null}
        </div>

        {channel ? (
          <button
            type="button"
            onClick={() => onChannelChange(null)}
            className="inline-flex items-center gap-2 border-2 border-black bg-soft-signal px-3 py-1.5 text-xs font-bold shadow-brutal-sm"
          >
            <Hash aria-hidden size={12} />#{channel.name}
            <X aria-hidden size={10} />
          </button>
        ) : (
          <div ref={openMenu === "channel" ? activeMenuRef : undefined} className="relative">
            <FilterChip
              ariaLabel="Open channel filter"
              onClick={() => setOpenMenu(openMenu === "channel" ? null : "channel")}
            >
              <Hash aria-hidden size={14} />
              <span>Channel</span>
              <ChevronDown aria-hidden size={12} />
            </FilterChip>
            {openMenu === "channel" ? (
              <BrutalSelectionPopover
                title="Channels"
                search={channelQuery}
                onSearchChange={setChannelQuery}
                onSearchKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setOpenMenu(null);
                  } else if (event.key === "Enter" && filteredChannels[0]) {
                    event.preventDefault();
                    onChannelChange(filteredChannels[0]);
                    setOpenMenu(null);
                  }
                }}
                options={filteredChannels.map((item) => ({
                  key: item.id,
                  checked: false,
                  label: `#${item.name}`,
                  leading: <Hash aria-hidden size={12} className="text-black/50" />,
                  onClick: () => {
                    onChannelChange(item);
                    setOpenMenu(null);
                  },
                }))}
              />
            ) : null}
          </div>
        )}

        <div ref={openMenu === "time" ? activeMenuRef : undefined} className="relative">
          <FilterChip
            active={timeRange !== "any"}
            onClick={() => setOpenMenu(openMenu === "time" ? null : "time")}
          >
            <CalendarRange aria-hidden size={14} />
            <span>{timeLabel(timeRange)}</span>
            <ChevronDown aria-hidden size={12} />
          </FilterChip>
          {openMenu === "time" ? (
            <BrutalSelectionPopover
              title="Time"
              options={(["any", "today", "7d", "30d"] as const).map((item) => ({
                key: item,
                checked: timeRange === item,
                label: timeLabel(item),
                onClick: () => {
                  onTimeRangeChange(item);
                  setOpenMenu(null);
                },
              }))}
            />
          ) : null}
        </div>

        <div ref={openMenu === "sort" ? activeMenuRef : undefined} className="relative">
          <FilterChip
            active={sort !== "relevance"}
            disabled={!query.trim()}
            onClick={() => setOpenMenu(openMenu === "sort" ? null : "sort")}
          >
            <ArrowDownUp aria-hidden size={14} />
            <span>{sort === "recent" ? "Recent" : "Relevant"}</span>
            <ChevronDown aria-hidden size={12} />
          </FilterChip>
          {openMenu === "sort" ? (
            <BrutalSelectionPopover
              title="Sort"
              options={(["relevance", "recent"] as const).map((item) => ({
                key: item,
                checked: sort === item,
                label: item === "relevance" ? "Relevant" : "Recent",
                onClick: () => {
                  onSortChange(item);
                  setOpenMenu(null);
                },
              }))}
            />
          ) : null}
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={() => {
              onSenderChange(null);
              onChannelChange(null);
              onScopesChange([]);
              onTimeRangeChange("any");
            }}
            className="inline-flex items-center gap-2 border border-black bg-white px-2.5 py-1 text-[11px] font-bold text-black/60 hover:text-black"
          >
            Clear All
          </button>
        ) : null}
      </div>
    </div>
  );
}
