import type { RefObject } from "react";
import { useRef, useState } from "react";
import { Hash } from "lucide-react";
import {
  Badge,
  Button,
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
} from "@slock/ui";

type Channel = {
  id: string;
  label: string;
};

const channels: readonly Channel[] = [
  { id: "design", label: "#design" },
  { id: "dev", label: "#dev" },
];

export function TasksChannelFilterComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([channels[0]]);

  return (
    <div
      ref={portalRef}
      className="relative flex h-full min-h-56 w-full items-start justify-center pt-8"
    >
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
        <ComboboxTrigger render={<Button variant="outline" size="md" className="h-8 w-36 py-0" />}>
          <Hash aria-hidden size={14} />
          <span className="min-w-0 flex-1 truncate text-left">Channels</span>
          {selectedChannels.length > 0 && (
            <Badge
              appearance="outline"
              className="h-4 min-w-4 justify-center rounded-none px-1 font-mono text-[10px] leading-none [[data-theme=elegant]_&]:rounded-[3px]"
            >
              {selectedChannels.length}
            </Badge>
          )}
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
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    <Hash
                      size={12}
                      className="text-foreground-muted [[data-theme=brutal]_&]:text-black/50"
                    />
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
