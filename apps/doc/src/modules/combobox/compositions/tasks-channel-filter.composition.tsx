import { useState } from "react";
import { ChevronDown, Hash } from "lucide-react";
import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
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

type Channel = {
  id: string;
  label: string;
};

const channels: readonly Channel[] = [
  { id: "design", label: "#design" },
  { id: "dev", label: "#dev" },
];

export function TasksChannelFilterComposition() {
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([channels[0]]);

  return (
    <div className="relative flex size-full min-h-56  items-start justify-center pt-8">
      <Combobox<Channel, true>
        open
        multiple
        autoHighlight
        items={channels}
        isItemEqualToValue={(item, value) => item.id === value.id}
        itemToStringLabel={(channel) => channel.label}
        value={selectedChannels}
        onValueChange={setSelectedChannels}
      >
        <ComboboxTrigger className="h-8 w-36 py-0">
          <Hash aria-hidden />
          <span className="min-w-0 truncate text-left">Channels</span>
          {selectedChannels.length > 0 && (
            <ComboboxTriggerCount>{selectedChannels.length}</ComboboxTriggerCount>
          )}
          <ComboboxTriggerIndicator>
            <ChevronDown aria-hidden />
          </ComboboxTriggerIndicator>
        </ComboboxTrigger>
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          collisionAvoidance={{ side: "none", align: "none", fallbackAxisSide: "none" }}
          side="bottom"
          className="w-[220px]"
        >
          <ComboboxHeader>
            <ComboboxLabel>Channels</ComboboxLabel>
            <ComboboxClear>Clear</ComboboxClear>
          </ComboboxHeader>
          <ComboboxSeparator />
          <ComboboxInputGroup>
            <ComboboxInput
              aria-label="Search task channels"
              placeholder="Search..."
              suppressPasswordManager
            />
          </ComboboxInputGroup>
          <ComboboxList>
            {(channel: Channel) => (
              <ComboboxItem key={channel.id} value={channel}>
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <Hash className="text-foreground-muted in-data-[theme=brutal]:text-black/50" />
                  </span>
                  <span className="truncate leading-6">{channel.label}</span>
                </span>
                <ComboboxItemIndicator />
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
