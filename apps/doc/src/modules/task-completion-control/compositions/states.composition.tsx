import { useState } from "react";
import { TaskCompletionControl } from "@botiverse/raft-ui/wip";

export function TaskCompletionControlStatesContent() {
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(true);
  return (
    <div className="flex items-center gap-6">
      <TaskCompletionControl
        checked={first}
        onCheckedChange={setFirst}
        aria-label="#25 Fix onboarding copy"
      />
      <TaskCompletionControl
        checked={second}
        onCheckedChange={setSecond}
        aria-label="#26 Write the release notes"
      />
      <TaskCompletionControl checked={false} disabled aria-label="#27 Update the pricing page" />
      <TaskCompletionControl checked disabled aria-label="#28 Archive the old roadmap" />
    </div>
  );
}
