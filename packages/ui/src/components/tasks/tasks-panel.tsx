import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { tasksPanel } from "./tasks-panel.recipe";

export type TasksPanelRootProps = useRender.ComponentProps<"section">;
export function TasksPanelRoot({ className, render, ...props }: TasksPanelRootProps) {
  const { root } = tasksPanel();
  const defaultProps: SlotElementProps<"section"> = {
    "data-slot": "tasks-panel-root",
    className: root({ className }),
  };
  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type TasksPanelToolbarProps = useRender.ComponentProps<"div">;
export function TasksPanelToolbar({ className, render, ...props }: TasksPanelToolbarProps) {
  const { toolbar } = tasksPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "tasks-panel-toolbar",
    className: toolbar({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

/** Generic toolbar cluster. Prefer NewTask / Filters / View for responsive layout. */
export type TasksPanelToolbarGroupProps = useRender.ComponentProps<"div">;
export function TasksPanelToolbarGroup({
  className,
  render,
  ...props
}: TasksPanelToolbarGroupProps) {
  const { toolbarGroup } = tasksPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "tasks-panel-toolbar-group",
    className: toolbarGroup({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TasksPanelToolbarNewTaskProps = useRender.ComponentProps<"div">;
export function TasksPanelToolbarNewTask({
  className,
  render,
  ...props
}: TasksPanelToolbarNewTaskProps) {
  const { toolbarNewTask } = tasksPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "tasks-panel-toolbar-new-task",
    className: toolbarNewTask({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TasksPanelToolbarFiltersProps = useRender.ComponentProps<"div">;
export function TasksPanelToolbarFilters({
  className,
  render,
  ...props
}: TasksPanelToolbarFiltersProps) {
  const { toolbarFilters } = tasksPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "tasks-panel-toolbar-filters",
    className: toolbarFilters({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TasksPanelToolbarViewProps = useRender.ComponentProps<"div">;
export function TasksPanelToolbarView({ className, render, ...props }: TasksPanelToolbarViewProps) {
  const { toolbarView } = tasksPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "tasks-panel-toolbar-view",
    className: toolbarView({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TasksPanelToolbarLabelProps = useRender.ComponentProps<"span">;
export function TasksPanelToolbarLabel({
  className,
  render,
  ...props
}: TasksPanelToolbarLabelProps) {
  const { toolbarLabel } = tasksPanel();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "tasks-panel-toolbar-label",
    className: toolbarLabel({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type TasksPanelViewportProps = useRender.ComponentProps<"div">;
export function TasksPanelViewport({ className, render, ...props }: TasksPanelViewportProps) {
  const { viewport } = tasksPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "tasks-panel-viewport",
    className: viewport({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TasksPanelEmptyProps = useRender.ComponentProps<"div">;
export function TasksPanelEmpty({ className, render, ...props }: TasksPanelEmptyProps) {
  const { empty } = tasksPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "tasks-panel-empty",
    className: empty({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
