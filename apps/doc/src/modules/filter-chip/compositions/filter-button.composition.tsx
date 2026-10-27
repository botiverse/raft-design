import { AtSign, ChevronDown, CircleDot, Inbox, ListFilter, Pin } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  PickerTriggerButton,
} from "@botiverse/raft-ui";
import { FilterChip, FilterChipLabel, FilterChipRemove } from "@botiverse/raft-ui/wip";

const FILTERS = {
  all: { label: "All", icon: Inbox },
  unread: { label: "Unread", icon: CircleDot },
  mentions: { label: "Mentions", icon: AtSign },
  pinned: { label: "Pinned", icon: Pin },
} as const;

type Filter = keyof typeof FILTERS;

function isFilter(value: unknown): value is Filter {
  return typeof value === "string" && value in FILTERS;
}

export function FilterChipFilterButtonContent() {
  const [filter, setFilter] = useState<Filter>("unread");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const active = FILTERS[filter];

  const handleValueChange = useCallback((value: unknown) => {
    if (isFilter(value)) setFilter(value);
  }, []);

  const handleClear = useCallback(() => {
    setFilter("all");
    // The chip and its × go away: focus moves to the Filter button.
    triggerRef.current?.focus();
  }, []);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger ref={triggerRef} render={<PickerTriggerButton />}>
          <ListFilter aria-hidden data-icon="inline-start" />
          Filter
          <span data-picker-trigger-indicator="" aria-hidden="true">
            <ChevronDown />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent aria-label="Filter activity">
          <DropdownMenuRadioGroup value={filter} onValueChange={handleValueChange}>
            <DropdownMenuRadioItem value="all">
              <Inbox aria-hidden />
              <DropdownMenuItemLabel>All</DropdownMenuItemLabel>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="unread">
              <CircleDot aria-hidden />
              <DropdownMenuItemLabel>Unread</DropdownMenuItemLabel>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="mentions">
              <AtSign aria-hidden />
              <DropdownMenuItemLabel>Mentions</DropdownMenuItemLabel>
            </DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioItem value="pinned">
              <Pin aria-hidden />
              <DropdownMenuItemLabel>Pinned</DropdownMenuItemLabel>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {filter !== "all" && (
        <FilterChip>
          <active.icon aria-hidden />
          <FilterChipLabel>{active.label}</FilterChipLabel>
          <FilterChipRemove aria-label="Clear Filter" onClick={handleClear} />
        </FilterChip>
      )}
    </div>
  );
}
