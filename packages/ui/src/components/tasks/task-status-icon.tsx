import type { ReactNode, SVGProps } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { TaskStatusId } from "./task-status.recipe";

type TaskStatusSvgProps = SVGProps<SVGSVGElement>;
type TaskStatusIconComponent = (props: TaskStatusSvgProps) => ReactNode;

const TASK_STATUS_ICON_COLORS: Partial<Record<TaskStatusId, string>> = {
  todo: "var(--foreground-placeholder)",
  in_progress: "color-mix(in oklch, var(--primary-400) 92%, var(--ink))",
  in_review: "var(--state-warning-hover)",
  done: "var(--state-success-base)",
  closed: "oklch(0.573 0 0)",
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
      viewBox="0 0 24 24"
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
      viewBox="0 0 24 24"
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
  in_progress: InProgressIcon,
  in_review: InReviewIcon,
  done: DoneIcon,
  closed: ClosedIcon,
};

export function TaskStatusIcon({ status }: { status: TaskStatusId }) {
  const theme = useThemeFamily();
  const Icon = TASK_STATUS_ICONS[status];
  return (
    <Icon
      aria-hidden
      data-slot="task-status-icon"
      className={theme === "brutal" ? "hidden" : undefined}
      color={TASK_STATUS_ICON_COLORS[status]}
    />
  );
}
