import { useRef, useState } from "react";
import {
  ArrowDownUp,
  AtSign,
  CalendarRange,
  ChevronDown,
  Hash,
  UserCircle2,
  X,
} from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxClear,
  ComboboxEmpty,
  ComboboxHeader,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxTriggerIndicator,
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectSeparator,
  SelectTrigger,
} from "raft-ui";

import type { SearchChannelFixture, SearchSenderFixture } from "../search.fixtures.ts";
import {
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

const SEARCH_SCOPES = ["mentioned", "humans", "agents"] as const;
const SEARCH_TIME_RANGES = ["any", "today", "7d", "30d"] as const;
const SEARCH_SORTS = ["relevance", "recent"] as const;

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

const SEARCH_TIME_RANGE_ITEMS = SEARCH_TIME_RANGES.map((value) => ({
  label: timeLabel(value),
  value,
}));
const SEARCH_SORT_ITEMS = SEARCH_SORTS.map((value) => ({
  label: value === "relevance" ? "Relevant" : "Recent",
  value,
}));

const filterTriggerClass = [
  "h-8 w-auto px-3 py-0 text-xs font-bold",
  "border-black/30 bg-white text-black/70 shadow-none",
  "hover:border-black hover:bg-white hover:shadow-none",
  "disabled:cursor-not-allowed disabled:bg-white disabled:text-black/70 disabled:opacity-50",
  "data-[has-value]:border-black data-[has-value]:bg-soft-signal data-[has-value]:text-black data-[has-value]:shadow-sm",
  "data-[has-value]:hover:bg-soft-signal data-[has-value]:hover:shadow-sm data-[has-value]:active:shadow-sm",
].join(" ");
const filterContentClass = "min-w-[220px]";

function selectTriggerClass(active: boolean) {
  return [
    filterTriggerClass,
    active
      ? "border-black bg-soft-signal text-black shadow-sm hover:bg-soft-signal hover:shadow-sm"
      : "",
  ].join(" ");
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
  const portalRef = useRef<HTMLDivElement>(null);
  const [senderQuery, setSenderQuery] = useState(showEmptySenderPopup ? "Nobody" : "");
  const [channelQuery, setChannelQuery] = useState("");
  const filteredSenders = senders.filter((item) =>
    matches(`${item.label} ${item.handle}`, senderQuery),
  );
  const filteredChannels = channels.filter((item) => matches(item.name, channelQuery));
  const hasActiveFilters = Boolean(sender || channel || scopes.length || timeRange !== "any");

  return (
    <div ref={portalRef} className="shrink-0 border-b-2 border-black bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Combobox<string>
          autoHighlight
          defaultOpen={showEmptySenderPopup}
          inputValue={senderQuery}
          items={filteredSenders.map((item) => item.id)}
          itemToStringLabel={(id) => senders.find((item) => item.id === id)?.label ?? id}
          value={sender?.id ?? null}
          onInputValueChange={(nextValue, details) => {
            if (details.reason !== "item-press") setSenderQuery(nextValue);
          }}
          onValueChange={(nextValue) => {
            onSenderChange(senders.find((item) => item.id === nextValue) ?? null);
          }}
        >
          <ComboboxTrigger aria-label="From" className={filterTriggerClass}>
            <UserCircle2 aria-hidden size={14} />
            <span>{sender ? `From: ${sender.isCurrentUser ? "Me" : sender.label}` : "From"}</span>
            <ComboboxTriggerIndicator>
              <ChevronDown aria-hidden />
            </ComboboxTriggerIndicator>
          </ComboboxTrigger>
          <ComboboxContent
            align="start"
            className={filterContentClass}
            finalFocus={false}
            initialFocus={false}
            portalProps={{ container: portalRef }}
            positionMethod="absolute"
          >
            <ComboboxHeader>
              <ComboboxLabel>From</ComboboxLabel>
              <ComboboxClear>Clear</ComboboxClear>
            </ComboboxHeader>
            <ComboboxSeparator />
            <ComboboxInputGroup>
              <ComboboxInput
                aria-label="Search senders"
                placeholder="Search…"
                suppressPasswordManager
              />
            </ComboboxInputGroup>
            <ComboboxList>
              {filteredSenders.map((item) => (
                <ComboboxItem key={item.id} value={item.id}>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center">
                      <SourceIdentityAvatar
                        context="compact-list"
                        type={item.kind}
                        avatar={item.avatar}
                      />
                    </span>
                    <span className="truncate">{item.isCurrentUser ? "Me" : item.label}</span>
                  </span>
                  <ComboboxItemIndicator />
                </ComboboxItem>
              ))}
            </ComboboxList>
            <ComboboxEmpty>No matches</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>

        <Combobox<BrutalSearchScope, true>
          multiple
          autoHighlight
          items={SEARCH_SCOPES}
          value={[...scopes]}
          onValueChange={(nextValue) => onScopesChange(nextValue)}
        >
          <ComboboxTrigger aria-label="Scope" className={filterTriggerClass}>
            <AtSign aria-hidden size={14} />
            <span>
              {scopes.length === 0
                ? "Scope"
                : scopes.length === 1 && scopes[0]
                  ? scopeLabel(scopes[0])
                  : `${scopes.length} filters`}
            </span>
            <ComboboxTriggerIndicator>
              <ChevronDown aria-hidden />
            </ComboboxTriggerIndicator>
          </ComboboxTrigger>
          <ComboboxContent
            align="start"
            className={filterContentClass}
            finalFocus={false}
            initialFocus={false}
            portalProps={{ container: portalRef }}
            positionMethod="absolute"
          >
            <ComboboxHeader>
              <ComboboxLabel>Scope</ComboboxLabel>
              <ComboboxClear>Clear</ComboboxClear>
            </ComboboxHeader>
            <ComboboxSeparator />
            <ComboboxList>
              {SEARCH_SCOPES.map((scope) => (
                <ComboboxItem key={scope} value={scope}>
                  <span>{scopeLabel(scope)}</span>
                  <ComboboxItemIndicator />
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        {channel ? (
          <button
            type="button"
            onClick={() => onChannelChange(null)}
            className="inline-flex items-center gap-2 border-2 border-black bg-soft-signal px-3 py-1.5 text-xs font-bold text-black shadow-sm"
          >
            <Hash aria-hidden size={12} />#{channel.name}
            <X aria-hidden size={10} />
          </button>
        ) : (
          <Combobox<string>
            autoHighlight
            inputValue={channelQuery}
            items={filteredChannels.map((item) => item.id)}
            itemToStringLabel={(id) => channels.find((item) => item.id === id)?.name ?? id}
            value={null}
            onInputValueChange={(nextValue, details) => {
              if (details.reason !== "item-press") setChannelQuery(nextValue);
            }}
            onValueChange={(nextValue) => {
              onChannelChange(channels.find((item) => item.id === nextValue) ?? null);
            }}
          >
            <ComboboxTrigger aria-label="Channel" className={filterTriggerClass}>
              <Hash aria-hidden size={14} />
              <span>Channel</span>
              <ComboboxTriggerIndicator>
                <ChevronDown aria-hidden />
              </ComboboxTriggerIndicator>
            </ComboboxTrigger>
            <ComboboxContent
              align="start"
              className={filterContentClass}
              finalFocus={false}
              initialFocus={false}
              portalProps={{ container: portalRef }}
              positionMethod="absolute"
            >
              <ComboboxHeader>
                <ComboboxLabel>Channels</ComboboxLabel>
              </ComboboxHeader>
              <ComboboxSeparator />
              <ComboboxInputGroup>
                <ComboboxInput
                  aria-label="Search channels"
                  placeholder="Search…"
                  suppressPasswordManager
                />
              </ComboboxInputGroup>
              <ComboboxList>
                {filteredChannels.map((item) => (
                  <ComboboxItem key={item.id} value={item.id}>
                    <span className="flex size-5 shrink-0 items-center justify-center">
                      <Hash aria-hidden size={12} className="text-black/50" />
                    </span>
                    <span>#{item.name}</span>
                    <ComboboxItemIndicator />
                  </ComboboxItem>
                ))}
              </ComboboxList>
              <ComboboxEmpty>No matches</ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
        )}

        <Select<BrutalSearchTimeRange>
          items={SEARCH_TIME_RANGE_ITEMS}
          value={timeRange}
          onValueChange={(nextValue) => {
            if (nextValue) onTimeRangeChange(nextValue);
          }}
        >
          <SelectTrigger
            aria-label="Time range"
            className={selectTriggerClass(timeRange !== "any")}
          >
            <CalendarRange aria-hidden size={14} />
            <span>{timeLabel(timeRange)}</span>
            <SelectIcon>
              <ChevronDown aria-hidden />
            </SelectIcon>
          </SelectTrigger>
          <SelectContent
            align="start"
            className={filterContentClass}
            portalProps={{ container: portalRef }}
            positionMethod="absolute"
          >
            <SelectList>
              <SelectGroup>
                <SelectGroupLabel>Time</SelectGroupLabel>
                <SelectSeparator />
                {SEARCH_TIME_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    <SelectItemText>{timeLabel(range)}</SelectItemText>
                    <SelectItemIndicator />
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectList>
          </SelectContent>
        </Select>

        <Select<BrutalSearchSort>
          disabled={!query.trim()}
          items={SEARCH_SORT_ITEMS}
          value={sort}
          onValueChange={(nextValue) => {
            if (nextValue) onSortChange(nextValue);
          }}
        >
          <SelectTrigger aria-label="Sort" className={selectTriggerClass(sort !== "relevance")}>
            <ArrowDownUp aria-hidden size={14} />
            <span>{sort === "recent" ? "Recent" : "Relevant"}</span>
            <SelectIcon>
              <ChevronDown aria-hidden />
            </SelectIcon>
          </SelectTrigger>
          <SelectContent
            align="start"
            className={filterContentClass}
            portalProps={{ container: portalRef }}
            positionMethod="absolute"
          >
            <SelectList>
              <SelectGroup>
                <SelectGroupLabel>Sort</SelectGroupLabel>
                <SelectSeparator />
                {SEARCH_SORTS.map((item) => (
                  <SelectItem key={item} value={item}>
                    <SelectItemText>{item === "relevance" ? "Relevant" : "Recent"}</SelectItemText>
                    <SelectItemIndicator />
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectList>
          </SelectContent>
        </Select>

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
