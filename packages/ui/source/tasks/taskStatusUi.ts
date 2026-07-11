import { Ban, CheckCircle, Circle, Eye, Play } from "lucide-react";
import type { ComponentType } from "react";
import type { BadgeProps } from "raft-ui";
import type { Task, TaskStatus } from "../../store/taskStore";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;
type BadgeAppearance = NonNullable<BadgeProps["appearance"]>;

// Source content stays Title Case — status pills sit next to case-sensitive
// identifiers (e.g. `task #N @assignee`) and uppercasing breaks identity.
// stdrc msg=ce25da45 + msg=65681d15 (option B): drop forced uppercase from
// status indicators specifically; label-only Badge instances elsewhere
// keep the brutal contract. Future non-brutal themes render this content
// natural-cased without a transform.
export interface TaskStatusUi {
  label: string;
  /**
   * Preserved for callsites that still apply the bg utility directly
   * (notably InlineBadgeEditor, which is not a Badge primitive callsite).
   */
  bg: string;
  variant: BadgeVariant;
  appearance: BadgeAppearance;
  icon: ComponentType<{ size?: number; className?: string }>;
}

export const TASK_STATUS_UI: Record<TaskStatus, TaskStatusUi> = {
  todo: {
    label: "Todo",
    bg: "bg-brutal-orange",
    variant: "warning",
    appearance: "solid",
    icon: Circle,
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-brutal-cyan",
    variant: "information",
    appearance: "solid",
    icon: Play,
  },
  in_review: {
    label: "In Review",
    bg: "bg-brutal-lavender",
    variant: "accent",
    appearance: "solid",
    icon: Eye,
  },
  done: {
    label: "Done",
    bg: "bg-brutal-lime",
    variant: "success",
    appearance: "solid",
    icon: CheckCircle,
  },
  // Closed = won't-do (cancelled / abandoned). Uses `brutal-stone`, the
  // warm neutral terminal-state token — semantically "exited / no longer
  // active", not "destructive". The earlier `brutal-red` was a category
  // collision: red is reserved for destructive irreversible actions
  // (Delete buttons, ConfirmDialog destructive confirm), but `closed`
  // is reversible (`closed → todo` is a valid transition below) and
  // operating it on a task isn't dangerous. Joy designed `brutal-stone`
  // for this semantic slot — see `--color-brutal-stone` in index.css.
  // #proj-uiux task #145 (daily UI audit Finding 1, stdrc-approved
  // 2026-05-08, Joy spec'd, Bugen implemented).
  closed: {
    label: "Closed",
    bg: "bg-brutal-stone",
    variant: "muted",
    appearance: "solid",
    icon: Ban,
  },
};

/**
 * Back-compat alias for task list/card callsites that still apply the bg
 * utility directly. Keep it as a typed view over TASK_STATUS_UI, not a second
 * source of truth.
 */
export const STATUS_STYLES: Record<TaskStatus, { bg: string; label: string }> = TASK_STATUS_UI;

/**
 * Shared per-status badge config for the message-side task badge in MessageItem.
 * Both the header (inline) and below-content (thread-root) variants render off
 * TASK_STATUS_UI so adding a new status — or recoloring an existing one — only
 * requires one edit.
 *
 * eric 2026-05-08 #proj-uiux:c697be7a (task #141) — before this map was
 * extracted, the below-content variant had its own inline 4-entry config
 * (todo / in_progress / in_review / done) that silently fell back to
 * `statusConfig.todo` for `closed`. That fallback made a closed task in the
 * thread panel header render with the orange/Circle TODO styling even
 * though `data-task-status="closed"` updated correctly — the perceived
 * "thread badge didn't update" repro from the original task #141 report.
 *
 * `closed` uses `bg-brutal-stone` (NOT `bg-brutal-red`) per #proj-uiux task
 * #145 / PR #1464. See TASK_STATUS_UI.closed for the full rationale.
 */
export type StatusBadgeConfig = Pick<TaskStatusUi, "appearance" | "bg" | "icon" | "variant">;
export const STATUS_BADGE_CONFIG: Record<TaskStatus, StatusBadgeConfig> = TASK_STATUS_UI;

// Mirror of taskService.VALID_TRANSITIONS — kept in sync so the menu only
// surfaces server-allowed transitions.
const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ["in_progress", "closed"],
  in_progress: ["in_review", "done", "closed"],
  in_review: ["done", "in_progress", "closed"],
  done: ["todo", "in_progress", "in_review", "closed"],
  closed: ["todo"],
};

export function canEditTaskStatus(task: Task, currentUserId: string | undefined, canManageServer: boolean): boolean {
  const isAssignedToMe = task.claimedByType === "user" && task.claimedById === currentUserId;
  const isReviewApproval = task.status === "in_review";
  return canManageServer || isAssignedToMe || isReviewApproval;
}

export function getTaskStatusOptions(task: Task, currentUserId: string | undefined, canManageServer: boolean) {
  const current = task.status;
  const isAssignedToMe = task.claimedByType === "user" && task.claimedById === currentUserId;
  const isReviewApproval = current === "in_review";

  let allowed: TaskStatus[] = [current];

  if (canManageServer) {
    allowed = ["todo", "in_progress", "in_review", "done", "closed"];
  } else if (isAssignedToMe) {
    allowed = [current, ...VALID_TRANSITIONS[current]];
  } else if (isReviewApproval) {
    allowed = [current, "done"];
  }

  return allowed.map((status) => ({ id: status, label: TASK_STATUS_UI[status].label }));
}
