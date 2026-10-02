import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
  TaskListRoot,
  TaskSection,
  TaskSectionBadge,
  TaskSectionChevron,
  TaskSectionCount,
  TaskSectionEmpty,
  TaskSectionHeading,
  TaskSectionItems,
  TaskSectionPanel,
  TaskSectionTrigger,
} from "raft-ui";
import { ChevronDown } from "lucide-react";

import {
  getTaskStatusLabel,
  TASK_FIXTURES,
  TASK_STATUSES,
} from "#/modules/task-card/task-card.fixtures.ts";
import type { TaskFixture, TaskStatus } from "#/modules/task-card/task-card.fixtures.ts";
import { TaskCardComposition } from "#/modules/task-card/compositions/task-card.composition.tsx";

const DEFAULT_COLLAPSED: Record<TaskStatus, boolean> = {
  todo: false,
  "in-progress": false,
  "in-review": false,
  done: true,
  closed: true,
};

const EXPANDED: Record<TaskStatus, boolean> = {
  todo: false,
  "in-progress": false,
  "in-review": false,
  done: false,
  closed: false,
};

export type TaskListCompositionProps = {
  tasks?: readonly TaskFixture[];
  showChannelName?: boolean;
  /** When true, every status section starts expanded (useful for empty-section demos). */
  expandAll?: boolean;
};

function TaskListStatusSection({
  children,
  collapsed,
  status,
  onCollapsedChange,
}: {
  children: ReactNode;
  collapsed: boolean;
  status: TaskStatus;
  onCollapsedChange: (status: TaskStatus, collapsed: boolean) => void;
}) {
  const handleOpenChange = useCallback(
    (open: boolean) => onCollapsedChange(status, !open),
    [onCollapsedChange, status],
  );

  return (
    <TaskSection open={!collapsed} onOpenChange={handleOpenChange}>
      {children}
    </TaskSection>
  );
}

export function TaskListComposition({
  tasks: controlledTasks,
  showChannelName = false,
  expandAll = false,
}: TaskListCompositionProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [localTasks, setLocalTasks] = useState<readonly TaskFixture[]>(TASK_FIXTURES);
  const [collapsed, setCollapsed] = useState<Record<TaskStatus, boolean>>(
    expandAll ? EXPANDED : DEFAULT_COLLAPSED,
  );
  const [announcement, setAnnouncement] = useState("Ready");

  const tasks = controlledTasks ?? localTasks;
  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => b.taskNumber - a.taskNumber),
    [tasks],
  );

  const updateStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      const task = tasks.find((item) => item.id === taskId);
      if (!task || task.status === status) return;
      const next = tasks.map((item) => (item.id === taskId ? { ...item, status } : item));
      if (controlledTasks === undefined) setLocalTasks(next);
      setAnnouncement(`Task #${task.taskNumber} moved to ${getTaskStatusLabel(status)}`);
    },
    [controlledTasks, tasks],
  );
  const openTask = useCallback((task: TaskFixture) => {
    setAnnouncement(`Opened task #${task.taskNumber}: ${task.title}`);
  }, []);
  const handleCollapsedChange = useCallback((status: TaskStatus, nextCollapsed: boolean) => {
    setCollapsed((current) => ({ ...current, [status]: nextCollapsed }));
  }, []);

  return (
    <ScrollArea ref={portalRef} className="relative size-full min-h-0  min-w-0">
      <ScrollAreaViewport className="p-4">
        <ScrollAreaContent>
          <TaskListRoot>
            {TASK_STATUSES.map((status) => {
              const statusTasks = sortedTasks.filter((task) => task.status === status.id);
              return (
                <TaskListStatusSection
                  key={status.id}
                  status={status.id}
                  collapsed={collapsed[status.id]}
                  onCollapsedChange={handleCollapsedChange}
                >
                  <TaskSectionTrigger>
                    <TaskSectionHeading>
                      <TaskSectionBadge status={status.id}>{status.label}</TaskSectionBadge>
                      <TaskSectionCount>{statusTasks.length}</TaskSectionCount>
                    </TaskSectionHeading>
                    <TaskSectionChevron>
                      <ChevronDown aria-hidden />
                    </TaskSectionChevron>
                  </TaskSectionTrigger>
                  <TaskSectionPanel>
                    {statusTasks.length === 0 ? (
                      <TaskSectionEmpty>No {status.label.toLowerCase()} tasks.</TaskSectionEmpty>
                    ) : (
                      <TaskSectionItems>
                        {statusTasks.map((task) => (
                          <TaskCardComposition
                            key={task.id}
                            task={task}
                            onOpen={openTask}
                            onStatusChange={updateStatus}
                            portalRef={portalRef}
                            showChannelName={showChannelName}
                          />
                        ))}
                      </TaskSectionItems>
                    )}
                  </TaskSectionPanel>
                </TaskListStatusSection>
              );
            })}
          </TaskListRoot>
          <span className="sr-only" aria-live="polite">
            {announcement}
          </span>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  );
}
