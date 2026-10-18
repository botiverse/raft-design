import { useCallback } from "react";
import type { ReactNode } from "react";
import {
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
} from "@botiverse/raft-ui";
import { ChevronDown } from "lucide-react";

import { TASK_STATUSES } from "#/modules/task-card/task-card.fixtures.ts";
import type { TaskStatus } from "#/modules/task-card/task-card.fixtures.ts";
import { TaskCardComposition } from "#/modules/task-card/compositions/task-card.composition.tsx";
import type { TasksPanelViewProps } from "./tasks-panel-view.types.ts";

function TasksPanelListSection({
  children,
  open,
  status,
  onOpenChange,
}: {
  children: ReactNode;
  open: boolean;
  status: TaskStatus;
  onOpenChange: (status: TaskStatus, open: boolean) => void;
}) {
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => onOpenChange(status, nextOpen),
    [onOpenChange, status],
  );

  return (
    <TaskSection open={open} onOpenChange={handleOpenChange}>
      {children}
    </TaskSection>
  );
}

/** List view of the tasks panel: one collapsible section per status. */
export function TasksPanelListView(props: TasksPanelViewProps) {
  return (
    <TaskListRoot>
      {TASK_STATUSES.map((status) => {
        const statusTasks = props.tasks.filter((task) => task.status === status.id);
        return (
          <TasksPanelListSection
            key={status.id}
            status={status.id}
            open={!props.collapsed[status.id]}
            onOpenChange={props.onCollapsedChange}
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
                      onOpen={props.onOpenTask}
                      onStatusChange={props.onStatusChange}
                      portalRef={props.portalRef}
                      showChannelName={props.showChannelName}
                    />
                  ))}
                </TaskSectionItems>
              )}
            </TaskSectionPanel>
          </TasksPanelListSection>
        );
      })}
    </TaskListRoot>
  );
}
