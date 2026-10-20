import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
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
      "rounded-chip border-0",
      "font-sans font-semibold text-foreground",
      "[&>svg:not([data-slot=task-status-icon])]:-mx-0.5 [&>svg[data-slot=task-status-icon]]:size-[9px]",
      "hover:brightness-100",
      "[a,button]:cursor-pointer [a,button]:hover:press-overlay [a,button]:active:press-overlay",
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
      default: { root: ["h-[22px] gap-1.5 py-0 pr-2 pl-1.5", "text-[12px] leading-4"] },
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
    // Inline (in a message) follows the message-reference rule: body text
    // size on the body baseline, the box made of the text's own line box plus
    // symmetric padding — no fixed height or nudge. Its colours are the task
    // chip's own: no background or border colour is set here, so the
    // per-status wash and border above apply.
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
      variant: "default",
      size: "sm",
      class: { root: ["h-5 gap-1 pr-1.5 pl-1"] },
    },
    {
      variant: "inline",
      status: ["todo", "in-progress", "in-review", "done", "closed"],
      class: { root: ["rounded-sticker border-0 pr-1.5 pl-[3px]", "font-semibold"] },
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
