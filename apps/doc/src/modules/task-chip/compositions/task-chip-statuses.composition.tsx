import {
  TaskChip,
  TaskClosedIcon,
  TaskDoneIcon,
  TaskInProgressIcon,
  TaskInReviewIcon,
  TaskTodoIcon,
} from "@botiverse/raft-ui";
import { MESSAGE_EXAMPLE_HREFS } from "#/modules/message-item/message-item.fixtures.ts";

export function TaskChipStatusesComposition() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {/* @docs-source-strip-start */}
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <TaskChip status="todo" render={<a href={MESSAGE_EXAMPLE_HREFS.stateModelTask} />}>
          <TaskTodoIcon />
          #16
        </TaskChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Todo</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <TaskChip status="in-progress" render={<a href={MESSAGE_EXAMPLE_HREFS.stateModelTask} />}>
          <TaskInProgressIcon />
          #205
        </TaskChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">In Progress</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <TaskChip status="in-review" render={<a href={MESSAGE_EXAMPLE_HREFS.stateModelTask} />}>
          <TaskInReviewIcon />
          #340
        </TaskChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">In Review</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <TaskChip status="done" render={<a href={MESSAGE_EXAMPLE_HREFS.stateModelTask} />}>
          <TaskDoneIcon />
          #47
        </TaskChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Done</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <TaskChip status="closed" render={<a href={MESSAGE_EXAMPLE_HREFS.stateModelTask} />}>
          <TaskClosedIcon />
          #480
        </TaskChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Closed</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <TaskChip status="in-progress" loading title="Resolving task #512">
          <TaskInProgressIcon />
          #512
        </TaskChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Loading</span>
      </div>
      {/* @docs-source-strip-end */}
    </div>
  );
}
