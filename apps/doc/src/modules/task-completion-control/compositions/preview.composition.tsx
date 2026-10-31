import { useState } from "react";
import { TaskCompletionControl } from "@botiverse/raft-ui/wip";

export function TaskCompletionControlPreviewContent() {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center gap-2.5">
      <TaskCompletionControl
        checked={done}
        onCheckedChange={setDone}
        aria-label="#25 Fix onboarding copy"
      />
      <span className="font-mono text-mono-meta text-foreground-hint">#25</span>
      <span
        className={
          done ? "text-callout text-foreground-hint line-through" : "text-callout text-foreground"
        }
      >
        Fix onboarding copy
      </span>
    </div>
  );
}
