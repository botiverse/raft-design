import type { RefObject } from "react";
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
  TaskCardStatusTrigger,
  TaskCardTitle,
} from "raft-ui/wip";
import { Pencil } from "lucide-react";

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
  return (
    <TaskCard disabled={disabled} onClick={readOnly || !onOpen ? undefined : () => onOpen(task)}>
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
              <TaskCardStatus busy={busy}>
                <TaskStatusSelect
                  value={task.status}
                  disabled={disabled || busy || !onStatusChange}
                  defaultOpen={menuOpen}
                  onValueChange={(status) => onStatusChange?.(task.id, status)}
                  portalRef={portalRef as RefObject<HTMLElement | null> | undefined}
                  trigger={
                    <TaskCardStatusTrigger
                      status={task.status}
                      busy={busy}
                      disabled={disabled || busy || !onStatusChange}
                    >
                      {getTaskStatusLabel(task.status)}
                      <Pencil aria-hidden />
                    </TaskCardStatusTrigger>
                  }
                />
              </TaskCardStatus>
            )}
            <TaskCardNumber>#{task.taskNumber}</TaskCardNumber>
            {task.isLegacy ? <TaskCardLegacy>LEGACY</TaskCardLegacy> : null}
          </TaskCardMeta>
          <TaskCardTitle>{task.title}</TaskCardTitle>
          {task.description ? <TaskCardDescription>{task.description}</TaskCardDescription> : null}
        </TaskCardBody>
      </TaskCardRow>
    </TaskCard>
  );
}
