import { Collapsible } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import type { SlotElementProps } from "../../lib/data-attributes";
import type { TaskStatusId } from "../tasks/task-status.recipe";
import { TaskStatusIcon } from "../tasks/task-status-icon";
import { taskListSection } from "./task-list-section.recipe";

export type TaskListRootProps = useRender.ComponentProps<"div">;
export function TaskListRoot({ className, render, ...props }: TaskListRootProps) {
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "task-list-root",
    className: cn("stack-y-6", className),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TaskSectionProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};
export function TaskSection({ className, render, ...props }: TaskSectionProps) {
  const { root } = taskListSection();
  return (
    <Collapsible.Root
      data-slot="task-section"
      className={root({ className })}
      render={render ?? <section />}
      {...props}
    />
  );
}

export type TaskSectionTriggerProps = Omit<
  ComponentProps<typeof Collapsible.Trigger>,
  "className"
> & {
  className?: string;
};
export function TaskSectionTrigger({ className, ...props }: TaskSectionTriggerProps) {
  const { trigger } = taskListSection();
  return (
    <Collapsible.Trigger
      data-slot="task-section-trigger"
      className={trigger({ className })}
      {...props}
    />
  );
}

export type TaskSectionHeadingProps = useRender.ComponentProps<"span">;
export function TaskSectionHeading({ className, render, ...props }: TaskSectionHeadingProps) {
  const { heading } = taskListSection();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-section-heading",
    className: heading({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TaskSectionBadgeProps = useRender.ComponentProps<"span"> & {
  status: TaskStatusId;
};
export function TaskSectionBadge({
  status,
  children,
  className,
  render,
  ...props
}: TaskSectionBadgeProps) {
  const { badge } = taskListSection();
  const resolvedChildren = (
    <>
      <TaskStatusIcon status={status} />
      {children}
    </>
  );
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-section-badge",
    className: cn(badge(), className),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props, { children: resolvedChildren }),
  });
}

export type TaskSectionCountProps = useRender.ComponentProps<"span">;
export function TaskSectionCount({ className, render, ...props }: TaskSectionCountProps) {
  const { count } = taskListSection();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-section-count",
    className: count({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TaskSectionChevronProps = useRender.ComponentProps<"span">;
export function TaskSectionChevron({ className, render, ...props }: TaskSectionChevronProps) {
  const { chevron } = taskListSection();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-section-chevron",
    className: chevron({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TaskSectionPanelProps = Omit<ComponentProps<typeof Collapsible.Panel>, "className"> & {
  className?: string;
};
export function TaskSectionPanel({ className, ...props }: TaskSectionPanelProps) {
  const { panel } = taskListSection();
  return (
    <Collapsible.Panel data-slot="task-section-panel" className={panel({ className })} {...props} />
  );
}

export type TaskSectionItemsProps = useRender.ComponentProps<"div">;
export function TaskSectionItems({ className, render, ...props }: TaskSectionItemsProps) {
  const { items } = taskListSection();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "task-section-items",
    className: items({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TaskSectionEmptyProps = useRender.ComponentProps<"div">;
export function TaskSectionEmpty({ className, render, ...props }: TaskSectionEmptyProps) {
  const { empty } = taskListSection();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "task-section-empty",
    className: empty({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
