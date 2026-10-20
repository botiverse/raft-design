import { TaskChip, TaskInProgressIcon } from "@botiverse/raft-ui";

import { MESSAGE_EXAMPLE_HREFS } from "#/modules/message-item/message-item.fixtures.ts";

export function TaskChipVariantsComposition() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      {/* @docs-source-strip-start */}
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <TaskChip
          status="in-progress"
          render={<a aria-label="Open task #205" href={MESSAGE_EXAMPLE_HREFS.stateModelTask} />}
        >
          <TaskInProgressIcon />
          #205
        </TaskChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Default</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <TaskChip
          variant="inline"
          status="in-progress"
          render={<a aria-label="Open task #205" href={MESSAGE_EXAMPLE_HREFS.stateModelTask} />}
        >
          <TaskInProgressIcon />
          #205
        </TaskChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Inline</span>
      </div>
      {/* @docs-source-strip-end */}
    </div>
  );
}
