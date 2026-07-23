import { useState } from "react";

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

  return (
    <div className="flex items-center gap-2">
      <TasksCreatorFilterComposition
        identities={identities}
        value={creatorValue}
        defaultValue={defaultCreatorValue}
        onValueChange={onCreatorValueChange}
        open={openFilter === "creator"}
        onOpenChange={(open) =>
          setOpenFilter((current) => (open ? "creator" : current === "creator" ? null : current))
        }
      />
      <TasksAssigneeFilterComposition
        identities={identities}
        value={assigneeValue}
        defaultValue={defaultAssigneeValue}
        onValueChange={onAssigneeValueChange}
        open={openFilter === "assignee"}
        onOpenChange={(open) =>
          setOpenFilter((current) => (open ? "assignee" : current === "assignee" ? null : current))
        }
      />
    </div>
  );
}
