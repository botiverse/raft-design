import { useCallback, useMemo, useState } from "react";
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
  PickerTriggerButton,
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
  const [query, setQuery] = useState("");
  const [localValue, setLocalValue] = useState(defaultValue);
  const selectedIds = value ?? localValue;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const availableChannels = channels.filter((channel) =>
    channel.label.toLocaleLowerCase().includes(normalizedQuery),
  );
  const items = useMemo(() => channels.map((channel) => channel.id), [channels]);
  const itemToStringLabel = useCallback(
    (id: string) => channels.find((channel) => channel.id === id)?.label ?? id,
    [channels],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) setQuery("");
      onOpenChange?.(nextOpen);
    },
    [onOpenChange],
  );

  const handleInputValueChange = useCallback(
    (nextQuery: string, eventDetails: { reason: string }) => {
      if (eventDetails.reason !== "item-press") setQuery(nextQuery);
    },
    [],
  );

  const handleValueChange = useCallback(
    (nextValue: string[]) => {
      if (value === undefined) setLocalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  return (
    <div className="relative inline-flex">
      <Combobox<string, true>
        multiple
        autoHighlight
        items={items}
        value={selectedIds}
        open={open}
        defaultOpen={defaultOpen}
        inputValue={query}
        itemToStringLabel={itemToStringLabel}
        onOpenChange={handleOpenChange}
        onInputValueChange={handleInputValueChange}
        onValueChange={handleValueChange}
      >
        <ComboboxTrigger aria-label="Channel" render={<PickerTriggerButton />}>
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
          side="bottom"
          align="center"
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
                    <Hash className="text-foreground-muted in-data-[theme=brutal]:text-black/50" />
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
