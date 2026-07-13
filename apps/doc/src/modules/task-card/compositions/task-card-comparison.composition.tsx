import { useRef, useState } from "react";

import { TaskCardComposition } from "./task-card.composition";
import { TASK_FIXTURES } from "../task-card.fixtures";

export function TaskCardComparisonComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState("Interact with the current card.");
  const task = TASK_FIXTURES[0];

  return (
    <div ref={portalRef} className="relative grid w-full max-w-sm gap-3">
      <TaskCardComposition
        task={task}
        onOpen={(nextTask) => setNotice(`Opened task #${nextTask.taskNumber}`)}
        onStatusChange={(_, status) => setNotice(`Selected ${status}`)}
        portalRef={portalRef}
      />
      <p className="text-sm text-foreground-muted" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}
