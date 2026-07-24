import { useRef, useState } from "react";
import { ChevronDown, Hash } from "lucide-react";
import {
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
  ComboboxTriggerCount,
  ComboboxTriggerIndicator,
} from "raft-ui";

export type TasksChannelFilterOption = {
  id: string;
  label: string;
};

export type TasksChannelFilterCompositionProps = {
  channels: readonly TasksChannelFilterOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function TasksChannelFilterComposition({
  channels,
  value,
  defaultValue = [],
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
}: TasksChannelFilterCompositionProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [localValue, setLocalValue] = useState(defaultValue);
  const selectedIds = value ?? localValue;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const availableChannels = channels.filter((channel) =>
    channel.label.toLocaleLowerCase().includes(normalizedQuery),
  );
  const items = channels.map((channel) => channel.id);
  const itemToStringLabel = (id: string) =>
    channels.find((channel) => channel.id === id)?.label ?? id;

  return (
    <div ref={portalRef} className="relative inline-flex">
      <Combobox<string, true>
        multiple
        autoHighlight
        items={items}
        value={selectedIds}
        open={open}
        defaultOpen={defaultOpen}
        inputValue={query}
        itemToStringLabel={itemToStringLabel}
        onOpenChange={(nextOpen) => {
          if (nextOpen) setQuery("");
          onOpenChange?.(nextOpen);
        }}
        onInputValueChange={(nextQuery, eventDetails) => {
          if (eventDetails.reason !== "item-press") setQuery(nextQuery);
        }}
        onValueChange={(nextValue) => {
          if (value === undefined) setLocalValue(nextValue);
          onValueChange?.(nextValue);
        }}
      >
        <ComboboxTrigger aria-label="Channel" className="h-8 py-0 max-md:text-[12px]">
          <Hash aria-hidden className="size-3.5" />
          <span className="min-w-0 truncate text-left max-md:hidden">Channel</span>
          {selectedIds.length > 0 && (
            <ComboboxTriggerCount>{selectedIds.length}</ComboboxTriggerCount>
          )}
          <ComboboxTriggerIndicator>
            <ChevronDown aria-hidden />
          </ComboboxTriggerIndicator>
        </ComboboxTrigger>
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          side="bottom"
          align="center"
          portalProps={{ container: portalRef }}
          className="min-w-[220px]"
        >
          <ComboboxHeader>
            <ComboboxLabel>Channels</ComboboxLabel>
            <ComboboxClear>Clear</ComboboxClear>
          </ComboboxHeader>
          <ComboboxSeparator />
          <ComboboxInputGroup>
            <ComboboxInput
              aria-label="Search channels"
              placeholder="Search..."
              suppressPasswordManager
            />
          </ComboboxInputGroup>
          <ComboboxList>
            {availableChannels.map((channel) => (
              <ComboboxItem key={channel.id} value={channel.id}>
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <Hash className="text-foreground-muted [[data-theme=brutal]_&]:text-black/50" />
                  </span>
                  <span className="truncate">{channel.label}</span>
                </span>
                <ComboboxItemIndicator />
              </ComboboxItem>
            ))}
          </ComboboxList>
          <ComboboxEmpty>No channels found</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
