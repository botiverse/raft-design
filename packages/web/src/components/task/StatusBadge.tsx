// Generic status badge — renders a `Badge` styled by the shared
// `STATUS_BADGE_CONFIG` for a given status. Used both for tasks (showing
// `task #N @assignee`) and for operation cards' "Done" state, so the
// letter spacing, icon, color, and sizing are guaranteed identical.
//
// Status badges opt out of the brutal uppercase contract because their
// children mix label content (`#N`, status name) with case-sensitive
// identifiers (`@assignee`). Uppercasing `@bugen` would break identity.
// stdrc msg=ce25da45 + msg=65681d15 (option B): only StatusBadge drops
// uppercase; label-only Badge / BadgeButton stay uppercase.
//
// Usage:
//   <StatusBadge status="done">Done</StatusBadge>
//   <StatusBadge status={task.status}>
//     <span className="shrink-0">#{task.taskNumber}</span>
//     {task.claimedByName ? <span className="min-w-0 truncate">@{task.claimedByName}</span> : null}
//   </StatusBadge>

import type { ReactNode } from "react";
import type { TaskStatus } from "../../store/taskStore";
import { Badge, type BadgeProps } from "../ui/Badge";
import { STATUS_BADGE_CONFIG } from "./taskStatusUi";

interface StatusBadgeProps extends Omit<BadgeProps, "className" | "children" | "uppercase"> {
  status: TaskStatus;
  /**
   * Inner badge contents — typically a label string or a small set of
   * `<span>`s. Renderers don't need to repeat the icon; this component
   * always emits the status icon at size 10 in front of children.
   */
  children?: ReactNode;
  /** Extra classes appended after the status background color. */
  className?: string;
  /** Override icon size (default 10) for one-off use cases. */
  iconSize?: number;
}

export function StatusBadge({
  status,
  children,
  className = "",
  iconSize = 10,
  ...rest
}: StatusBadgeProps) {
  const cfg = STATUS_BADGE_CONFIG[status] ?? STATUS_BADGE_CONFIG.todo;
  const Icon = cfg.icon;
  return (
    <Badge tone={cfg.tone} uppercase={false} className={className} data-status={status} {...rest}>
      <Icon size={iconSize} className="shrink-0" />
      {children}
    </Badge>
  );
}
