import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";
import { TaskStatusIcon } from "./task-status-icon";
import { taskStatus, type TaskStatusId } from "./task-status.recipe";

const taskChip = tv({
  slots: {
    root: [
      "inline-flex max-w-full items-center gap-1.5 align-baseline overflow-hidden rounded-full border px-2 py-0 font-medium [font-size:inherit] leading-[1.4] tracking-normal whitespace-nowrap",
      "text-foreground-strong no-underline select-text",
      "transition-[filter,opacity] duration-100 hover:brightness-[0.96]",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
    ],
    status: ["inline-flex shrink-0 items-center justify-center", "[&>svg]:size-3"],
    label:
      "inline-flex min-w-0 items-center gap-1 truncate font-medium [font-size:inherit] leading-[1.4] tracking-normal",
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
    status: {
      todo: {},
      in_progress: {},
      in_review: {},
      done: {},
      closed: {},
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      status: ["todo", "in_progress", "in_review", "done", "closed"],
      class: {
        root: "gap-1 align-bottom rounded-none border-black px-1 py-0 text-[13px] font-medium leading-tight text-black hover:brightness-90",
        status: "[&>svg]:size-3",
        label: "text-[13px] font-medium leading-tight",
      },
    },
    {
      theme: "elegant",
      status: "todo",
      class: {
        root: "border-line-subtle bg-ink-4 text-foreground-strong",
      },
    },
    {
      theme: "elegant",
      status: "in_progress",
      class: {
        root: "border-primary-500 bg-primary-500/10 text-primary-800",
      },
    },
    {
      theme: "elegant",
      status: "in_review",
      class: {
        root: "border-warning-base bg-warning-base/10 text-warning-dark",
      },
    },
    {
      theme: "elegant",
      status: "done",
      class: {
        root: "border-success-base bg-success-base/10 text-success-dark",
      },
    },
    {
      theme: "elegant",
      status: "closed",
      class: {
        root: "border-line-subtle bg-ink-4 text-foreground-strong",
      },
    },
    {
      theme: "elegant",
      status: ["todo", "in_progress", "in_review", "done", "closed"],
      class: {
        root: "h-[19px] align-middle -mt-px text-[12px] font-[450] leading-none",
        label: "text-[12px] font-[450] leading-none",
      },
    },
  ],
});

export type TaskChipProps = useRender.ComponentProps<"span"> & {
  status: TaskStatusId;
  loading?: boolean;
};

export function TaskChip({
  status,
  loading = false,
  className,
  render,
  children,
  ...props
}: TaskChipProps) {
  const theme = useThemeFamily();
  const { root, status: statusSlot, label } = taskChip({ theme, status });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-chip",
    "data-inline-reference": "",
    "data-loading": loading ? "true" : undefined,
    className: cn(
      root({ className }),
      theme === "brutal" && taskStatus({ theme, status }),
      loading && "pointer-events-none opacity-60",
    ),
    children: (
      <>
        <span data-slot="task-chip-status" className={statusSlot()}>
          <TaskStatusIcon status={status} />
        </span>
        <span data-slot="task-chip-label" className={label()}>
          {children}
        </span>
      </>
    ),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "task-chip", status },
  });
}
