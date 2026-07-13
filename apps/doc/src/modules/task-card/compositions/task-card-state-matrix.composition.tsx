import { useRef, useState } from "react";

import { TASK_FIXTURES } from "../task-card.fixtures";
import { TaskCardComposition } from "./task-card.composition";

export function TaskCardStateMatrixComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState("Interact with a card or status menu.");
  const handleOpen = (task: (typeof TASK_FIXTURES)[number]) =>
    setNotice(`Opened task #${task.taskNumber}`);
  const handleStatus = (taskId: string, status: string) =>
    setNotice(`${taskId} selected ${status}`);

  return (
    <div
      ref={portalRef}
      className="relative grid w-full max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <TaskCardComposition
        task={TASK_FIXTURES[0]}
        onOpen={handleOpen}
        onStatusChange={handleStatus}
        portalRef={portalRef}
      />
      <TaskCardComposition
        task={TASK_FIXTURES[1]}
        onOpen={handleOpen}
        onStatusChange={handleStatus}
        portalRef={portalRef}
      />
      <TaskCardComposition
        task={TASK_FIXTURES[3]}
        onOpen={handleOpen}
        onStatusChange={handleStatus}
        portalRef={portalRef}
      />
      <TaskCardComposition task={TASK_FIXTURES[0]} disabled />
      <TaskCardComposition task={TASK_FIXTURES[2]} busy onOpen={handleOpen} />
      <TaskCardComposition
        task={TASK_FIXTURES[4]}
        menuOpen
        onOpen={handleOpen}
        onStatusChange={handleStatus}
        portalRef={portalRef}
      />
      <p className="col-span-full text-sm text-foreground-muted" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}
