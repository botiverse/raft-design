import type { RefObject } from "react";
import { EllipsisVertical } from "lucide-react";
import { Button, useThemeFamily } from "raft-ui";
import {
  TaskCard,
  TaskCardBody,
  TaskCardChannel,
  TaskCardDescription,
  TaskCardLegacy,
  TaskCardMeta,
  TaskCardNumber,
  TaskCardRow,
  TaskCardStatus,
  TaskCardTitle,
  TaskStatusIcon,
} from "raft-ui/wip";

import { getTaskStatusLabel, type TaskFixture, type TaskStatus } from "../task-card.fixtures";
import { TaskStatusSelect } from "./task-status-select.composition";

export function TaskCardComposition({
  task,
  busy = false,
  disabled = task.disabled,
  readOnly = false,
  menuOpen,
  onOpen,
  onStatusChange,
  portalRef,
  showChannelName = false,
}: {
  task: TaskFixture;
  busy?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  menuOpen?: boolean;
  onOpen?: (task: TaskFixture) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  portalRef?: RefObject<HTMLDivElement | null>;
  showChannelName?: boolean;
}) {
  const theme = useThemeFamily();
  const statusSelectProps = {
    value: task.status,
    disabled: disabled || busy || !onStatusChange,
    onValueChange: (status: TaskStatus) => onStatusChange?.(task.id, status),
    portalRef: portalRef as RefObject<HTMLElement | null> | undefined,
  };

  return (
    <TaskCard disabled={disabled} onClick={readOnly || !onOpen ? undefined : () => onOpen(task)}>
      <TaskCardRow>
        <TaskCardBody>
          <TaskCardMeta>
            {showChannelName ? <TaskCardChannel>#{task.channelName}</TaskCardChannel> : null}
            {readOnly ? (
              <TaskCardStatus
                busy={busy}
                status={task.status}
                render={<span />}
                aria-label={`Status for task #${task.taskNumber}`}
              >
                <TaskStatusIcon status={task.status} />
              </TaskCardStatus>
            ) : (
              <TaskStatusSelect
                {...statusSelectProps}
                defaultOpen={theme === "elegant" ? menuOpen : undefined}
                title="Change task status"
              >
                <TaskCardStatus
                  status={task.status}
                  busy={busy}
                  disabled={disabled || busy || !onStatusChange}
                  aria-label={`Change status for task #${task.taskNumber}`}
                >
                  <TaskStatusIcon status={task.status} />
                </TaskCardStatus>
              </TaskStatusSelect>
            )}
            <TaskCardNumber>#{task.taskNumber}</TaskCardNumber>
            {task.isLegacy ? <TaskCardLegacy>LEGACY</TaskCardLegacy> : null}
            {readOnly ? null : (
              <TaskStatusSelect {...statusSelectProps} title="Change task status">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={disabled || busy || !onStatusChange}
                  aria-label={`Edit status for task #${task.taskNumber}`}
                  className="ml-auto [[data-theme=brutal]_&]:hidden"
                >
                  <EllipsisVertical />
                </Button>
              </TaskStatusSelect>
            )}
            {readOnly ? (
              <TaskCardStatus
                busy={busy}
                status={task.status}
                render={<span />}
                aria-label={`Status for task #${task.taskNumber}`}
              >
                <span data-slot="task-card-status-label">
                  <TaskStatusIcon status={task.status} />
                  {getTaskStatusLabel(task.status)}
                </span>
              </TaskCardStatus>
            ) : (
              <TaskStatusSelect {...statusSelectProps} title="Change task status">
                <TaskCardStatus
                  status={task.status}
                  busy={busy}
                  disabled={disabled || busy || !onStatusChange}
                  aria-label={`Change status for task #${task.taskNumber}`}
                >
                  <span data-slot="task-card-status-label">
                    <TaskStatusIcon status={task.status} />
                    {getTaskStatusLabel(task.status)}
                  </span>
                </TaskCardStatus>
              </TaskStatusSelect>
            )}
          </TaskCardMeta>
          <TaskCardTitle>{task.title}</TaskCardTitle>
          {task.description ? <TaskCardDescription>{task.description}</TaskCardDescription> : null}
        </TaskCardBody>
      </TaskCardRow>
    </TaskCard>
  );
}
