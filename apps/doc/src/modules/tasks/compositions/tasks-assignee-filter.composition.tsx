import { useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";
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
} from "raft-ui";

import { TASKS_IDENTITY_FIXTURES, type TasksIdentity } from "../tasks-identity-filter.fixtures.ts";

export type TasksAssigneeFilterCompositionProps = {
  identities?: readonly TasksIdentity[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function TasksAssigneeFilterComposition({
  identities = TASKS_IDENTITY_FIXTURES,
  value,
  defaultValue = ["atlas"],
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
}: TasksAssigneeFilterCompositionProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [localValue, setLocalValue] = useState(defaultValue);
  const selectedIds = value ?? localValue;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchesQuery = (label: string) => label.toLocaleLowerCase().includes(normalizedQuery);
  const availableIdentities = identities.filter((identity) => matchesQuery(identity.label));
  const items = ["me", "unassigned", ...identities.map((identity) => identity.id)];
  const itemToStringLabel = (id: string) => {
    if (id === "me") return "Assigned to me";
    if (id === "unassigned") return "Unassigned";
    return identities.find((identity) => identity.id === id)?.label ?? id;
  };

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
        <ComboboxTrigger className="h-8 py-0">
          <User aria-hidden />
          <span className="min-w-0 truncate text-left">Assignee</span>
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
          className="min-w-[280px]"
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
            {matchesQuery("Assigned to me") ? (
              <ComboboxItem value="me">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span aria-hidden className="size-4 shrink-0" />
                  <span className="truncate text-foreground-muted">Assigned to me</span>
                </span>
                <ComboboxItemIndicator />
              </ComboboxItem>
            ) : null}
            {matchesQuery("Unassigned") ? (
              <ComboboxItem value="unassigned">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span aria-hidden className="size-4 shrink-0" />
                  <span className="truncate text-foreground-muted">Unassigned</span>
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
          <ComboboxEmpty>No assignees found</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
