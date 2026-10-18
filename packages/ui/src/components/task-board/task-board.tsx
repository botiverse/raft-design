import { Collapsible } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import type { SlotElementProps } from "../../lib/data-attributes";
import type { TaskStatusId } from "../tasks/task-status.recipe";
import { TaskStatusIcon } from "../tasks/task-status-icon";
import { taskBoardColumn } from "./task-board-column.recipe";

export type TaskBoardRootProps = useRender.ComponentProps<"div">;
export function TaskBoardRoot({ className, render, ...props }: TaskBoardRootProps) {
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "task-board-root",
    className: cn("flex min-w-max items-start gap-4 pr-4", className),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TaskBoardColumnProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};
export function TaskBoardColumn({ className, render, ...props }: TaskBoardColumnProps) {
  const { root } = taskBoardColumn();
  return (
    <Collapsible.Root
      data-slot="task-board-column"
      className={root({ className })}
      render={render ?? <section />}
      {...props}
    />
  );
}

export type TaskBoardColumnTriggerProps = Omit<
  ComponentProps<typeof Collapsible.Trigger>,
  "className"
> & {
  className?: string;
};
export function TaskBoardColumnTrigger({ className, ...props }: TaskBoardColumnTriggerProps) {
  const { trigger } = taskBoardColumn();
  return (
    <Collapsible.Trigger
      data-slot="task-board-column-trigger"
      className={trigger({ className })}
      {...props}
    />
  );
}

export type TaskBoardColumnHeadingProps = useRender.ComponentProps<"span">;
export function TaskBoardColumnHeading({
  className,
  render,
  ...props
}: TaskBoardColumnHeadingProps) {
  const { heading } = taskBoardColumn();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-board-column-heading",
    className: heading({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TaskBoardColumnBadgeProps = useRender.ComponentProps<"span"> & {
  status: TaskStatusId;
};
export function TaskBoardColumnBadge({
  status,
  children,
  className,
  render,
  ...props
}: TaskBoardColumnBadgeProps) {
  const { badge } = taskBoardColumn();
  const resolvedChildren = (
    <>
      <TaskStatusIcon status={status} />
      {children}
    </>
  );
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-board-column-badge",
    className: cn(badge(), className),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props, { children: resolvedChildren }),
  });
}

export type TaskBoardColumnCountProps = useRender.ComponentProps<"span">;
export function TaskBoardColumnCount({ className, render, ...props }: TaskBoardColumnCountProps) {
  const { count } = taskBoardColumn();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-board-column-count",
    className: count({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TaskBoardColumnChevronProps = useRender.ComponentProps<"span">;
export function TaskBoardColumnChevron({
  className,
  render,
  ...props
}: TaskBoardColumnChevronProps) {
  const { chevron } = taskBoardColumn();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-board-column-chevron",
    className: chevron({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TaskBoardColumnPanelProps = Omit<
  ComponentProps<typeof Collapsible.Panel>,
  "className"
> & {
  className?: string;
};
export function TaskBoardColumnPanel({ className, ...props }: TaskBoardColumnPanelProps) {
  const { panel } = taskBoardColumn();
  return (
    <Collapsible.Panel
      data-slot="task-board-column-panel"
      className={panel({ className })}
      {...props}
    />
  );
}

export type TaskBoardColumnItemsProps = useRender.ComponentProps<"div">;
export function TaskBoardColumnItems({ className, render, ...props }: TaskBoardColumnItemsProps) {
  const { items } = taskBoardColumn();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "task-board-column-items",
    className: items({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TaskBoardColumnEmptyProps = useRender.ComponentProps<"div">;
export function TaskBoardColumnEmpty({ className, render, ...props }: TaskBoardColumnEmptyProps) {
  const { empty } = taskBoardColumn();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "task-board-column-empty",
    className: empty({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TaskBoardColumnEmptyIdleProps = useRender.ComponentProps<"span">;
export function TaskBoardColumnEmptyIdle({
  className,
  render,
  ...props
}: TaskBoardColumnEmptyIdleProps) {
  const { emptyIdle } = taskBoardColumn();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-board-column-empty-idle",
    className: emptyIdle({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TaskBoardColumnEmptyAllowedProps = useRender.ComponentProps<"span">;
export function TaskBoardColumnEmptyAllowed({
  className,
  render,
  ...props
}: TaskBoardColumnEmptyAllowedProps) {
  const { emptyAllowed } = taskBoardColumn();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-board-column-empty-allowed",
    className: emptyAllowed({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TaskBoardColumnEmptyBlockedProps = useRender.ComponentProps<"span">;
export function TaskBoardColumnEmptyBlocked({
  className,
  render,
  ...props
}: TaskBoardColumnEmptyBlockedProps) {
  const { emptyBlocked } = taskBoardColumn();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-board-column-empty-blocked",
    className: emptyBlocked({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
