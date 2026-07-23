import { Select as BaseSelect } from "@base-ui/react/select";
import type { ReactElement, RefObject } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
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
  title = "Task status",
}: {
  value: TaskStatus;
  trigger: ReactElement;
  disabled?: boolean;
  defaultOpen?: boolean;
  onValueChange?: (status: TaskStatus) => void;
  portalRef?: RefObject<HTMLElement | null>;
  title?: string;
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
      <SelectContent
        align="start"
        className="w-[220px] min-w-[220px]"
        portalProps={portalRef ? { container: portalRef } : undefined}
      >
        <SelectList>
          <SelectGroup>
            <SelectGroupLabel>{title}</SelectGroupLabel>
            {TASK_STATUSES.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                <TaskStatusIcon status={status.id} />
                <SelectItemText>{status.label}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectList>
      </SelectContent>
    </Select>
  );
}
