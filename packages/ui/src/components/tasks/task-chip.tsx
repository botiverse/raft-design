import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";
import { TaskStatusIcon } from "./task-status-icon";
import type { TaskStatusId } from "./task-status.recipe";

const taskChip = tv({
  slots: {
    root: [
      "inline-flex max-w-full items-center gap-1.5 align-baseline overflow-hidden rounded-full border px-2 py-0 font-normal [font-size:inherit] leading-[1.4] tracking-normal whitespace-nowrap",
      "text-foreground-strong no-underline select-text",
      "transition-[filter,opacity] duration-100 hover:brightness-[0.96]",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
    ],
    status: ["inline-flex shrink-0 items-center justify-center", "[&>svg]:size-3"],
    label: "min-w-0 truncate font-normal [font-size:inherit] leading-[1.4] tracking-normal",
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
      status: "todo",
      class: { root: "border-black bg-black/10" },
    },
    {
      theme: "brutal",
      status: "in_progress",
      class: { root: "border-brutal-cyan bg-brutal-cyan/10" },
    },
    {
      theme: "brutal",
      status: "in_review",
      class: { root: "border-brutal-lavender bg-brutal-lavender/10" },
    },
    {
      theme: "brutal",
      status: "done",
      class: { root: "border-brutal-lime bg-brutal-lime/10" },
    },
    {
      theme: "brutal",
      status: "closed",
      class: { root: "border-brutal-stone bg-brutal-stone/10" },
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
        root: "h-[19px] align-middle -mt-px text-[13px] leading-none",
        label: "text-[13px] leading-none",
      },
    },
  ],
});

export type TaskChipProps = useRender.ComponentProps<"span"> & {
  status: TaskStatusId;
};

export function TaskChip({ status, className, render, children, ...props }: TaskChipProps) {
  const theme = useThemeFamily();
  const { root, status: statusSlot, label } = taskChip({ theme, status });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-chip",
    className: root({ className }),
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
