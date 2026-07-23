import { Pencil } from "lucide-react";
import type { ReactNode } from "react";

import {
  TASK_FIXTURES,
  TASK_STATUS_BACKGROUNDS,
  TASK_STATUSES,
  type TaskFixture,
} from "./task-card.fixtures";

export function TaskCardSourceComparisonComposition() {
  return (
    <div className="w-full max-w-sm">
      <SourceTaskCard task={TASK_FIXTURES[0]} showChannelName />
    </div>
  );
}

export function TaskCardPanelSourceComparisonComposition() {
  return (
    <TaskCardPanelFrame>
      <TaskCardSourceComparisonComposition />
    </TaskCardPanelFrame>
  );
}

function TaskCardPanelFrame({ children }: { children: ReactNode }) {
  return (
    <section className="w-full max-w-md border-2 border-black bg-white p-4 text-black">
      <header className="mb-4 border-b-2 border-black pb-2 font-bold">Channel tasks</header>
      {children}
    </section>
  );
}

export function SourceTaskCard({
  task,
  showChannelName = false,
}: {
  task: TaskFixture;
  showChannelName?: boolean;
}) {
  return (
    <div className="w-full border-2 border-black bg-white px-3 py-2.5 text-left shadow-sm">
      <div className="w-full text-left">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {showChannelName ? (
                <span className="text-xs font-bold text-black/60">#{task.channelName}</span>
              ) : null}
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
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          disabled
          title="Read-only source fixture"
          className={`mt-0.5 inline-flex cursor-default items-center gap-1 border-2 border-black px-2 py-0.5 text-xs font-bold ${TASK_STATUS_BACKGROUNDS[task.status]}`}
        >
          {TASK_STATUSES.find((status) => status.id === task.status)?.label}
          <Pencil size={10} className="opacity-40" />
        </button>
      </div>
    </div>
  );
}
