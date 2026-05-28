import { useState } from "react";
import type { Task, TaskStatus } from "../../store/taskStore";
import { useTaskStore } from "../../store/taskStore";
import { useAuthStore } from "../../store/authStore";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import InlineBadgeEditor from "../InlineBadgeEditor";
import { STATUS_STYLES, canEditTaskStatus, getTaskStatusOptions } from "./taskStatusUi";

export default function TaskCard({ task, onOpen, showChannelName = true }: {
  task: Task;
  onOpen: () => void;
  showChannelName?: boolean;
}) {
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const currentUser = useAuthStore((s) => s.user);
  const { capabilities } = useServerPermissions();
  const [editingStatus, setEditingStatus] = useState(false);
  const [busy, setBusy] = useState(false);
  const canManageServer = capabilities.manageServer;
  const canEditStatus = canEditTaskStatus(task, currentUser?.id, canManageServer);
  const statusOptions = getTaskStatusOptions(task, currentUser?.id, canManageServer);
  const style = STATUS_STYLES[task.status];

  const handleStatusSelect = async (id: string) => {
    const nextStatus = id as TaskStatus;
    if (nextStatus === task.status) {
      setEditingStatus(false);
      return;
    }
    setBusy(true);
    try {
      await updateTaskStatus(task.channelId, task.id, nextStatus);
      setEditingStatus(false);
    } catch (err) {
      console.error("Failed to update task status:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full border-2 border-black bg-white px-3 py-2.5 text-left shadow-brutal-sm transition-all duration-100 hover:-translate-y-[1px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-active">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {showChannelName && (
                <span className="text-xs font-bold text-black/60">
                  #{task.channelName || "unknown"}
                </span>
              )}
              <span className="text-[11px] font-mono text-black/35">#{task.taskNumber}</span>
              {task.isLegacy && (
                <span className="border border-black/30 px-1.5 py-0.5 text-[10px] font-bold text-black/50">
                  LEGACY
                </span>
              )}
            </div>
            <p className="line-clamp-3 break-words text-sm font-bold leading-5">{task.title}</p>
            {task.description && (
              <p className="mt-1 line-clamp-2 break-words text-xs text-black/70">
                {task.description}
              </p>
            )}

          </div>
        </div>
      </button>
      {canEditStatus && (
        <div className="mt-2 flex justify-end">
          <div className={`relative shrink-0 ${busy ? "pointer-events-none opacity-60" : ""}`}>
            <InlineBadgeEditor
              displayValue={style.label}
              selectedId={task.status}
              options={statusOptions}
              onSelect={handleStatusSelect}
              open={editingStatus}
              onToggle={() => setEditingStatus((prev) => !prev)}
              onRequestClose={() => setEditingStatus(false)}
              badgeClassName={style.bg}
              uppercase={false}
              dropdownMinWidth="min-w-[140px]"
              dropdownAlign="right"
              dropdownTestId="task-status-menu"
              optionTestIdPrefix="task-status-option"
            />
          </div>
        </div>
      )}
    </div>
  );
}
