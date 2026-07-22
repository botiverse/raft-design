import { Pencil } from "lucide-react";
import { useState } from "react";

import {
  TASK_FIXTURES,
  TASK_STATUSES,
  type TaskFixture,
  type TaskStatus,
} from "./task-card.fixtures";

export const STATUS_BACKGROUNDS: Record<TaskStatus, string> = {
  todo: "bg-brutal-orange",
  in_progress: "bg-brutal-cyan",
  in_review: "bg-brutal-lavender",
  done: "bg-brutal-lime",
  closed: "bg-brutal-stone",
};

export function TaskCardSourceComparisonComposition() {
  const [notice, setNotice] = useState("Interact with the source card.");

  return (
    <div className="grid w-full max-w-sm gap-3">
      <SourceTaskCard task={TASK_FIXTURES[0]} onAction={setNotice} />
      <p className="text-sm text-black/60" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}

export function SourceTaskCard({
  task,
  onAction,
}: {
  task: TaskFixture;
  onAction: (notice: string) => void;
}) {
  return (
    <div className="w-full border-2 border-black bg-white px-3 py-2.5 text-left shadow-sm transition-all duration-100 hover:-translate-y-[1px] hover:shadow-md active:translate-x-[1px] active:translate-y-[1px] active:shadow-xs">
      <button
        type="button"
        onClick={() => onAction(`Opened source task #${task.taskNumber}`)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-black/35">#{task.taskNumber}</span>
              {task.isLegacy ? (
                <span className="border border-black/30 px-1.5 py-0.5 text-[10px] font-bold text-black/50">
                  LEGACY
                </span>
              ) : null}
            </div>
            <p className="line-clamp-3 break-words text-sm leading-5 font-bold">{task.title}</p>
            {task.description ? (
              <p className="mt-1 line-clamp-2 break-words text-xs text-black/70">
                {task.description}
              </p>
            ) : null}
          </div>
        </div>
      </button>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => onAction(`Status source control for task #${task.taskNumber}`)}
          className={`mt-0.5 inline-flex items-center gap-1 border-2 border-black px-2 py-0.5 text-xs font-bold transition-[filter,opacity] duration-100 hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_BACKGROUNDS[task.status]}`}
        >
          {TASK_STATUSES.find((status) => status.id === task.status)?.label}
          <Pencil size={10} className="opacity-40" />
        </button>
      </div>
    </div>
  );
}
