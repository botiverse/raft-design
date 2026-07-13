import type { RefObject } from "react";
import { DropdownMenu, DropdownMenuRadioGroup, DropdownMenuTrigger } from "raft-ui";
import {
  TaskCard,
  TaskCardBody,
  TaskCardChannel,
  TaskCardDescription,
  TaskCardFooter,
  TaskCardLegacy,
  TaskCardMeta,
  TaskCardNumber,
  TaskCardOpen,
  TaskCardRow,
  TaskCardStatus,
  TaskCardStatusTrigger,
  TaskCardTitle,
  TaskStatusMenuContent,
  TaskStatusMenuItem,
} from "raft-ui/wip";
import { Pencil } from "lucide-react";

import {
  getTaskStatusLabel,
  TASK_STATUSES,
  type TaskFixture,
  type TaskStatus,
} from "../task-card.fixtures";
import { TASK_STATUS_OPTIONS, TASK_STATUS_TONES } from "../task-card.constants";

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
  return (
    <TaskCard disabled={disabled}>
      <TaskCardOpen disabled={disabled || readOnly || !onOpen} onClick={() => onOpen?.(task)}>
        <TaskCardRow>
          <TaskCardBody>
            <TaskCardMeta>
              {showChannelName ? <TaskCardChannel>#{task.channelName}</TaskCardChannel> : null}
              <TaskCardNumber>#{task.taskNumber}</TaskCardNumber>
              {task.isLegacy ? <TaskCardLegacy>LEGACY</TaskCardLegacy> : null}
            </TaskCardMeta>
            <TaskCardTitle>{task.title}</TaskCardTitle>
            {task.description ? (
              <TaskCardDescription>{task.description}</TaskCardDescription>
            ) : null}
          </TaskCardBody>
        </TaskCardRow>
      </TaskCardOpen>
      <TaskCardFooter>
        {readOnly ? (
          <TaskCardStatus busy={busy}>
            <TaskCardStatusTrigger tone={TASK_STATUS_TONES[task.status]} render={<span />}>
              {getTaskStatusLabel(task.status)} <Pencil aria-hidden />
            </TaskCardStatusTrigger>
          </TaskCardStatus>
        ) : (
          <DropdownMenu defaultOpen={menuOpen}>
            <TaskCardStatus busy={busy}>
              <DropdownMenuTrigger
                disabled={disabled || busy || !onStatusChange}
                render={
                  <TaskCardStatusTrigger
                    tone={TASK_STATUS_TONES[task.status]}
                    busy={busy}
                    disabled={disabled || busy || !onStatusChange}
                  />
                }
              >
                {getTaskStatusLabel(task.status)}
                <Pencil aria-hidden />
              </DropdownMenuTrigger>
            </TaskCardStatus>
            <TaskStatusMenuContent
              align="end"
              portalProps={
                portalRef ? { container: portalRef as RefObject<HTMLElement | null> } : undefined
              }
            >
              <DropdownMenuRadioGroup
                value={task.status}
                onValueChange={(status) => onStatusChange?.(task.id, status as TaskStatus)}
              >
                {TASK_STATUSES.flatMap((status) =>
                  TASK_STATUS_OPTIONS[task.status].has(status.id)
                    ? [
                        <TaskStatusMenuItem key={status.id} value={status.id}>
                          {status.label}
                        </TaskStatusMenuItem>,
                      ]
                    : [],
                )}
              </DropdownMenuRadioGroup>
            </TaskStatusMenuContent>
          </DropdownMenu>
        )}
      </TaskCardFooter>
    </TaskCard>
  );
}
