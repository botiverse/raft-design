import { Ban, CheckCircle, Circle, Eye, Play } from "lucide-react";
import type { ComponentType } from "react";
import type { Task, TaskStatus } from "../../store/taskStore";
import { BADGE_TONE_CLASSES, type BadgeTone } from "../ui/Badge";

// Source content stays Title Case — status pills sit next to case-sensitive
// identifiers (e.g. `task #N @assignee`) and uppercasing breaks identity.
// stdrc msg=ce25da45 + msg=65681d15 (option B): drop forced uppercase from
// status indicators specifically; label-only Badge / BadgeButton elsewhere
// keep the brutal contract. Future non-brutal themes render this content
// natural-cased without a transform.
export const STATUS_STYLES: Record<TaskStatus, { bg: string; label: string }> = {
  todo: { bg: "bg-brutal-orange", label: "Todo" },
  in_progress: { bg: "bg-brutal-cyan", label: "In Progress" },
  in_review: { bg: "bg-brutal-lavender", label: "In Review" },
  done: { bg: "bg-brutal-lime", label: "Done" },
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
  closed: { bg: "bg-brutal-stone", label: "Closed" },
};

/**
 * Shared per-status badge config (background + icon) for the message-side
 * task badge in MessageItem. Both the header (inline) and below-content
 * (thread-root) variants render off this single map so adding a new status
 * — or recoloring an existing one — only requires one edit.
 *
 * eric 2026-05-08 #proj-uiux:c697be7a (task #141) — before this map was
 * extracted, the below-content variant had its own inline 4-entry config
 * (todo / in_progress / in_review / done) that silently fell back to
 * `statusConfig.todo` for `closed`. That fallback made a closed task in the
 * thread panel header render with the orange/Circle TODO styling even
 * though `data-task-status="closed"` updated correctly — the perceived
 * "thread badge didn't update" repro from the original task #141 report.
 *
 * `closed` uses `bg-brutal-stone` (NOT `bg-brutal-red`) per #proj-uiux
 * task #145 / PR #1464 — red is reserved for destructive irreversible
 * actions; closed is a reversible terminal state. STATUS_STYLES above and
 * STATUS_BADGE_CONFIG must stay in lockstep for the same color slot;
 * see the comment on STATUS_STYLES.closed for the full rationale.
 */
export interface StatusBadgeConfig {
  tone: BadgeTone;
  /**
   * `bg` is derived from `tone` (single source of truth) — preserved
   * here for callsites that still apply the bg utility directly
   * (notably `InlineBadgeEditor.badgeClassName`, which doesn't yet
   * wrap BadgeButton). Migrate those to `tone` and this field can
   * disappear.
   */
  bg: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

function entry(tone: BadgeTone, icon: StatusBadgeConfig["icon"]): StatusBadgeConfig {
  return { tone, bg: BADGE_TONE_CLASSES[tone].split(" ")[0]!, icon };
}

export const STATUS_BADGE_CONFIG: Record<TaskStatus, StatusBadgeConfig> = {
  todo: entry("orange", Circle),
  in_progress: entry("cyan", Play),
  in_review: entry("lavender", Eye),
  done: entry("lime", CheckCircle),
  closed: entry("stone", Ban),
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
  closed: "Closed",
};

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

  return allowed.map((status) => ({ id: status, label: STATUS_LABELS[status] }));
}
