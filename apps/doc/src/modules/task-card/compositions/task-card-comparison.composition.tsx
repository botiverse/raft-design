import { useRef, useState } from "react";

import { TaskCardComposition } from "./task-card.composition";
import { TASK_FIXTURES } from "../task-card.fixtures";

export function TaskCardComparisonComposition({
  showNotice = true,
  showChannelName = false,
}: { showNotice?: boolean; showChannelName?: boolean } = {}) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState("Interact with the current card.");
  const task = TASK_FIXTURES[0];

  return (
    <div className="relative w-full max-w-sm">
      <div className="grid gap-3">
        <TaskCardComposition
          task={task}
          onOpen={(nextTask) => setNotice(`Opened task #${nextTask.taskNumber}`)}
          onStatusChange={(_, status) => setNotice(`Selected ${status}`)}
          portalRef={portalRef}
          showChannelName={showChannelName}
        />
        {showNotice ? (
          <p className="text-sm text-foreground-muted" aria-live="polite">
            {notice}
          </p>
        ) : null}
      </div>
      <div
        ref={portalRef}
        className="pointer-events-none absolute inset-0 z-50 [&>*]:pointer-events-auto"
      />
    </div>
  );
}
