import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { ArrowDownUp, CircleDot, Kanban, List, Plus, UserRound, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemLabel,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  Text,
} from "@botiverse/raft-ui";
import {
  FitToolbar,
  FitToolbarButton,
  FitToolbarGroup,
  FitToolbarMore,
  FitToolbarMoreItems,
  FitToolbarPicker,
  FitToolbarSearch,
  useFitItem,
} from "@botiverse/raft-ui/wip";

const SCOPES = [
  { value: "mine", label: "Mine", count: 61 },
  { value: "all", label: "All", count: 120 },
] as const;

/** Mine and All, text alone with their counts: they refuse the `label` step and keep their text. */
function Scope({
  scope,
  onScopeChange,
}: {
  scope: string;
  onScopeChange: (scope: string) => void;
}) {
  return (
    <SegmentedControl aria-label="Scope" value={scope} onValueChange={onScopeChange}>
      {SCOPES.map((option) => (
        <SegmentedControlItem key={option.value} value={option.value}>
          <SegmentedControlLabel>{option.label}</SegmentedControlLabel>
          <SegmentedControlCount>{option.count}</SegmentedControlCount>
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}

/** The scope once it gives way: a Select showing the scope's name alone, the counts in its menu. */
function ScopeSelect({
  scope,
  onScopeChange,
}: {
  scope: string;
  onScopeChange: (scope: string) => void;
}) {
  const current = SCOPES.find((option) => option.value === scope)!;
  const change = useCallback(
    (value: string | null) => onScopeChange(value ?? scope),
    [onScopeChange, scope],
  );
  return (
    <Select value={scope} onValueChange={change} items={SCOPES} modal={false}>
      <FitToolbarPicker
        trigger={<SelectTrigger />}
        icon={null}
        aria-label={`Scope ${current.label}`}
      >
        {current.label}
      </FitToolbarPicker>
      <SelectContent className="w-40">
        <SelectList>
          {SCOPES.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <SelectItemText>{option.label}</SelectItemText>
              <Text.Mono render={<span />} size="meta">
                {option.count}
              </Text.Mono>
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}

/** List or board: icons first, then into More with the sort. */
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
      <SegmentedControlItem value="List">
        <List />
        <SegmentedControlLabel>List</SegmentedControlLabel>
      </SegmentedControlItem>
      <SegmentedControlItem value="Board">
        <Kanban />
        <SegmentedControlLabel>Board</SegmentedControlLabel>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}

/** A choice of one, named for the menu it is in: a menu's label is only a heading. */
function Choices({
  label,
  options,
  value,
  onValueChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <DropdownMenuRadioGroup aria-label={label} value={value} onValueChange={onValueChange}>
      {options.map((option) => (
        <DropdownMenuRadioItem key={option} value={option}>
          <DropdownMenuItemLabel>{option}</DropdownMenuItemLabel>
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

/** A picker as one toolbar item: its label gives way, what is chosen stays. */
function Picker({
  label,
  icon,
  value,
  labelOrder,
  active,
  children,
}: {
  label: string;
  icon: ReactNode;
  value?: string;
  labelOrder: number;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <DropdownMenu>
      <FitToolbarPicker
        trigger={<DropdownMenuTrigger />}
        icon={icon}
        value={value}
        labelOrder={labelOrder}
        data-active={active ? "" : undefined}
      >
        {label}
      </FitToolbarPicker>
      <DropdownMenuContent aria-label={label}>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

const STATUSES = ["Any", "To do", "In progress", "Done"] as const;
const ASSIGNEES = ["Any", "Me", "Kirby", "Jasper"] as const;
const SORTS = ["Updated", "Created", "Priority"] as const;
const VIEWS = ["List", "Board"] as const;

/**
 * The Tasks toolbar, as The toolbar over a list gives way: the sort and the
 * view's labels (10), the filters' labels (20), the filters to a scrolling
 * line of their own (30), Create task to + (40), Mine and All to a Select
 * (50), the sort and the view into More (60), and last an empty search to its
 * button (70). Narrow the box to watch the steps.
 */
export function FitToolbarTasksContent() {
  const [scope, setScope] = useState("mine");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("List");
  const [sort, setSort] = useState("Updated");
  const [assignee, setAssignee] = useState("Any");
  const [status, setStatus] = useState("In progress");
  const [created, setCreated] = useState(0);
  const filtered = assignee !== "Any" || status !== "Any";
  const clear = useCallback(() => {
    setAssignee("Any");
    setStatus("Any");
  }, []);
  const create = useCallback(() => setCreated((count) => count + 1), []);

  const filters = [
    {
      label: "Status",
      icon: <CircleDot />,
      value: status,
      options: STATUSES,
      onValueChange: setStatus,
    },
    {
      label: "Assignee",
      icon: <UserRound />,
      value: assignee,
      options: ASSIGNEES,
      onValueChange: setAssignee,
    },
  ];
  // The applied filters first, so they are in view before any scrolling.
  const ordered = [
    ...filters.filter((filter) => filter.value !== "Any"),
    ...filters.filter((filter) => filter.value === "Any"),
  ];

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full max-w-5xl min-w-60 resize-x overflow-hidden rounded-container border border-line-seam p-3">
        <FitToolbar aria-label="Tasks" wrap className="gap-2">
          <FitToolbarGroup
            firstLine
            className="gap-2"
            collapseOrder={50}
            collapsed={<ScopeSelect scope={scope} onScopeChange={setScope} />}
          >
            <Scope scope={scope} onScopeChange={setScope} />
          </FitToolbarGroup>
          <FitToolbarSearch
            aria-label="Search tasks"
            placeholder="Search tasks"
            clearLabel="Clear search"
            collapseOrder={70}
            value={search}
            onValueChange={setSearch}
          />
          <FitToolbarGroup
            overflow="scroll"
            wrapOrder={30}
            className="gap-2"
            end={
              filtered ? (
                <FitToolbarButton
                  variant="ghost"
                  collapsedIcon={<X />}
                  labelOrder={20}
                  onClick={clear}
                >
                  Clear filters
                </FitToolbarButton>
              ) : null
            }
          >
            {ordered.map((filter) => (
              <Picker
                key={filter.label}
                label={filter.label}
                icon={filter.icon}
                value={filter.value === "Any" ? undefined : filter.value}
                labelOrder={20}
                active={filter.value !== "Any"}
              >
                <Choices
                  label={filter.label}
                  options={filter.options}
                  value={filter.value}
                  onValueChange={filter.onValueChange}
                />
              </Picker>
            ))}
          </FitToolbarGroup>
          <FitToolbarGroup
            firstLine
            className="gap-2"
            moreOrder={60}
            moreItem={
              <>
                <DropdownMenuLabel>Sort</DropdownMenuLabel>
                <Choices label="Sort" options={SORTS} value={sort} onValueChange={setSort} />
                <DropdownMenuSeparator />
                <DropdownMenuLabel>View</DropdownMenuLabel>
                <Choices label="View" options={VIEWS} value={view} onValueChange={setView} />
              </>
            }
          >
            <Picker label={sort} icon={<ArrowDownUp />} labelOrder={10}>
              <Choices label="Sort" options={SORTS} value={sort} onValueChange={setSort} />
            </Picker>
            <ViewSwitch view={view} onViewChange={setView} />
          </FitToolbarGroup>
          <FitToolbarGroup firstLine className="gap-2">
            <DropdownMenu>
              <FitToolbarMore trigger={<DropdownMenuTrigger />} aria-label="Display options" />
              <DropdownMenuContent aria-label="Display options">
                <FitToolbarMoreItems />
              </DropdownMenuContent>
            </DropdownMenu>
            <FitToolbarButton variant="primary" icon={<Plus />} plusOrder={40} onClick={create}>
              Create task
            </FitToolbarButton>
          </FitToolbarGroup>
        </FitToolbar>
      </div>
      <Text.Sans color="muted" size="small" role="status">
        {scope === "mine" ? "Mine" : "All"} · {search ? `"${search}" · ` : ""}
        {view} · {sort} · {status} · {assignee}
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
