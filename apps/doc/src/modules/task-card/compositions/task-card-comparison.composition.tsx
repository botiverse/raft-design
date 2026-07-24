import { useRef, useState } from "react";

import { TaskCardComposition } from "./task-card.composition";
import { TASK_FIXTURES, type TaskStatus } from "../task-card.fixtures";

export function TaskCardComparisonComposition({
  showChannelName = false,
}: { showChannelName?: boolean } = {}) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [task, setTask] = useState(() => TASK_FIXTURES[0]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="grid gap-3">
        <TaskCardComposition
          task={task}
          onStatusChange={(taskId, status: TaskStatus) => {
            setTask((current) => (current.id === taskId ? { ...current, status } : current));
          }}
          portalRef={portalRef}
          showChannelName={showChannelName}
        />
      </div>
      <div
        ref={portalRef}
        className="pointer-events-none absolute inset-0 z-50 [&>*]:pointer-events-auto"
      />
    </div>
  );
}
