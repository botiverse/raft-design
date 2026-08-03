import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "../../lib/cn";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";
import { taskStatus, type TaskStatusId } from "./task-status.recipe";

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
      status: ["todo", "in-progress", "in-review", "done", "closed"],
      class: {
        root: "gap-1 align-bottom rounded-none border-black px-1 py-0 text-[13px] font-medium leading-tight text-black hover:brightness-90",
      },
    },
    {
      theme: "elegant",
      status: "todo",
      class: {
        root: "border-[color-mix(in_oklch,var(--line-muted)_75%,transparent)] bg-ink-4 text-foreground",
      },
    },
    {
      theme: "elegant",
      status: "in-progress",
      class: {
        root: "border-primary-500/75 bg-primary-500/10 text-primary-800",
      },
    },
    {
      theme: "elegant",
      status: "in-review",
      class: {
        root: "border-warning/75 bg-warning/10 text-warning-strong",
      },
    },
    {
      theme: "elegant",
      status: "done",
      class: {
        root: "border-success/75 bg-success/10 text-success-strong",
      },
    },
    {
      theme: "elegant",
      status: "closed",
      class: {
        root: "border-[color-mix(in_oklch,var(--line-muted)_75%,transparent)] bg-ink-4 text-foreground",
      },
    },
    {
      theme: "elegant",
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
    {
      variant: "inline",
      status: ["todo", "in-progress", "in-review", "done", "closed"],
      class: {
        root: [
          "h-[19px] align-middle -mt-px gap-1.5 rounded-full border-0 bg-fill-muted py-0 pr-2 pl-1",
          "text-[12px] font-[450] leading-none text-foreground-muted hover:brightness-100 [&>svg]:size-3",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "inline",
      status: ["todo", "in-progress", "in-review", "done", "closed"],
      class: {
        root: [
          "gap-1 align-bottom rounded-none border border-black px-1 py-0",
          "text-[13px] font-medium leading-tight text-black hover:brightness-90 [&>svg]:size-3",
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
      theme === "brutal" && taskStatus({ theme, status }),
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
