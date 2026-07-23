import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { tasksPanel } from "./tasks-panel.recipe";

export type TasksPanelRootProps = useRender.ComponentProps<"section">;
export function TasksPanelRoot({ className, render, ...props }: TasksPanelRootProps) {
  const theme = useThemeFamily();
  const { root } = tasksPanel({ theme });
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
  const theme = useThemeFamily();
  const { toolbar } = tasksPanel({ theme });
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

export type TasksPanelToolbarGroupProps = useRender.ComponentProps<"div">;
export function TasksPanelToolbarGroup({
  className,
  render,
  ...props
}: TasksPanelToolbarGroupProps) {
  const theme = useThemeFamily();
  const { toolbarGroup } = tasksPanel({ theme });
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

export type TasksPanelViewportProps = useRender.ComponentProps<"div">;
export function TasksPanelViewport({ className, render, ...props }: TasksPanelViewportProps) {
  const theme = useThemeFamily();
  const { viewport } = tasksPanel({ theme });
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
  const theme = useThemeFamily();
  const { empty } = tasksPanel({ theme });
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
