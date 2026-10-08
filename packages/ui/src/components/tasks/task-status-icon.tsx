import { Ban, CheckCircle, Circle, Eye, Play } from "lucide-react";
import type { ComponentType, CSSProperties, SVGProps } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { TaskStatusId } from "./task-status.recipe";

type TaskStatusSvgProps = SVGProps<SVGSVGElement>;
type TaskStatusIconComponent = ComponentType<TaskStatusSvgProps>;

/**
 * Raft's task-status icons are the app's familiar lucide set (the same glyphs
 * Slock used before the status colours moved into the token family). Colours
 * come from the shared `--task-status-*` tokens, never from a per-status SVG, so
 * the glyph and its surface can't drift apart. Lucide is already a dependency.
 */
const TASK_STATUS_ICONS: Record<TaskStatusId, TaskStatusIconComponent> = {
  todo: Circle,
  "in-progress": Play,
  "in-review": Eye,
  done: CheckCircle,
  closed: Ban,
};

/** Icon ink reads the SAME task-status tokens as the chip/badge/dot, so a
 *  status's icon colour can never drift from its surface colour. Brutal paints
 *  the icon with `currentColor` (it inherits the solid pastel badge text).
 *  Hoisted to a module-level table so the style object is stable across renders
 *  (an inline object literal would be re-created every render). */
const TASK_STATUS_ICON_STYLE: Record<TaskStatusId, CSSProperties> = {
  todo: { color: "var(--task-status-todo-strong)" },
  "in-progress": { color: "var(--task-status-in-progress-strong)" },
  "in-review": { color: "var(--task-status-in-review-strong)" },
  done: { color: "var(--task-status-done-strong)" },
  closed: { color: "var(--task-status-closed-strong)" },
};

function TaskStatusIconRoot({
  status,
  className,
  ...props
}: { status: TaskStatusId; className?: string } & SVGProps<SVGSVGElement>) {
  const theme = useThemeFamily();
  const Icon = TASK_STATUS_ICONS[status];
  return (
    <Icon
      aria-hidden
      data-slot="task-status-icon"
      data-status={status}
      className={className}
      // `currentColor` resolves from the CSS `color`; set it via style (the
      // SVG `color` attribute is not a CSS property and lucide's stroke would
      // fall back to black).
      style={theme === "brutal" ? undefined : TASK_STATUS_ICON_STYLE[status]}
      {...props}
    />
  );
}

export function TaskTodoIcon(props: SVGProps<SVGSVGElement>) {
  return <TaskStatusIconRoot status="todo" {...props} />;
}

export function TaskInProgressIcon(props: SVGProps<SVGSVGElement>) {
  return <TaskStatusIconRoot status="in-progress" {...props} />;
}

export function TaskInReviewIcon(props: SVGProps<SVGSVGElement>) {
  return <TaskStatusIconRoot status="in-review" {...props} />;
}

export function TaskDoneIcon(props: SVGProps<SVGSVGElement>) {
  return <TaskStatusIconRoot status="done" {...props} />;
}

export function TaskClosedIcon(props: SVGProps<SVGSVGElement>) {
  return <TaskStatusIconRoot status="closed" {...props} />;
}

export function TaskStatusIcon({
  status,
  className,
  ...props
}: { status: TaskStatusId; className?: string } & SVGProps<SVGSVGElement>) {
  return <TaskStatusIconRoot status={status} className={className} {...props} />;
}
