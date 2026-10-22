import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
import { inlineChip } from "../../lib/inline-chip";
import { tv } from "../../lib/tv";
import type { SlotElementProps } from "../../lib/data-attributes";
import type { TaskStatusId } from "./task-status.recipe";

export type TaskChipVariant = "default" | "inline";
export type TaskChipSize = "default" | "sm";

const taskChip = tv({
  slots: {
    root: [
      "inline-flex max-w-full items-center gap-1.5 align-baseline overflow-hidden px-2 py-0 [font-size:inherit] leading-[1.4] tracking-normal whitespace-nowrap",
      "[&>svg]:shrink-0 [&>svg]:size-3",
      "no-underline select-text",
      "transition-[filter,opacity] duration-100",
      "focus-visible:keyboard:outline-2 focus-visible:keyboard:outline-offset-2 focus-visible:keyboard:outline-line-strong",
      "border-0",
      "font-sans font-semibold text-foreground",
      "[&>svg:not([data-slot=task-status-icon])]:-mx-0.5 [&>svg[data-slot=task-status-icon]]:size-2.5",
      "[a,button]:cursor-pointer [a,button]:hover:overlay-medium [a,button]:active:overlay-medium",
      "focus-visible:outline-none focus-visible:shadow-focus",
    ],
  },
  variants: {
    status: {
      todo: { root: ["bg-task-status-todo-soft"] },
      "in-progress": { root: ["bg-task-status-in-progress-soft"] },
      "in-review": { root: ["bg-task-status-in-review-soft"] },
      done: { root: ["bg-task-status-done-soft"] },
      closed: { root: ["bg-task-status-closed-soft"] },
    },
    variant: {
      default: { root: ["h-[22px] gap-1.5 rounded-chip px-[7px] py-0", "text-[12px] leading-4"] },
      inline: {},
    },
    // `sm` matches the Badges it sits beside: in the Activity card metadata
    // row the chip shares a line with reply-count / mention / unread Badges,
    // and the default chip's 13px text reads one size too big there. Only the standalone (`default`) variant
    // has a size; the inline chip follows the surrounding text.
    size: {
      default: {},
      sm: {},
    },
  },
  compoundVariants: [
    // Inline (in a message) is an inline chip, the box a reference chip has
    // (lib/inline-chip.ts, message-item.md, Chips in running text). The status
    // pixel keeps its own 10px box: it is drawn to its edges, so the chip takes
    // 4.5px at each end and 4px from the pixel to the text, and the ink at both
    // ends sits equally far in (alignment.md, Chips). Its colours are the task
    // chip's own: the per-status tint above applies.
    {
      variant: "inline",
      status: ["todo", "in-progress", "in-review", "done", "closed"],
      class: {
        root: [
          ...inlineChip,
          "[&>svg]:size-3.5 [&>svg]:self-center [&>svg:not([data-slot=task-status-icon])]:mx-0",
        ],
      },
    },
    {
      variant: "default",
      size: "sm",
      class: { root: ["h-5 gap-1 px-[5px]"] },
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type TaskChipProps = useRender.ComponentProps<"span"> & {
  status: TaskStatusId;
  loading?: boolean;
  variant?: TaskChipVariant;
  /** `sm` lines the chip up with an `sm` Badge in the same row. */
  size?: TaskChipSize;
};

export function TaskChip({
  status,
  loading = false,
  variant = "default",
  size = "default",
  className,
  render,
  children,
  ...props
}: TaskChipProps) {
  const { root } = taskChip({ status, variant, size });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "task-chip",
    "data-inline-reference": "",
    "data-loading": loading ? "true" : undefined,
    className: cn(root({ className }), loading && "pointer-events-none opacity-60"),
    children,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "task-chip", status },
  });
}
