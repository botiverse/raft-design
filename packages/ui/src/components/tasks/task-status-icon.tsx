import type { ReactNode, SVGProps } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { TaskStatusId } from "./task-status.recipe";

type TaskStatusSvgProps = SVGProps<SVGSVGElement>;
type TaskStatusIconComponent = (props: TaskStatusSvgProps) => ReactNode;

/** Icon ink reads the SAME task-status tokens as the chip/badge/dot, so a
 *  status's icon colour can never drift from its surface colour. Brutal paints
 *  the icon with `currentColor` (it inherits the solid pastel badge text). */
const TASK_STATUS_ICON_COLORS: Record<TaskStatusId, string> = {
  todo: "var(--task-status-todo-strong)",
  "in-progress": "var(--task-status-in-progress-strong)",
  "in-review": "var(--task-status-in-review-strong)",
  done: "var(--task-status-done-strong)",
  closed: "var(--task-status-closed-strong)",
};

function TodoIcon(props: TaskStatusSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="1.2 1.2 21.6 21.6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    </svg>
  );
}

function InProgressIcon(props: TaskStatusSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="1.2 1.2 21.6 21.6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M12 3v18" />
      <path d="M12 14l7 -7" />
      <path d="M12 19l8.5 -8.5" />
      <path d="M12 9l4.5 -4.5" />
    </svg>
  );
}

function InReviewIcon(props: TaskStatusSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="1.2 1.2 21.6 21.6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    </svg>
  );
}

function DoneIcon(props: TaskStatusSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="1.2 1.2 21.6 21.6"
      fill="currentColor"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336z" />
      <path
        d="m8.5 12 2.5 2.5 4.5 -5"
        fill="none"
        stroke="var(--foreground-inverse)"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClosedIcon(props: TaskStatusSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="1.2 1.2 21.6 21.6"
      fill="currentColor"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336z" />
      <path
        d="m8.5 8.5 7 7m0 -7 -7 7"
        fill="none"
        stroke="var(--foreground-inverse)"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TASK_STATUS_ICONS: Record<TaskStatusId, TaskStatusIconComponent> = {
  todo: TodoIcon,
  "in-progress": InProgressIcon,
  "in-review": InReviewIcon,
  done: DoneIcon,
  closed: ClosedIcon,
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
      className={className}
      color={theme === "brutal" ? "currentColor" : TASK_STATUS_ICON_COLORS[status]}
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
