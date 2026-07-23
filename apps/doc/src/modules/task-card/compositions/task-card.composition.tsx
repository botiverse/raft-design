import type { RefObject } from "react";
import { DropdownMenu, DropdownMenuRadioGroup, DropdownMenuTrigger } from "raft-ui";
import {
  TaskCard,
  TaskCardBody,
  TaskCardChannel,
  TaskCardDescription,
  TaskCardHit,
  TaskCardLegacy,
  TaskCardMeta,
  TaskCardNumber,
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
import { TASK_STATUS_OPTIONS } from "../task-card.constants";

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
      <TaskCardRow>
        <TaskCardBody>
          <TaskCardMeta>
            {showChannelName ? <TaskCardChannel>#{task.channelName}</TaskCardChannel> : null}
            {readOnly ? (
              <TaskCardStatus busy={busy}>
                <TaskCardStatusTrigger status={task.status} render={<span />}>
                  {getTaskStatusLabel(task.status)} <Pencil aria-hidden />
                </TaskCardStatusTrigger>
              </TaskCardStatus>
            ) : (
              <DropdownMenu defaultOpen={menuOpen} modal={false}>
                <TaskCardStatus busy={busy}>
                  <DropdownMenuTrigger
                    disabled={disabled || busy || !onStatusChange}
                    render={
                      <TaskCardStatusTrigger
                        status={task.status}
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
                    portalRef
                      ? { container: portalRef as RefObject<HTMLElement | null> }
                      : undefined
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
            <TaskCardNumber>#{task.taskNumber}</TaskCardNumber>
            {task.isLegacy ? <TaskCardLegacy>LEGACY</TaskCardLegacy> : null}
          </TaskCardMeta>
          <TaskCardHit disabled={disabled || readOnly || !onOpen} onClick={() => onOpen?.(task)}>
            <TaskCardTitle>{task.title}</TaskCardTitle>
            {task.description ? (
              <TaskCardDescription>{task.description}</TaskCardDescription>
            ) : null}
          </TaskCardHit>
        </TaskCardBody>
      </TaskCardRow>
    </TaskCard>
  );
}
