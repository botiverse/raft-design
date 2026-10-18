import { Badge, TaskChip, TaskInProgressIcon } from "raft-ui";

export function TaskChipSizesComposition() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* @docs-source-strip-start */}
      <div className="flex items-center gap-1.5">
        {/* @docs-source-strip-end */}
        <TaskChip status="in-progress">
          <TaskInProgressIcon />
          #746 @Martin
        </TaskChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Default</span>
      </div>
      {/* @docs-source-strip-end */}
      <div className="flex items-center gap-1.5">
        <TaskChip status="in-progress" size="sm">
          <TaskInProgressIcon />
          #746 @Martin
        </TaskChip>
        <Badge appearance="outline" variant="muted">
          12 replies
        </Badge>
        <Badge variant="accent">1 new</Badge>
      </div>
    </div>
  );
}
