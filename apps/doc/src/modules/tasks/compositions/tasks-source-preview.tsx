import { ChevronDown, Columns3, LayoutList, Plus, User, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "raft-ui";

import {
  TASK_FIXTURES,
  TASK_STATUS_BACKGROUNDS,
  TASK_STATUSES,
  type TaskStatus,
} from "#/modules/task-card/task-card.fixtures.ts";
import { SourceTaskCard } from "#/modules/task-card/task-card.source-comparison.tsx";

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
                        className={`border border-black px-2 py-0.5 text-[10px] font-bold ${TASK_STATUS_BACKGROUNDS[status.id]}`}
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
                        tasks.map((task) => <SourceTaskCard key={task.id} task={task} />)
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
                        className={`border border-black px-2 py-0.5 text-[10px] font-bold ${TASK_STATUS_BACKGROUNDS[status.id]}`}
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
                        <SourceTaskCard key={task.id} task={task} />
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
