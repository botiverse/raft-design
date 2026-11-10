import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import { CircleDashed, CircleDot, CircleCheck, Kanban, List, Plus, UserRound } from "lucide-react";
import {
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Text,
} from "@botiverse/raft-ui";
import { FitToolbar, FitToolbarButton, FitToolbarGroup, useFitItem } from "@botiverse/raft-ui/wip";

/** The view switch: its labels are the toolbar's `label` step. */
function ViewSwitch({
  view,
  onViewChange,
}: {
  view: string;
  onViewChange: (view: string) => void;
}) {
  const item = useFitItem({ label: 30 });
  return (
    <SegmentedControl aria-label="View" value={view} onValueChange={onViewChange} {...item.props}>
      <SegmentedControlItem value="list">
        <List />
        <SegmentedControlLabel>List</SegmentedControlLabel>
      </SegmentedControlItem>
      <SegmentedControlItem value="board">
        <Kanban />
        <SegmentedControlLabel>Board</SegmentedControlLabel>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}

export function FitToolbarContent() {
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("in-progress");
  const [last, setLast] = useState("");
  const choose = useCallback((event: MouseEvent<HTMLElement>) => {
    setFilter(event.currentTarget.dataset.value ?? "");
  }, []);
  const create = useCallback(() => setLast("New task"), []);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full max-w-lg min-w-60 resize-x overflow-hidden rounded-container border border-line-seam p-3">
        <FitToolbar aria-label="Tasks" wrap className="gap-2">
          <FitToolbarGroup firstLine className="gap-2">
            <ViewSwitch view={view} onViewChange={setView} />
          </FitToolbarGroup>
          <FitToolbarGroup overflow="scroll" className="gap-2">
            <FitToolbarButton
              variant="outline"
              icon={<CircleDashed />}
              data-value="to-do"
              aria-pressed={filter === "to-do"}
              data-active={filter === "to-do" ? "" : undefined}
              onClick={choose}
            >
              To do
            </FitToolbarButton>
            <FitToolbarButton
              variant="outline"
              icon={<CircleDot />}
              data-value="in-progress"
              aria-pressed={filter === "in-progress"}
              data-active={filter === "in-progress" ? "" : undefined}
              onClick={choose}
            >
              In progress
            </FitToolbarButton>
            <FitToolbarButton
              variant="outline"
              icon={<CircleCheck />}
              data-value="done"
              aria-pressed={filter === "done"}
              data-active={filter === "done" ? "" : undefined}
              onClick={choose}
            >
              Done
            </FitToolbarButton>
            <FitToolbarButton
              variant="outline"
              icon={<UserRound />}
              data-value="mine"
              aria-pressed={filter === "mine"}
              data-active={filter === "mine" ? "" : undefined}
              onClick={choose}
            >
              Assigned to me
            </FitToolbarButton>
          </FitToolbarGroup>
          <FitToolbarGroup firstLine className="gap-2">
            <FitToolbarButton variant="primary" icon={<Plus />} labelOrder={20} onClick={create}>
              New task
            </FitToolbarButton>
          </FitToolbarGroup>
        </FitToolbar>
      </div>
      <Text.Sans color="muted" size="small" role="status">
        {view === "list" ? "List" : "Board"} · {filter}
        {last ? ` · ${last}` : ""}
      </Text.Sans>
    </div>
  );
}

export function FitToolbarComposition() {
  return (
    <div className="flex size-full items-start justify-center p-4">
      <FitToolbarContent />
    </div>
  );
}
