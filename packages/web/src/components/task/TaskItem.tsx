import { useState } from "react";
import { UserPlus, UserMinus, Trash2, ChevronRight, MessageSquare } from "lucide-react";
import type { Task, TaskStatus } from "../../store/taskStore";
import { useTaskStore } from "../../store/taskStore";
import { useAuthStore } from "../../store/authStore";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import { useTimeFormatter } from "../../hooks/useTimeFormatter";
import InlineBadgeEditor from "../InlineBadgeEditor";
import ConfirmDialog from "../ConfirmDialog";
import { STATUS_STYLES, canEditTaskStatus, getTaskStatusOptions } from "./taskStatusUi";

export default function TaskItem({ task, channelId }: { task: Task; channelId: string }) {
  const claimTask = useTaskStore((s) => s.claimTask);
  const unclaimTask = useTaskStore((s) => s.unclaimTask);
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const currentUser = useAuthStore((s) => s.user);
  const { capabilities } = useServerPermissions();
  const { formatShortDateTime } = useTimeFormatter();
  const [busy, setBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);

  const style = STATUS_STYLES[task.status];
  const isLegacy = !!task.isLegacy;
  const isAssignedToMe = task.claimedByType === "user" && task.claimedById === currentUser?.id;
  const isMyTask = task.createdByType === "user" && task.createdById === currentUser?.id;
  const canManageServer = capabilities.manageServer;
  const isAssigned = !!task.claimedById;
  const canEditStatus = canEditTaskStatus(task, currentUser?.id, canManageServer);
  const statusOptions = getTaskStatusOptions(task, currentUser?.id, canManageServer);

  const action = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      console.error("Task action failed:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-2 border-black bg-white shadow-brutal-sm transition-all duration-100 hover:-translate-y-[1px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-active">
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0"
        >
          <ChevronRight
            size={12}
            className={`transition-transform text-black/40 ${expanded ? "rotate-90" : ""}`}
          />
        </button>
        <span className="shrink-0 text-xs font-bold font-mono text-black/40">
          #{task.taskNumber}
        </span>
        <span className={`shrink-0 border border-black px-1 py-0.5 text-[10px] font-bold leading-none ${style.bg}`}>
          {style.label}
        </span>
        {task.isLegacy && (
          <span className="shrink-0 border border-black/30 px-1 py-0.5 text-[10px] font-bold leading-none text-black/40 bg-white">
            LEGACY
          </span>
        )}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-left min-w-0"
        >
          <span className={`block text-sm font-medium ${expanded ? "whitespace-pre-wrap break-words" : "truncate"} ${task.status === "done" ? "line-through text-black/40" : "text-black"}`}>
            {task.title}
          </span>
        </button>
        {task.claimedByName && (
          <span className="shrink-0 text-xs text-black/40 font-mono truncate max-w-[80px]">
            @{task.claimedByName}
          </span>
        )}
        <div className="shrink-0 flex items-center gap-1">
          {/* Claim — when not assigned and not done */}
          {!isAssigned && task.status !== "done" && (
            <button
              onClick={() => action(() => claimTask(channelId, task.id))}
              disabled={busy}
              className="btn-brutal-sm p-1 bg-brutal-cyan"
              title="Claim"
            >
              <UserPlus size={12} />
            </button>
          )}
          {/* Unclaim — when assigned to me and not done */}
          {isAssignedToMe && task.status !== "done" && (
            <button
              onClick={() => action(() => unclaimTask(channelId, task.id))}
              disabled={busy}
              className="btn-brutal-sm p-1 bg-white"
              title="Unclaim"
            >
              <UserMinus size={12} />
            </button>
          )}
          {/* Delete — always last */}
          {(isMyTask || canManageServer) && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={busy}
              className="btn-brutal-sm p-1 bg-white"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-black/10 px-3 py-2 space-y-1.5">
          {task.description && (
            <p className="text-sm text-black/70 whitespace-pre-wrap break-words">
              {task.description}
            </p>
          )}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs font-mono text-black/40">
              {task.createdByName && (
                <span>created by @{task.createdByName} {formatShortDateTime(task.createdAt)}</span>
              )}
              {task.claimedByName && task.claimedAt && (
                <span>assigned to @{task.claimedByName} {formatShortDateTime(task.claimedAt)}</span>
              )}
              {task.completedAt && (
                <span>done {formatShortDateTime(task.completedAt)}</span>
              )}
            </div>
            {/* Status editor — right side */}
            {canEditStatus && (
              <div className="relative shrink-0">
                <InlineBadgeEditor
                  displayValue={style.label}
                  selectedId={task.status}
                  options={statusOptions}
                  onSelect={async (id) => {
                    const newStatus = id as TaskStatus;
                    if (newStatus !== task.status) {
                      await action(() => updateTaskStatus(channelId, task.id, newStatus));
                    }
                    setEditingStatus(false);
                  }}
                  open={editingStatus}
                  onToggle={() => setEditingStatus(!editingStatus)}
                  onRequestClose={() => setEditingStatus(false)}
                  badgeClassName={style.bg}
                  uppercase={false}
                  dropdownMinWidth="min-w-[140px]"
                  dropdownAlign="right"
                  dropdownTestId="task-status-menu"
                  optionTestIdPrefix="task-status-option"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Task"
          message={`Delete task #${task.taskNumber} "${task.title}"? This cannot be undone.`}
          confirmLabel="Delete Task"
          loadingLabel="Deleting…"
          onConfirm={() => deleteTask(channelId, task.id)}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
