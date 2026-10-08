import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { TaskStatusIcon } from "./task-status-icon";
import {
  taskStatus,
  taskStatusBorder,
  taskStatusStrong,
  taskStatusSoft,
} from "./task-status.recipe";
import type { TaskStatusId } from "./task-status.recipe";

export interface TaskStatusBadgeProps extends useRender.ComponentProps<"span"> {
  status: TaskStatusId;
  /** Badge text. The caller owns the copy (and its localization); Raft never
   *  hardcodes a status label here. */
  children?: ReactNode;
}

/**
 * A task status rendered as a badge: the status icon + caller-provided text,
 * coloured entirely from the shared `task-status-*` tokens. This is the entry
 * point hosts (and Raft's own message surfaces) use so a task status looks the
 * same everywhere — the caller passes a status, never a colour.
 *
 * Brutal paints a solid pastel fill with dark ink (matching the chip); elegant
 * paints the soft wash with the strong ink, so both themes keep the same hue
 * family per status.
 */
function TaskStatusBadgeRoot({
  status,
  children,
  className,
  render,
  ...props
}: TaskStatusBadgeProps) {
  const theme = useThemeFamily();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-status-badge",
    "data-status": status,
    className: cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0 text-xs font-medium leading-[1.4] whitespace-nowrap",
      "[&>svg]:shrink-0 [&>svg]:size-3",
      theme === "brutal"
        ? cn("border-line-strong text-black", taskStatus({ status }))
        : cn(
            taskStatusSoft({ status }),
            taskStatusStrong({ status }),
            taskStatusBorder({ status }),
          ),
      className,
    ),
    children: (
      <>
        <TaskStatusIcon status={status} />
        {children}
      </>
    ),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "task-status-badge", status },
  });
}

export const TaskStatusBadge = Object.assign(TaskStatusBadgeRoot, {});
