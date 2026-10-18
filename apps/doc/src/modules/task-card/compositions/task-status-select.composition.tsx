import { useCallback, useMemo } from "react";
import type { MouseEvent, ReactElement, RefObject } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  TaskStatusIcon,
} from "@botiverse/raft-ui";

import { TASK_STATUSES } from "../task-card.fixtures";
import type { TaskStatus } from "../task-card.fixtures";

const TASK_STATUS_SELECT_ITEMS = TASK_STATUSES.map(({ id, label }) => ({ value: id, label }));

function stopPropagation(event: MouseEvent) {
  event.stopPropagation();
}

export function TaskStatusSelect({
  value,
  children,
  disabled = false,
  defaultOpen,
  onValueChange,
  portalRef,
  title = "Task status",
}: {
  value: TaskStatus;
  children: ReactElement;
  disabled?: boolean;
  defaultOpen?: boolean;
  onValueChange?: (status: TaskStatus) => void;
  portalRef?: RefObject<HTMLElement | null>;
  title?: string;
}) {
  const handleValueChange = useCallback(
    (nextValue: TaskStatus | null) => {
      if (nextValue) onValueChange?.(nextValue);
    },
    [onValueChange],
  );
  const portalProps = useMemo(
    () => (portalRef ? { container: portalRef } : undefined),
    [portalRef],
  );

  return (
    <Select<TaskStatus>
      value={value}
      items={TASK_STATUS_SELECT_ITEMS}
      disabled={disabled}
      defaultOpen={defaultOpen}
      modal={false}
      onValueChange={handleValueChange}
    >
      <SelectTrigger render={children} onClick={stopPropagation} />
      <SelectContent align="start" className="w-[220px] min-w-[220px]" portalProps={portalProps}>
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
