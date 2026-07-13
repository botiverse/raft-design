import { ChevronDown, Columns3, LayoutList, Pencil, Plus, User, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "raft-ui";

import { TASK_FIXTURES, TASK_STATUSES, type TaskFixture, type TaskStatus } from "./task-fixtures";

const STATUS_BACKGROUNDS: Record<TaskStatus, string> = {
  todo: "bg-brutal-orange",
  in_progress: "bg-brutal-cyan",
  in_review: "bg-brutal-lavender",
  done: "bg-brutal-lime",
  closed: "bg-brutal-stone",
};

export function TasksSourcePreview() {
  const [collapsed, setCollapsed] = useState<readonly TaskStatus[]>(["done", "closed"]);
  const [view, setView] = useState("board");
  const [notice, setNotice] = useState("Read-only source fixture");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b-2 border-black bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <SourceFilter
            label="Creator"
            icon={<UserCircle2 size={14} />}
            onPress={() => setNotice("Creator source filter pressed")}
          />
          <SourceFilter
            label="Assignee"
            icon={<User size={14} />}
            onPress={() => setNotice("Assignee source filter pressed")}
          />
          <button
            type="button"
            onClick={() => setNotice("New Task source action pressed")}
            className="btn-brutal-sm inline-flex items-center gap-1 bg-brutal-pink px-2 py-1 text-xs font-bold"
          >
            <Plus size={12} />
            New Task
          </button>
          <SegmentedControl
            value={view}
            onValueChange={(nextView) => {
              setView(nextView);
              setNotice(`${nextView} source view selected`);
            }}
            ariaLabel="Source task view"
            className="ml-auto"
          >
            <SegmentedControlItem value="board">
              <Columns3 size={12} />
              <SegmentedControlLabel>Board</SegmentedControlLabel>
            </SegmentedControlItem>
            <SegmentedControlItem value="list">
              <LayoutList size={12} />
              <SegmentedControlLabel>List</SegmentedControlLabel>
            </SegmentedControlItem>
          </SegmentedControl>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white p-4 [padding-bottom:env(safe-area-inset-bottom)]">
        {view === "board" ? (
          <div className="flex min-w-max items-start gap-4 pr-4">
            {TASK_STATUSES.map((status) => {
              const tasks = TASK_FIXTURES.filter((task) => task.status === status.id);
              const isCollapsed = collapsed.includes(status.id);
              return (
                <section
                  key={status.id}
                  className="flex w-[320px] shrink-0 self-start flex-col border-2 border-black/20 bg-white/30 p-3 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed((current) =>
                        current.includes(status.id)
                          ? current.filter((item) => item !== status.id)
                          : [...current, status.id],
                      )
                    }
                    className={`flex w-full items-center justify-between gap-3 text-left ${isCollapsed ? "" : "mb-3"}`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`border border-black px-2 py-0.5 text-[10px] font-bold ${STATUS_BACKGROUNDS[status.id]}`}
                      >
                        {status.label.toUpperCase()}
                      </span>
                      <span className="font-mono text-xs text-black/50">{tasks.length}</span>
                    </span>
                    <span className="inline-flex items-center text-black/50">
                      <ChevronDown size={14} className={isCollapsed ? "-rotate-90" : ""} />
                    </span>
                  </button>
                  {!isCollapsed ? (
                    <div className="space-y-2.5">
                      {tasks.length === 0 ? (
                        <div className="border-2 border-dashed border-black/20 px-3 py-5 text-sm text-black/40">
                          No {status.label.toLowerCase()} tasks.
                        </div>
                      ) : (
                        tasks.map((task) => (
                          <SourceTaskCard key={task.id} task={task} onAction={setNotice} />
                        ))
                      )}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {TASK_STATUSES.map((status) => {
              const tasks = TASK_FIXTURES.filter((task) => task.status === status.id);
              const isCollapsed = collapsed.includes(status.id);
              return (
                <section key={status.id} className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed((current) =>
                        current.includes(status.id)
                          ? current.filter((item) => item !== status.id)
                          : [...current, status.id],
                      )
                    }
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`border border-black px-2 py-0.5 text-[10px] font-bold ${STATUS_BACKGROUNDS[status.id]}`}
                      >
                        {status.label.toUpperCase()}
                      </span>
                      <span className="font-mono text-xs text-black/50">{tasks.length}</span>
                    </span>
                    <ChevronDown size={14} className={isCollapsed ? "-rotate-90" : ""} />
                  </button>
                  {!isCollapsed ? (
                    <div className="space-y-2.5">
                      {tasks.map((task) => (
                        <SourceTaskCard key={task.id} task={task} onAction={setNotice} />
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {notice}
      </span>
    </div>
  );
}

export function TaskCardSourceComparisonComposition() {
  const [notice, setNotice] = useState("Interact with the source card.");

  return (
    <div className="grid w-full max-w-sm gap-3">
      <SourceTaskCard task={TASK_FIXTURES[0]} onAction={setNotice} />
      <p className="text-sm text-black/60" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}

function SourceFilter({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="inline-flex items-center gap-2 border-2 border-black/30 bg-white px-3 py-1.5 text-xs font-bold text-black/70 transition-colors hover:border-black"
    >
      {icon}
      {label}
      <ChevronDown size={12} />
    </button>
  );
}

function SourceTaskCard({
  task,
  onAction,
}: {
  task: TaskFixture;
  onAction: (notice: string) => void;
}) {
  return (
    <div className="w-full border-2 border-black bg-white px-3 py-2.5 text-left shadow-brutal-sm transition-all duration-100 hover:-translate-y-[1px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-xs">
      <button
        type="button"
        onClick={() => onAction(`Opened source task #${task.taskNumber}`)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-black/35">#{task.taskNumber}</span>
              {task.isLegacy ? (
                <span className="border border-black/30 px-1.5 py-0.5 text-[10px] font-bold text-black/50">
                  LEGACY
                </span>
              ) : null}
            </div>
            <p className="line-clamp-3 break-words text-sm leading-5 font-bold">{task.title}</p>
            {task.description ? (
              <p className="mt-1 line-clamp-2 break-words text-xs text-black/70">
                {task.description}
              </p>
            ) : null}
          </div>
        </div>
      </button>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => onAction(`Status source control for task #${task.taskNumber}`)}
          className={`mt-0.5 inline-flex items-center gap-1 border-2 border-black px-2 py-0.5 text-xs font-bold transition-[filter,opacity] duration-100 hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_BACKGROUNDS[task.status]}`}
        >
          {TASK_STATUSES.find((status) => status.id === task.status)?.label}
          <Pencil size={10} className="opacity-40" />
        </button>
      </div>
    </div>
  );
}
