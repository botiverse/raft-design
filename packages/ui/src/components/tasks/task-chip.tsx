import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";
import { taskStatus } from "./task-status.recipe";
import type { TaskStatusId } from "./task-status.recipe";

export type TaskChipVariant = "default" | "inline";

const taskChip = tv({
  slots: {
    root: [
      "inline-flex max-w-full items-center gap-1.5 align-baseline overflow-hidden rounded-full border px-2 py-0 font-medium [font-size:inherit] leading-[1.4] tracking-normal whitespace-nowrap",
      "[&>svg]:shrink-0 [&>svg]:size-3",
      "text-foreground no-underline select-text",
      "transition-[filter,opacity] duration-100 hover:brightness-[0.96]",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
    ],
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
    status: {
      todo: {},
      "in-progress": {},
      "in-review": {},
      done: {},
      closed: {},
    },
    variant: {
      default: {},
      inline: {},
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      variant: "default",
      status: ["todo", "in-progress", "in-review", "done", "closed"],
      class: {
        root: "gap-1 align-bottom rounded-none border-black px-1 py-0 text-[13px] font-medium leading-tight text-black hover:brightness-90",
      },
    },
    {
      theme: "elegant",
      status: "todo",
      class: {
        root: "border-[color-mix(in_oklch,var(--task-status-todo-strong)_35%,transparent)] bg-task-status-todo-soft text-task-status-todo-strong",
      },
    },
    {
      theme: "elegant",
      status: "in-progress",
      class: {
        root: "border-[color-mix(in_oklch,var(--task-status-in-progress-strong)_35%,transparent)] bg-task-status-in-progress-soft text-task-status-in-progress-strong",
      },
    },
    {
      theme: "elegant",
      status: "in-review",
      class: {
        root: "border-[color-mix(in_oklch,var(--task-status-in-review-strong)_35%,transparent)] bg-task-status-in-review-soft text-task-status-in-review-strong",
      },
    },
    {
      theme: "elegant",
      status: "done",
      class: {
        root: "border-[color-mix(in_oklch,var(--task-status-done-strong)_35%,transparent)] bg-task-status-done-soft text-task-status-done-strong",
      },
    },
    {
      theme: "elegant",
      status: "closed",
      class: {
        root: "border-[color-mix(in_oklch,var(--task-status-closed-strong)_35%,transparent)] bg-task-status-closed-soft text-task-status-closed-strong",
      },
    },
    {
      theme: "elegant",
      variant: "default",
      status: ["todo", "in-progress", "in-review", "done", "closed"],
      class: {
        root: ["h-[19px] align-middle -mt-px gap-1.5 text-[13px] font-normal leading-none"],
      },
    },
    {
      theme: "elegant",
      variant: "default",
      status: ["todo", "in-progress", "in-review", "done", "closed"],
      class: { root: "border-[0.5px]" },
    },
    // Inline (in a message) follows the message-reference rule (#proj-rui
    // task #84): body text size on the body baseline, the box made of the
    // text's own line box plus symmetric padding — no fixed height or nudge.
    // Its colours are the task chip's own: no background or border colour is
    // set here, so the per-status wash and border above apply (Artea,
    // #proj-frontend task #739 — the inline chip had a neutral grey fill).
    {
      variant: "inline",
      status: ["todo", "in-progress", "in-review", "done", "closed"],
      class: {
        root: [
          "items-baseline gap-1.5 rounded-full border py-0 pr-2 pl-1 align-baseline",
          // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
          "[font-size:inherit] leading-[1.2em] font-[450] hover:brightness-100",
          "[&>svg]:size-[0.857em] [&>svg]:self-center",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "inline",
      status: ["todo", "in-progress", "in-review", "done", "closed"],
      class: {
        root: [
          "gap-1 rounded-none border border-black px-1",
          "font-medium text-black hover:brightness-90",
        ],
      },
    },
  ],
  defaultVariants: {
    variant: "default",
  },
});

export type TaskChipProps = useRender.ComponentProps<"span"> & {
  status: TaskStatusId;
  loading?: boolean;
  variant?: TaskChipVariant;
};

export function TaskChip({
  status,
  loading = false,
  variant = "default",
  className,
  render,
  children,
  ...props
}: TaskChipProps) {
  const theme = useThemeFamily();
  const { root } = taskChip({ theme, status, variant });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-chip",
    "data-inline-reference": "",
    "data-loading": loading ? "true" : undefined,
    className: cn(
      root({ className }),
      // Brutal fills with the solid pastel; elegant takes the soft wash +
      // strong ink from its compoundVariants below (both read the same
      // task-status tokens).
      theme === "brutal" && taskStatus({ status }),
      loading && "pointer-events-none opacity-60",
    ),
    children,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "task-chip", status },
  });
}
