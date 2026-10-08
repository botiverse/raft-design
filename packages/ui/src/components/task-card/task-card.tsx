import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { taskStatus } from "../tasks/task-status.recipe";
import type { TaskStatusId } from "../tasks/task-status.recipe";
import { TaskStatusIcon } from "../tasks/task-status-icon";
import { taskCardStatus } from "./task-card-status.recipe";
import { taskCard } from "./task-card.recipe";

export type TaskCardProps = useRender.ComponentProps<"article"> & {
  busy?: boolean;
  disabled?: boolean;
};
export function TaskCard({
  busy = false,
  disabled = false,
  className,
  render,
  ...props
}: TaskCardProps) {
  const theme = useThemeFamily();
  const { root } = taskCard({ theme });
  const interactive = props.onClick != null;
  const defaultProps: SlotElementProps<"article"> = {
    "data-slot": "task-card",
    "aria-busy": busy || undefined,
    "aria-disabled": disabled || undefined,
    "data-busy": busy ? "true" : undefined,
    "data-disabled": disabled ? "true" : undefined,
    "data-interactive": interactive ? "true" : undefined,
    className: root({ className }),
  };
  return useRender({
    defaultTagName: "article",
    render,
    props: mergeProps<"article">(defaultProps, props),
  });
}

export type TaskCardRowProps = useRender.ComponentProps<"div">;
export function TaskCardRow({ className, render, ...props }: TaskCardRowProps) {
  const theme = useThemeFamily();
  const { row } = taskCard({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "task-card-row",
    className: row({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TaskCardBodyProps = useRender.ComponentProps<"div">;
export function TaskCardBody({ className, render, ...props }: TaskCardBodyProps) {
  const theme = useThemeFamily();
  const { body } = taskCard({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "task-card-body",
    className: body({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TaskCardMetaProps = useRender.ComponentProps<"div">;
export function TaskCardMeta({ className, render, ...props }: TaskCardMetaProps) {
  const theme = useThemeFamily();
  const { meta } = taskCard({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "task-card-meta",
    className: meta({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TaskCardChannelProps = useRender.ComponentProps<"span">;
export function TaskCardChannel({ className, render, ...props }: TaskCardChannelProps) {
  const theme = useThemeFamily();
  const { channel } = taskCard({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-card-channel",
    className: channel({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TaskCardNumberProps = useRender.ComponentProps<"span">;
export function TaskCardNumber({ className, render, ...props }: TaskCardNumberProps) {
  const theme = useThemeFamily();
  const { number } = taskCard({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-card-number",
    className: number({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TaskCardLegacyProps = useRender.ComponentProps<"span">;
export function TaskCardLegacy({ className, render, ...props }: TaskCardLegacyProps) {
  const theme = useThemeFamily();
  const { legacy } = taskCard({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-card-legacy",
    className: legacy({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TaskCardTitleProps = useRender.ComponentProps<"p">;
export function TaskCardTitle({ className, render, ...props }: TaskCardTitleProps) {
  const theme = useThemeFamily();
  const { title } = taskCard({ theme });
  const defaultProps: SlotElementProps<"p"> = {
    "data-slot": "task-card-title",
    className: title({ className }),
  };
  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
  });
}

export type TaskCardDescriptionProps = useRender.ComponentProps<"p">;
export function TaskCardDescription({ className, render, ...props }: TaskCardDescriptionProps) {
  const theme = useThemeFamily();
  const { description } = taskCard({ theme });
  const defaultProps: SlotElementProps<"p"> = {
    "data-slot": "task-card-description",
    className: description({ className }),
  };
  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
  });
}

export type TaskCardStatusProps = useRender.ComponentProps<"button"> & {
  busy?: boolean;
  status: TaskStatusId;
};
export function TaskCardStatus({
  busy = false,
  status,
  className,
  render,
  children,
  ...props
}: TaskCardStatusProps) {
  const theme = useThemeFamily();
  const styles = taskCardStatus({ theme });
  const resolvedChildren = children ?? <TaskStatusIcon status={status} />;
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "task-card-status",
    "data-busy": busy ? "true" : undefined,
    "aria-busy": busy || undefined,
    className: cn(styles, taskStatus({ status }), className),
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props, { children: resolvedChildren }),
  });
}
