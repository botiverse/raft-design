import { useCallback, useState } from "react";
import { Button } from "@botiverse/raft-ui";

import { TasksChannelFilterComposition } from "./tasks-channel-filter.composition.tsx";
import type { TasksChannelFilterOption } from "./tasks-channel-filter.composition.tsx";
import { TasksAssigneeFilterComposition } from "./tasks-assignee-filter.composition.tsx";
import { TasksCreatorFilterComposition } from "./tasks-creator-filter.composition.tsx";
import { TASKS_IDENTITY_FIXTURES } from "../tasks-identity-filter.fixtures.ts";
import type { TasksIdentity } from "../tasks-identity-filter.fixtures.ts";

type FilterKind = "channel" | "creator" | "assignee";

export type TasksIdentityFiltersCompositionProps = {
  identities?: readonly TasksIdentity[];
  channels?: readonly TasksChannelFilterOption[];
  channelValue?: string[];
  defaultChannelValue?: string[];
  onChannelValueChange?: (value: string[]) => void;
  creatorValue?: string[];
  defaultCreatorValue?: string[];
  onCreatorValueChange?: (value: string[]) => void;
  assigneeValue?: string[];
  defaultAssigneeValue?: string[];
  onAssigneeValueChange?: (value: string[]) => void;
  initialOpen?: FilterKind | null;
};

export function TasksIdentityFiltersComposition({
  identities = TASKS_IDENTITY_FIXTURES,
  channels,
  channelValue,
  defaultChannelValue = [],
  onChannelValueChange,
  creatorValue,
  defaultCreatorValue = ["me"],
  onCreatorValueChange,
  assigneeValue,
  defaultAssigneeValue = ["atlas"],
  onAssigneeValueChange,
  initialOpen = null,
}: TasksIdentityFiltersCompositionProps) {
  const [openFilter, setOpenFilter] = useState<FilterKind | null>(initialOpen);
  const [localChannelValue, setLocalChannelValue] = useState(defaultChannelValue);
  const [localCreatorValue, setLocalCreatorValue] = useState(defaultCreatorValue);
  const [localAssigneeValue, setLocalAssigneeValue] = useState(defaultAssigneeValue);

  const resolvedChannelValue = channelValue ?? localChannelValue;
  const resolvedCreatorValue = creatorValue ?? localCreatorValue;
  const resolvedAssigneeValue = assigneeValue ?? localAssigneeValue;
  const hasActiveFilters =
    resolvedChannelValue.length > 0 ||
    resolvedCreatorValue.length > 0 ||
    resolvedAssigneeValue.length > 0;

  const setChannelValue = useCallback(
    (nextValue: string[]) => {
      if (channelValue === undefined) setLocalChannelValue(nextValue);
      onChannelValueChange?.(nextValue);
    },
    [channelValue, onChannelValueChange],
  );
  const setCreatorValue = useCallback(
    (nextValue: string[]) => {
      if (creatorValue === undefined) setLocalCreatorValue(nextValue);
      onCreatorValueChange?.(nextValue);
    },
    [creatorValue, onCreatorValueChange],
  );
  const setAssigneeValue = useCallback(
    (nextValue: string[]) => {
      if (assigneeValue === undefined) setLocalAssigneeValue(nextValue);
      onAssigneeValueChange?.(nextValue);
    },
    [assigneeValue, onAssigneeValueChange],
  );
  const clearFilters = useCallback(() => {
    setChannelValue([]);
    setCreatorValue([]);
    setAssigneeValue([]);
  }, [setAssigneeValue, setChannelValue, setCreatorValue]);

  const handleChannelOpenChange = useCallback((open: boolean) => {
    setOpenFilter((current) => (open ? "channel" : current === "channel" ? null : current));
  }, []);
  const handleCreatorOpenChange = useCallback((open: boolean) => {
    setOpenFilter((current) => (open ? "creator" : current === "creator" ? null : current));
  }, []);
  const handleAssigneeOpenChange = useCallback((open: boolean) => {
    setOpenFilter((current) => (open ? "assignee" : current === "assignee" ? null : current));
  }, []);

  return (
    <div className="flex items-center gap-2">
      {channels ? (
        <TasksChannelFilterComposition
          channels={channels}
          value={resolvedChannelValue}
          onValueChange={setChannelValue}
          open={openFilter === "channel"}
          onOpenChange={handleChannelOpenChange}
        />
      ) : null}
      <TasksCreatorFilterComposition
        identities={identities}
        value={resolvedCreatorValue}
        onValueChange={setCreatorValue}
        open={openFilter === "creator"}
        onOpenChange={handleCreatorOpenChange}
      />
      <TasksAssigneeFilterComposition
        identities={identities}
        value={resolvedAssigneeValue}
        onValueChange={setAssigneeValue}
        open={openFilter === "assignee"}
        onOpenChange={handleAssigneeOpenChange}
      />
      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}
