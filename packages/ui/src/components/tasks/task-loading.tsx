import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { taskLoading } from "./task-loading.recipe";

export type TaskLoadingListProps = useRender.ComponentProps<"div">;
export function TaskLoadingList({ className, render, ...props }: TaskLoadingListProps) {
  const theme = useThemeFamily();
  const { list } = taskLoading({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "task-loading-list",
    "aria-busy": true,
    className: list({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type TaskLoadingRowProps = useRender.ComponentProps<"div">;
export function TaskLoadingRow({ className, render, ...props }: TaskLoadingRowProps) {
  const theme = useThemeFamily();
  const { row } = taskLoading({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "task-loading-row",
    "aria-hidden": true,
    className: row({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}
