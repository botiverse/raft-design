import { TaskChip, type TaskStatusId } from "raft-ui";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

const TASK_STATUSES = [
  { status: "todo", number: 16, label: "Todo" },
  { status: "in_progress", number: 205, label: "In Progress" },
  { status: "in_review", number: 340, label: "In Review" },
  { status: "done", number: 47, label: "Done" },
  { status: "closed", number: 480, label: "Closed" },
] as const satisfies readonly { status: TaskStatusId; number: number; label: string }[];

export function TaskChipUsageComposition() {
  return (
    <div className="flex w-full flex-col items-center gap-8 text-sm text-foreground">
      <p>
        Continue task{" "}
        <TaskChip status="in_progress" render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}>
          #205
        </TaskChip>{" "}
        before closing{" "}
        <TaskChip status="closed" render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}>
          #480
        </TaskChip>
        .
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {TASK_STATUSES.map(({ status, number, label }) => (
          <div key={status} className="flex flex-col items-center gap-3">
            <TaskChip status={status} render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}>
              #{number}
            </TaskChip>
            <span className="text-[12px] leading-[1.4] text-foreground-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
