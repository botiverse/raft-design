import { ChevronDown, Hash } from "lucide-react";
import { useState } from "react";
import {
  Combobox,
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
} from "raft-ui";

const CHANNELS = [
  { id: "design", label: "#design" },
  { id: "engineering", label: "#engineering" },
  { id: "product", label: "#product" },
] as const;

type Channel = (typeof CHANNELS)[number];

function channelLabel(item: Channel) {
  return item.label;
}

export function PickerTriggerButtonComboboxFilterComposition() {
  const [channel, setChannel] = useState<Channel | null>(CHANNELS[0]);

  return (
    <Combobox<Channel>
      items={CHANNELS}
      value={channel}
      itemToStringLabel={channelLabel}
      onValueChange={setChannel}
      autoHighlight
    >
      <ComboboxTrigger render={<PickerTriggerButton />}>
        <Hash aria-hidden className="size-3.5" />
        <span>{channel?.label ?? "Channel"}</span>
        <ComboboxTriggerIndicator>
          <ChevronDown aria-hidden className="size-3" />
        </ComboboxTriggerIndicator>
      </ComboboxTrigger>
      <ComboboxContent initialFocus={false} finalFocus={false} className="w-[180px]">
        <ComboboxHeader>
          <ComboboxLabel>Channel</ComboboxLabel>
        </ComboboxHeader>
        <ComboboxSeparator />
        <ComboboxInputGroup>
          <ComboboxInput aria-label="Search channels" placeholder="Search..." />
        </ComboboxInputGroup>
        <ComboboxList>
          {(item: Channel) => (
            <ComboboxItem key={item.id} value={item}>
              <span className="truncate">{item.label}</span>
              <ComboboxItemIndicator />
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No channels found</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
