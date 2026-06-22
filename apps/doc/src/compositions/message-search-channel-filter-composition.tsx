import type { RefObject } from "react";
import { useRef, useState } from "react";
import { IconChevronDownOutline18, IconHashtagOutline18 } from "nucleo-ui-outline-18";
import {
  Combobox,
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
  ComboboxTriggerIndicator,
} from "@raft/ui";

type Channel = {
  id: string;
  label: string;
};

const channels: readonly Channel[] = [
  { id: "unread", label: "#unread" },
  { id: "general", label: "#general" },
];

export function MessageSearchChannelFilterComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  return (
    <div
      ref={portalRef}
      className="relative flex h-full min-h-56 w-full items-start justify-center pt-8"
    >
      <Combobox<Channel>
        open
        autoHighlight
        items={channels}
        isItemEqualToValue={(item, value) => item.id === value.id}
        itemToStringLabel={(channel) => channel.label}
        value={selectedChannel}
        onValueChange={setSelectedChannel}
      >
        <ComboboxTrigger className="h-8 w-36 py-0">
          <IconHashtagOutline18 aria-hidden />
          <span className="min-w-0 truncate text-left">{selectedChannel?.label ?? "Channel"}</span>
          <ComboboxTriggerIndicator>
            <IconChevronDownOutline18 aria-hidden />
          </ComboboxTriggerIndicator>
        </ComboboxTrigger>
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          collisionAvoidance={{ side: "none", align: "none", fallbackAxisSide: "none" }}
          positionMethod="absolute"
          side="bottom"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[220px]"
        >
          <ComboboxHeader>
            <ComboboxLabel>Channels</ComboboxLabel>
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
            {(channel: Channel) => (
              <ComboboxItem key={channel.id} value={channel}>
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <IconHashtagOutline18 className="text-foreground-muted [[data-theme=brutal]_&]:text-black/50" />
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
