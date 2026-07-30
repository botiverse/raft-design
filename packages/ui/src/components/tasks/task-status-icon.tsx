import type { ReactNode, SVGProps } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { TaskStatusId } from "./task-status.recipe";

type TaskStatusSvgProps = SVGProps<SVGSVGElement>;
type TaskStatusIconComponent = (props: TaskStatusSvgProps) => ReactNode;

const TASK_STATUS_ICON_COLORS: Partial<Record<TaskStatusId, string>> = {
  todo: "var(--foreground-placeholder)",
  in_progress: "oklch(0.8 0.19 88.97)",
  in_review: "oklch(0.72 0.16 58)",
  done: "var(--state-success-base)",
  closed: "oklch(0.573 0 0)",
};

function TodoIcon(props: TaskStatusSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx={9} cy={9} r={7.25} />
    </svg>
  );
}

function InProgressIcon(props: TaskStatusSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx={9} cy={9} r={7.25} />
      <path d="M9 1.75V16.25" />
      <path d="M9 7L12.5 3.5" />
      <path d="M9 10.5L14.5 5" />
      <path d="M9 14.5L15.5 8" />
    </svg>
  );
}

function InReviewIcon(props: TaskStatusSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx={9} cy={9} r={7.25} />
      <circle cx={9} cy={9} r={1.25} fill="currentColor" stroke="none" />
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
      <circle cx={9} cy={9} r={7.5} />
      <path
        d="M5.75 9L8 11.25L12.25 7"
        fill="none"
        stroke="var(--foreground-inverse)"
        strokeWidth={1.25}
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
      <circle cx={9} cy={9} r={7.5} />
      <path
        d="M6.5 6.5L11.5 11.5M11.5 6.5L6.5 11.5"
        fill="none"
        stroke="var(--foreground-inverse)"
        strokeWidth={1.25}
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

export function TaskStatusIcon({
  status,
  className,
}: {
  status: TaskStatusId;
  className?: string;
}) {
  const theme = useThemeFamily();
  const Icon = TASK_STATUS_ICONS[status];
  return (
    <Icon
      aria-hidden
      data-slot="task-status-icon"
      className={className}
      color={theme === "brutal" ? "currentColor" : TASK_STATUS_ICON_COLORS[status]}
    />
  );
}
