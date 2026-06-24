import type { RefObject } from "react";
import { useRef, useState } from "react";
import { ChevronDown, CircleUserRound } from "lucide-react";
import {
  Avatar,
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
  ComboboxTriggerIndicator,
} from "raft-ui";

type Sender = {
  id: string;
  label: string;
};

const senders: readonly Sender[] = [
  { id: "me", label: "Me" },
  { id: "atlas", label: "Atlas" },
];

export function MessageSearchSenderFilterComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selectedSender, setSelectedSender] = useState<Sender | null>(senders[0]);

  return (
    <div
      ref={portalRef}
      className="relative flex h-full min-h-56 w-full items-start justify-center pt-8"
    >
      <Combobox<Sender>
        open
        autoHighlight
        inputValue={query}
        items={senders}
        isItemEqualToValue={(item, value) => item.id === value.id}
        itemToStringLabel={(sender) => sender.label}
        value={selectedSender}
        onInputValueChange={(nextQuery, eventDetails) => {
          if (eventDetails.reason !== "item-press") {
            setQuery(nextQuery);
          }
        }}
        onValueChange={setSelectedSender}
      >
        <ComboboxTrigger className="h-8 w-36 py-0">
          <CircleUserRound aria-hidden />
          <span className="min-w-0 truncate text-left">{selectedSender?.label ?? "From"}</span>
          <ComboboxTriggerIndicator>
            <ChevronDown aria-hidden />
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
            <ComboboxLabel>From</ComboboxLabel>
            <ComboboxClear>Clear</ComboboxClear>
          </ComboboxHeader>
          <ComboboxSeparator />
          <ComboboxInputGroup>
            <ComboboxInput
              aria-label="Search senders"
              placeholder="Search..."
              suppressPasswordManager
            />
          </ComboboxInputGroup>
          <ComboboxList>
            {(sender: Sender) => (
              <ComboboxItem key={sender.id} value={sender}>
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <Avatar size="2xs" type="human" />
                  </span>
                  <span className="truncate leading-6 [[data-theme=elegant]_&]:text-xs">
                    {sender.label}
                  </span>
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
