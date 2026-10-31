import type { CSSProperties, SVGProps } from "react";
import type { TaskStatusId } from "./task-status.recipe";

/** Raft draws every status as its pixel: a 10px square in the status colour
 *  with a 1.5px sticker-ink edge (2px outer radius), the size of every status
 *  light beside text (status.md#sizes). The square keeps its size
 *  and sits centred in whatever box the context gives the icon, so an icon
 *  slot sized for a glyph still shows the same pixel.
 *
 *  Backlog's pixel is hollow: the same square and edge with nothing inside,
 *  since Backlog has no colour. Its edge is `line-strong`, not sticker-ink:
 *  sticker-ink is dark in dark mode and, with no fill inside it, would vanish
 *  on the dark canvas (design/foundations/color.md#statuses). */
const TASK_STATUS_PIXEL_STYLE: Record<TaskStatusId, CSSProperties> = {
  backlog: { fill: "none", stroke: "var(--line-strong)" },
  todo: { fill: "var(--task-status-todo)", stroke: "var(--sticker-ink)" },
  "in-progress": { fill: "var(--task-status-in-progress)", stroke: "var(--sticker-ink)" },
  "in-review": { fill: "var(--task-status-in-review)", stroke: "var(--sticker-ink)" },
  done: { fill: "var(--task-status-done)", stroke: "var(--sticker-ink)" },
  closed: { fill: "var(--task-status-closed)", stroke: "var(--sticker-ink)" },
};

function TaskStatusPixel({
  status,
  className,
  ...props
}: { status: TaskStatusId; className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      data-slot="task-status-icon"
      data-status={status}
      width="10"
      height="10"
      overflow="visible"
      className={className}
      {...props}
    >
      <rect
        x="50%"
        y="50%"
        width="8.5"
        height="8.5"
        rx="1.25"
        strokeWidth="1.5"
        transform="translate(-4.25 -4.25)"
        style={TASK_STATUS_PIXEL_STYLE[status]}
      />
    </svg>
  );
}

export function TaskBacklogIcon(props: SVGProps<SVGSVGElement>) {
  return <TaskStatusPixel status="backlog" {...props} />;
}

export function TaskTodoIcon(props: SVGProps<SVGSVGElement>) {
  return <TaskStatusPixel status="todo" {...props} />;
}

export function TaskInProgressIcon(props: SVGProps<SVGSVGElement>) {
  return <TaskStatusPixel status="in-progress" {...props} />;
}

export function TaskInReviewIcon(props: SVGProps<SVGSVGElement>) {
  return <TaskStatusPixel status="in-review" {...props} />;
}

export function TaskDoneIcon(props: SVGProps<SVGSVGElement>) {
  return <TaskStatusPixel status="done" {...props} />;
}

export function TaskClosedIcon(props: SVGProps<SVGSVGElement>) {
  return <TaskStatusPixel status="closed" {...props} />;
}

export function TaskStatusIcon({
  status,
  className,
  ...props
}: { status: TaskStatusId; className?: string } & SVGProps<SVGSVGElement>) {
  return <TaskStatusPixel status={status} className={className} {...props} />;
}
