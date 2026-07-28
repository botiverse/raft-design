import { TaskChip } from "raft-ui";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

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
        {/* @docs-source-strip-start */}
        <div className="flex flex-col items-center gap-3">
          {/* @docs-source-strip-end */}
          <TaskChip status="todo" render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}>
            #16
          </TaskChip>
          {/* @docs-source-strip-start */}
          <span className="text-[12px] leading-[1.4] text-foreground-muted">Todo</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          {/* @docs-source-strip-end */}
          <TaskChip
            status="in_progress"
            render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
          >
            #205
          </TaskChip>
          {/* @docs-source-strip-start */}
          <span className="text-[12px] leading-[1.4] text-foreground-muted">In Progress</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          {/* @docs-source-strip-end */}
          <TaskChip status="in_review" render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}>
            #340
          </TaskChip>
          {/* @docs-source-strip-start */}
          <span className="text-[12px] leading-[1.4] text-foreground-muted">In Review</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          {/* @docs-source-strip-end */}
          <TaskChip status="done" render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}>
            #47
          </TaskChip>
          {/* @docs-source-strip-start */}
          <span className="text-[12px] leading-[1.4] text-foreground-muted">Done</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          {/* @docs-source-strip-end */}
          <TaskChip status="closed" render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}>
            #480
          </TaskChip>
          {/* @docs-source-strip-start */}
          <span className="text-[12px] leading-[1.4] text-foreground-muted">Closed</span>
        </div>
        {/* @docs-source-strip-end */}
      </div>
    </div>
  );
}
