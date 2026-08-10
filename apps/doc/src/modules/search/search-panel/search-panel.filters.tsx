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
  Button,
  Combobox,
  ComboboxClear,
  ComboboxContent,
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
  PickerTriggerButton,
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
  SearchShellFilters,
} from "raft-ui";

import type { SearchChannelFixture, SearchSenderFixture } from "../search.fixtures.ts";
import {
  SourceIdentityAvatar,
  type SearchScope,
  type SearchSort,
  type SearchTimeRange,
} from "./search-panel.parts.tsx";
type SearchFiltersProps = {
  senders: readonly SearchSenderFixture[];
  channels: readonly SearchChannelFixture[];
  query: string;
  sender: SearchSenderFixture | null;
  channel: SearchChannelFixture | null;
  scopes: readonly SearchScope[];
  timeRange: SearchTimeRange;
  sort: SearchSort;
  showEmptySenderPopup?: boolean;
  onSenderChange: (sender: SearchSenderFixture | null) => void;
  onChannelChange: (channel: SearchChannelFixture | null) => void;
  onScopesChange: (scopes: SearchScope[]) => void;
  onTimeRangeChange: (range: SearchTimeRange) => void;
  onSortChange: (sort: SearchSort) => void;
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

function timeLabel(value: SearchTimeRange) {
  if (value === "today") return "Today";
  if (value === "7d") return "Last 7 Days";
  if (value === "30d") return "Last 30 Days";
  return "Any Time";
}

function scopeLabel(value: SearchScope) {
  if (value === "mentioned") return "@ Me";
  if (value === "humans") return "Humans";
  return "Agents";
}

const SEARCH_TIME_RANGE_ITEMS = SEARCH_TIME_RANGES.map((value) => ({
  label: timeLabel(value),
  value,
}));
const SEARCH_SCOPE_ITEMS = SEARCH_SCOPES.map((value) => ({
  label: scopeLabel(value),
  value,
}));
const SEARCH_SORT_ITEMS = SEARCH_SORTS.map((value) => ({
  label: value === "relevance" ? "Relevant" : "Recent",
  value,
}));

export function SearchFilters({
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
    <SearchShellFilters ref={portalRef}>
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
          <ComboboxTrigger aria-label="From" render={<PickerTriggerButton />}>
            <UserCircle2 aria-hidden size={14} />
            <span>{sender ? `From: ${sender.isCurrentUser ? "Me" : sender.label}` : "From"}</span>
            <ComboboxTriggerIndicator>
              <ChevronDown aria-hidden />
            </ComboboxTriggerIndicator>
          </ComboboxTrigger>
          <ComboboxContent
            align="start"
            finalFocus={false}
            initialFocus={false}
            portalProps={{ container: portalRef }}
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

        <Select<SearchScope, true>
          multiple
          items={SEARCH_SCOPE_ITEMS}
          value={[...scopes]}
          onValueChange={(nextValue) => onScopesChange(nextValue)}
        >
          <SelectTrigger aria-label="Scope" render={<PickerTriggerButton />}>
            <AtSign aria-hidden size={14} />
            <span>
              {scopes.length === 0
                ? "Scope"
                : scopes.length === 1 && scopes[0]
                  ? scopeLabel(scopes[0])
                  : `${scopes.length} filters`}
            </span>
            <SelectIcon>
              <ChevronDown aria-hidden />
            </SelectIcon>
          </SelectTrigger>
          <SelectContent align="start" portalProps={{ container: portalRef }}>
            <SelectList>
              <SelectGroup>
                <SelectGroupLabel>Scope</SelectGroupLabel>
                <SelectSeparator />
                {SEARCH_SCOPES.map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    <SelectItemText>{scopeLabel(scope)}</SelectItemText>
                    <SelectItemIndicator />
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectList>
          </SelectContent>
        </Select>

        {channel ? (
          <Button type="button" variant="outline" size="sm" onClick={() => onChannelChange(null)}>
            <Hash aria-hidden size={12} />#{channel.name}
            <X aria-hidden size={10} />
          </Button>
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
            <ComboboxTrigger aria-label="Channel" render={<PickerTriggerButton />}>
              <Hash aria-hidden size={14} />
              <span>Channel</span>
              <ComboboxTriggerIndicator>
                <ChevronDown aria-hidden />
              </ComboboxTriggerIndicator>
            </ComboboxTrigger>
            <ComboboxContent
              align="start"
              finalFocus={false}
              initialFocus={false}
              portalProps={{ container: portalRef }}
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
                      <Hash aria-hidden size={12} />
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

        <Select<SearchTimeRange>
          items={SEARCH_TIME_RANGE_ITEMS}
          value={timeRange}
          onValueChange={(nextValue) => {
            if (nextValue) onTimeRangeChange(nextValue);
          }}
        >
          <SelectTrigger aria-label="Time range" render={<PickerTriggerButton />}>
            <CalendarRange aria-hidden size={14} />
            <span>{timeLabel(timeRange)}</span>
            <SelectIcon>
              <ChevronDown aria-hidden />
            </SelectIcon>
          </SelectTrigger>
          <SelectContent align="start" portalProps={{ container: portalRef }}>
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

        <Select<SearchSort>
          disabled={!query.trim()}
          items={SEARCH_SORT_ITEMS}
          value={sort}
          onValueChange={(nextValue) => {
            if (nextValue) onSortChange(nextValue);
          }}
        >
          <SelectTrigger aria-label="Sort" render={<PickerTriggerButton />}>
            <ArrowDownUp aria-hidden size={14} />
            <span>{sort === "recent" ? "Recent" : "Relevant"}</span>
            <SelectIcon>
              <ChevronDown aria-hidden />
            </SelectIcon>
          </SelectTrigger>
          <SelectContent align="start" portalProps={{ container: portalRef }}>
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
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              onSenderChange(null);
              onChannelChange(null);
              onScopesChange([]);
              onTimeRangeChange("any");
            }}
          >
            Clear All
          </Button>
        ) : null}
      </div>
    </SearchShellFilters>
  );
}
