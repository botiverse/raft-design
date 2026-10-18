import { useCallback, useMemo, useState } from "react";
import { ChevronDown, UserCircle2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
} from "@botiverse/raft-ui";

import { TASKS_IDENTITY_FIXTURES } from "../tasks-identity-filter.fixtures.ts";
import type { TasksIdentity } from "../tasks-identity-filter.fixtures.ts";

export type TasksCreatorFilterCompositionProps = {
  identities?: readonly TasksIdentity[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function TasksCreatorFilterComposition({
  identities = TASKS_IDENTITY_FIXTURES,
  value,
  defaultValue = ["me"],
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
}: TasksCreatorFilterCompositionProps) {
  const [query, setQuery] = useState("");
  const [localValue, setLocalValue] = useState(defaultValue);
  const selectedIds = value ?? localValue;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchesQuery = (label: string) => label.toLocaleLowerCase().includes(normalizedQuery);
  const availableIdentities = identities.filter((identity) => matchesQuery(identity.label));
  const items = useMemo(() => ["me", ...identities.map((identity) => identity.id)], [identities]);
  const itemToStringLabel = useCallback(
    (id: string) =>
      id === "me"
        ? "Created by me"
        : (identities.find((identity) => identity.id === id)?.label ?? id),
    [identities],
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
        <ComboboxTrigger aria-label="Creator" render={<PickerTriggerButton />}>
          <UserCircle2 aria-hidden className="size-3.5" />
          <span className="min-w-0 truncate text-left max-md:hidden">Creator</span>
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
          className="min-w-[280px]"
        >
          <ComboboxHeader>
            <ComboboxLabel>Creator</ComboboxLabel>
            <ComboboxClear>Clear</ComboboxClear>
          </ComboboxHeader>
          <ComboboxSeparator />
          <ComboboxInputGroup>
            <ComboboxInput
              aria-label="Search creators"
              placeholder="Search..."
              suppressPasswordManager
            />
          </ComboboxInputGroup>
          <ComboboxList>
            {matchesQuery("Created by me") ? (
              <ComboboxItem value="me">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span aria-hidden className="size-4 shrink-0" />
                  <span className="truncate text-foreground-muted">Created by me</span>
                </span>
                <ComboboxItemIndicator />
              </ComboboxItem>
            ) : null}
            {availableIdentities.map((identity) => (
              <ComboboxItem key={identity.id} value={identity.id}>
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <Avatar size="3xs" type={identity.type}>
                      {identity.avatarSrc ? <AvatarImage src={identity.avatarSrc} alt="" /> : null}
                      <AvatarFallback>{identity.fallback}</AvatarFallback>
                    </Avatar>
                  </span>
                  <span className="truncate">{identity.label}</span>
                </span>
                <ComboboxItemIndicator />
              </ComboboxItem>
            ))}
          </ComboboxList>
          <ComboboxEmpty>No creators found</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
