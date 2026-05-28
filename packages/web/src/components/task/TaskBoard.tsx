import { useEffect, useState, useMemo } from "react";
import { Plus, ChevronRight, Columns3, LayoutList } from "lucide-react";
import { useTaskStore, type Task } from "../../store/taskStore";
import type { TaskStatus } from "../../store/taskStore";
import { useLegacyTaskPanelStore } from "../../store/legacyTaskPanelStore";
import { useProfileStore } from "../../store/profileStore";
import { useThreadStore } from "../../store/threadStore";
import TaskItem from "./TaskItem";
import TaskCard from "./TaskCard";
import CreateTaskDialog from "./CreateTaskDialog";
import SegmentedControl from "../ui/SegmentedControl";

type FilterTab = "all" | TaskStatus;
type ViewMode = "list" | "board";

// NOTE: This component is no longer mounted anywhere — TasksPanel replaced
// it in PR #1439. Kept temporarily so existing references / palette audit
// keep building; queue for deletion in a separate cleanup PR.
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "todo", label: "Todo" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "done", label: "Done" },
  { key: "closed", label: "Closed" },
];

const STATUS_ORDER: Record<TaskStatus, number> = {
  todo: 0,
  in_progress: 1,
  in_review: 2,
  done: 3,
  closed: 4,
};

const STATUS_META: Record<TaskStatus, { label: string; bg: string }> = {
  todo: { label: "Todo", bg: "bg-brutal-orange" },
  in_progress: { label: "In Progress", bg: "bg-brutal-cyan" },
  in_review: { label: "In Review", bg: "bg-brutal-lavender" },
  done: { label: "Done", bg: "bg-brutal-lime" },
  closed: { label: "Closed", bg: "bg-brutal-red" },
};

export default function TaskBoard({ channelId }: { channelId: string }) {
  const tasks = useTaskStore((s) => s.tasks);
  const loading = useTaskStore((s) => s.loading);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const openThread = useThreadStore((s) => s.openThread);
  const closeThread = useThreadStore((s) => s.closeThread);
  const closeProfile = useProfileStore((s) => s.closeProfile);
  const openLegacyTask = useLegacyTaskPanelStore((s) => s.openLegacyTask);
  const closeLegacyTask = useLegacyTaskPanelStore((s) => s.closeLegacyTask);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    loadTasks(channelId);
  }, [channelId, loadTasks]);

  // Sort: todo first, then in_progress, then in_review, then done — newest first within each group
  const sortedTasks = useMemo(() => {
    const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
    return [...filtered].sort((a, b) => {
      const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (statusDiff !== 0) return statusDiff;
      return b.taskNumber - a.taskNumber;
    });
  }, [tasks, filter]);

  // Split into active and done
  const activeTasks = useMemo(
    () => sortedTasks.filter((t) => t.status !== "done"),
    [sortedTasks],
  );
  const doneTasks = useMemo(
    () => sortedTasks.filter((t) => t.status === "done"),
    [sortedTasks],
  );
  const groupedTasks = useMemo(() => {
    return FILTER_TABS
      .filter((tab): tab is { key: TaskStatus; label: string } => tab.key !== "all")
      .filter((tab) => filter === "all" || tab.key === filter)
      .map((tab) => ({
        status: tab.key,
        tasks: sortedTasks.filter((task) => task.status === tab.key),
      }));
  }, [filter, sortedTasks]);

  const counts = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    in_review: tasks.filter((t) => t.status === "in_review").length,
    done: tasks.filter((t) => t.status === "done").length,
    closed: tasks.filter((t) => t.status === "closed").length,
  }), [tasks]);

  const openTask = (task: Task) => {
    closeProfile();
    if (task.isLegacy) {
      closeThread();
      openLegacyTask(task);
      return;
    }
    closeLegacyTask();
    void openThread(task.channelId, task.messageId);
  };

  return (
    <div data-testid="channel-task-panel" className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b-2 border-black bg-white px-3 py-3">
        {/* Filter tabs */}
        <div className="min-w-0 flex-1">
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            ariaLabel="Filter tasks"
            options={FILTER_TABS.map((tab) => ({
              value: tab.key,
              label: tab.label,
              count: counts[tab.key],
              testId: `channel-task-filter-${tab.key}`,
            }))}
          />
        </div>
        <SegmentedControl
          value={viewMode}
          onChange={setViewMode}
          ariaLabel="Task view"
          className="shrink-0"
          options={[
            { value: "list", label: "List", icon: <LayoutList size={12} />, testId: "channel-task-view-list" },
            { value: "board", label: "Board", icon: <Columns3 size={12} />, testId: "channel-task-view-board" },
          ]}
        />
        <button
          onClick={() => setShowCreateDialog(true)}
          className="btn-brutal-sm flex h-7 shrink-0 items-center gap-1 whitespace-nowrap bg-brutal-pink px-2 text-xs font-bold"
        >
          <Plus size={12} />
          New Task
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-auto bg-white px-3 py-3">
        {loading ? (
          <div className="py-4 text-center text-black/40 font-mono text-sm">Loading tasks…</div>
        ) : sortedTasks.length === 0 ? (
          <div className="py-4 text-center text-black/40 font-mono text-sm">
            {filter === "all" ? "No tasks yet. Create one to get started!" : `No ${filter} tasks.`}
          </div>
        ) : viewMode === "board" ? (
          <div data-testid="channel-task-board-view" className="flex min-w-max items-start gap-4 pr-4">
            {groupedTasks.map(({ status, tasks: statusTasks }) => (
              <section
                key={status}
                className="flex w-[320px] shrink-0 self-start flex-col border-2 border-black/20 bg-white/30 p-3"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`border border-black px-2 py-0.5 text-[10px] font-bold ${STATUS_META[status].bg}`}>
                    {STATUS_META[status].label.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-black/50">{statusTasks.length}</span>
                </div>
                {statusTasks.length === 0 ? (
                  <div className="border-2 border-dashed border-black/20 px-3 py-5 text-sm text-black/40">
                    No {STATUS_META[status].label.toLowerCase()} tasks.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {statusTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onOpen={() => openTask(task)}
                        showChannelName={false}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <>
            {/* Active tasks */}
            <div className="space-y-2">
              {activeTasks.map((task) => (
                <TaskItem key={task.id} task={task} channelId={channelId} />
              ))}
            </div>

            {/* Done tasks — collapsible */}
            {doneTasks.length > 0 && filter !== "done" && (
              <button
                onClick={() => setShowDone((v) => !v)}
                className="flex items-center gap-1 text-xs font-bold text-black/50 hover:text-black/70 transition-colors py-1"
              >
                <ChevronRight
                  size={12}
                  className={`transition-transform ${showDone ? "rotate-90" : ""}`}
                />
                {doneTasks.length} done
              </button>
            )}
            {(showDone || filter === "done") &&
              (
                <div className="space-y-2">
                  {doneTasks.map((task) => (
                    <TaskItem key={task.id} task={task} channelId={channelId} />
                  ))}
                </div>
              )}
          </>
        )}
      </div>

      {showCreateDialog && (
        <CreateTaskDialog
          channelId={channelId}
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </div>
  );
}
