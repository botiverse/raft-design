import { useState } from "react";
import { Button } from "raft-ui";

import { TasksAssigneeFilterComposition } from "./tasks-assignee-filter.composition.tsx";
import { TasksCreatorFilterComposition } from "./tasks-creator-filter.composition.tsx";
import { TASKS_IDENTITY_FIXTURES, type TasksIdentity } from "../tasks-identity-filter.fixtures.ts";

type IdentityFilterKind = "creator" | "assignee";

export type TasksIdentityFiltersCompositionProps = {
  identities?: readonly TasksIdentity[];
  creatorValue?: string[];
  defaultCreatorValue?: string[];
  onCreatorValueChange?: (value: string[]) => void;
  assigneeValue?: string[];
  defaultAssigneeValue?: string[];
  onAssigneeValueChange?: (value: string[]) => void;
  initialOpen?: IdentityFilterKind | null;
};

export function TasksIdentityFiltersComposition({
  identities = TASKS_IDENTITY_FIXTURES,
  creatorValue,
  defaultCreatorValue = ["me"],
  onCreatorValueChange,
  assigneeValue,
  defaultAssigneeValue = ["atlas"],
  onAssigneeValueChange,
  initialOpen = null,
}: TasksIdentityFiltersCompositionProps) {
  const [openFilter, setOpenFilter] = useState<IdentityFilterKind | null>(initialOpen);
  const [localCreatorValue, setLocalCreatorValue] = useState(defaultCreatorValue);
  const [localAssigneeValue, setLocalAssigneeValue] = useState(defaultAssigneeValue);

  const resolvedCreatorValue = creatorValue ?? localCreatorValue;
  const resolvedAssigneeValue = assigneeValue ?? localAssigneeValue;
  const hasActiveFilters = resolvedCreatorValue.length > 0 || resolvedAssigneeValue.length > 0;

  const setCreatorValue = (nextValue: string[]) => {
    if (creatorValue === undefined) setLocalCreatorValue(nextValue);
    onCreatorValueChange?.(nextValue);
  };
  const setAssigneeValue = (nextValue: string[]) => {
    if (assigneeValue === undefined) setLocalAssigneeValue(nextValue);
    onAssigneeValueChange?.(nextValue);
  };
  const clearFilters = () => {
    setCreatorValue([]);
    setAssigneeValue([]);
  };

  return (
    <div className="flex items-center gap-2">
      <TasksCreatorFilterComposition
        identities={identities}
        value={resolvedCreatorValue}
        onValueChange={setCreatorValue}
        open={openFilter === "creator"}
        onOpenChange={(open) =>
          setOpenFilter((current) => (open ? "creator" : current === "creator" ? null : current))
        }
      />
      <TasksAssigneeFilterComposition
        identities={identities}
        value={resolvedAssigneeValue}
        onValueChange={setAssigneeValue}
        open={openFilter === "assignee"}
        onOpenChange={(open) =>
          setOpenFilter((current) => (open ? "assignee" : current === "assignee" ? null : current))
        }
      />
      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}
