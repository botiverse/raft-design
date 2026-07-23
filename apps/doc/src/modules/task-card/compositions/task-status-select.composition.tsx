import { Select as BaseSelect } from "@base-ui/react/select";
import type { ReactElement, RefObject } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
} from "raft-ui";
import { TaskStatusIcon } from "raft-ui/wip";

import { TASK_STATUSES, type TaskStatus } from "../task-card.fixtures";

const TASK_STATUS_SELECT_ITEMS = TASK_STATUSES.map(({ id, label }) => ({ value: id, label }));

export function TaskStatusSelect({
  value,
  trigger,
  disabled = false,
  defaultOpen,
  onValueChange,
  portalRef,
}: {
  value: TaskStatus;
  trigger: ReactElement;
  disabled?: boolean;
  defaultOpen?: boolean;
  onValueChange?: (status: TaskStatus) => void;
  portalRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <Select<TaskStatus>
      value={value}
      items={TASK_STATUS_SELECT_ITEMS}
      disabled={disabled}
      defaultOpen={defaultOpen}
      modal={false}
      onValueChange={(nextValue) => {
        if (nextValue) onValueChange?.(nextValue);
      }}
    >
      <BaseSelect.Trigger render={trigger} onClick={(event) => event.stopPropagation()} />
      <SelectContent align="end" portalProps={portalRef ? { container: portalRef } : undefined}>
        <SelectList>
          {TASK_STATUSES.map((status) => (
            <SelectItem key={status.id} value={status.id}>
              <TaskStatusIcon status={status.id} />
              <SelectItemText>{status.label}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}
