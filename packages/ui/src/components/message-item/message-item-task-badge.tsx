import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { taskStatus, type TaskStatusId } from "../tasks/task-status.recipe";
import { messageItemTaskBadge } from "./message-item-task-badge.recipe";

export type MessageItemTaskBadgeProps = useRender.ComponentProps<"span"> & {
  status: TaskStatusId;
  busy?: boolean;
};

export function MessageItemTaskBadge({
  status,
  busy = false,
  className,
  render,
  ...props
}: MessageItemTaskBadgeProps) {
  const theme = useThemeFamily();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "message-item-task-badge",
    "data-task-status": status,
    "aria-busy": busy || undefined,
    "data-busy": busy ? "true" : undefined,
    className: cn(
      messageItemTaskBadge({ theme }),
      taskStatus({ theme, status }),
      busy && "pointer-events-none opacity-60",
      className,
    ),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
