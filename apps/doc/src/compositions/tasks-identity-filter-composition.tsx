import type { RefObject } from "react";
import { useRef, useState } from "react";
import { cn } from "cuvii-rui/cn";
import { ChevronDown, User } from "lucide-react";
import {
  Avatar,
  Badge,
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
} from "cuvii-rui";

type Identity = {
  id: string;
  label: string;
  tone?: "sentinel";
};

const identities: readonly Identity[] = [
  { id: "me", label: "Assigned to me", tone: "sentinel" },
  { id: "unassigned", label: "Unassigned", tone: "sentinel" },
  { id: "atlas", label: "Atlas" },
];

export function TasksIdentityFilterComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIdentities, setSelectedIdentities] = useState<Identity[]>([identities[2]]);

  return (
    <div
      ref={portalRef}
      className="relative flex h-full min-h-56 w-full items-start justify-center pt-8"
    >
      <Combobox<Identity, true>
        open
        multiple
        autoHighlight
        inputValue={query}
        items={identities}
        isItemEqualToValue={(item, value) => item.id === value.id}
        itemToStringLabel={(identity) => identity.label}
        value={selectedIdentities}
        onInputValueChange={(nextQuery, eventDetails) => {
          if (eventDetails.reason !== "item-press") {
            setQuery(nextQuery);
          }
        }}
        onValueChange={setSelectedIdentities}
      >
        <ComboboxTrigger className="h-8 w-36 py-0">
          <User aria-hidden />
          <span className="min-w-0 truncate text-left">Assignee</span>
          {selectedIdentities.length > 0 && (
            <Badge
              appearance="outline"
              className="h-4 min-w-4 justify-center rounded-none px-1 font-mono text-[10px] leading-none [[data-theme=elegant]_&]:rounded-[3px]"
            >
              {selectedIdentities.length}
            </Badge>
          )}
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
            <ComboboxLabel>Assignee</ComboboxLabel>
            <ComboboxClear>Clear</ComboboxClear>
          </ComboboxHeader>
          <ComboboxSeparator />
          <ComboboxInputGroup>
            <ComboboxInput
              aria-label="Search assignees"
              placeholder="Search..."
              suppressPasswordManager
            />
          </ComboboxInputGroup>
          <ComboboxList>
            {(identity: Identity) => (
              <ComboboxItem key={identity.id} value={identity}>
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    {identity.tone === "sentinel" ? null : <Avatar size="2xs" type="human" />}
                  </span>
                  <span
                    className={cn(
                      "truncate leading-6 [[data-theme=elegant]_&]:text-xs [[data-theme=elegant]_&]:leading-5",
                      identity.tone === "sentinel" &&
                        "text-foreground-muted [[data-theme=brutal]_&]:text-black/70",
                    )}
                  >
                    {identity.label}
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
