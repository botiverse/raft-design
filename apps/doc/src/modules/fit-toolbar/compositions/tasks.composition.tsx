import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { CircleDot, Kanban, List, Plus, UserRound, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
  Text,
} from "@botiverse/raft-ui";
import {
  FitToolbar,
  FitToolbarButton,
  FitToolbarGroup,
  FitToolbarPicker,
  useFitItem,
} from "@botiverse/raft-ui/wip";

/** Mine and All, text alone with their counts: they refuse the `label` step and keep their text. */
function Scope({
  scope,
  onScopeChange,
}: {
  scope: string;
  onScopeChange: (scope: string) => void;
}) {
  const item = useFitItem({ label: 10 });
  return (
    <SegmentedControl
      aria-label="Scope"
      value={scope}
      onValueChange={onScopeChange}
      {...item.props}
    >
      <SegmentedControlItem value="mine">
        <SegmentedControlLabel>Mine</SegmentedControlLabel>
        <SegmentedControlCount>61</SegmentedControlCount>
      </SegmentedControlItem>
      <SegmentedControlItem value="all">
        <SegmentedControlLabel>All</SegmentedControlLabel>
        <SegmentedControlCount>120</SegmentedControlCount>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}

/** List or board: icons, so it gives its labels before the filters wrap. */
function ViewSwitch({
  view,
  onViewChange,
}: {
  view: string;
  onViewChange: (view: string) => void;
}) {
  const item = useFitItem({ label: 10 });
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

/** A filter as one toolbar item: its label gives way, what is chosen stays. */
function Filter({
  label,
  icon,
  options,
  value,
  onValueChange,
}: {
  label: string;
  icon: ReactNode;
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <FitToolbarPicker
        trigger={<DropdownMenuTrigger />}
        icon={icon}
        value={value === "Any" ? undefined : value}
        labelOrder={10}
        data-active={value === "Any" ? undefined : ""}
      >
        {label}
      </FitToolbarPicker>
      <DropdownMenuContent aria-label={label}>
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              <DropdownMenuItemLabel>{option}</DropdownMenuItemLabel>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const STATUSES = ["Any", "To do", "In progress", "Done"] as const;
const ASSIGNEES = ["Any", "Me", "Kirby", "Jasper"] as const;

/**
 * The Tasks toolbar: Mine and All, list or board and Create task on the first
 * line; the filters scroll, and wrap to a line of their own (20) before
 * Create task becomes + (30). Narrow the box to watch the steps.
 */
export function FitToolbarTasksContent() {
  const [scope, setScope] = useState("mine");
  const [view, setView] = useState("list");
  const [assignee, setAssignee] = useState("Any");
  const [status, setStatus] = useState("In progress");
  const [created, setCreated] = useState(0);
  const filtered = assignee !== "Any" || status !== "Any";
  const clear = useCallback(() => {
    setAssignee("Any");
    setStatus("Any");
  }, []);
  const create = useCallback(() => setCreated((count) => count + 1), []);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full max-w-3xl min-w-60 resize-x overflow-hidden rounded-container border border-line-seam p-3">
        <FitToolbar aria-label="Tasks" wrap className="gap-2">
          <FitToolbarGroup firstLine className="gap-2">
            <Scope scope={scope} onScopeChange={setScope} />
          </FitToolbarGroup>
          <FitToolbarGroup overflow="scroll" wrapOrder={20} className="gap-2">
            <Filter
              label="Status"
              icon={<CircleDot />}
              options={STATUSES}
              value={status}
              onValueChange={setStatus}
            />
            <Filter
              label="Assignee"
              icon={<UserRound />}
              options={ASSIGNEES}
              value={assignee}
              onValueChange={setAssignee}
            />
            {filtered ? (
              <FitToolbarButton
                variant="ghost"
                collapsedIcon={<X />}
                labelOrder={10}
                onClick={clear}
              >
                Clear filters
              </FitToolbarButton>
            ) : null}
          </FitToolbarGroup>
          <FitToolbarGroup firstLine className="gap-2">
            <ViewSwitch view={view} onViewChange={setView} />
            <FitToolbarButton variant="primary" icon={<Plus />} plusOrder={30} onClick={create}>
              Create task
            </FitToolbarButton>
          </FitToolbarGroup>
        </FitToolbar>
      </div>
      <Text.Sans color="muted" size="small" role="status">
        {scope === "mine" ? "Mine" : "All"} · {view === "list" ? "List" : "Board"} · {status} ·{" "}
        {assignee}
        {created > 0 ? ` · ${created} created` : ""}
      </Text.Sans>
    </div>
  );
}

export function FitToolbarTasksComposition() {
  return (
    <div className="flex size-full items-start justify-center p-4">
      <FitToolbarTasksContent />
    </div>
  );
}
