import { useRef, useState } from "react";

import { TASK_FIXTURES, type TaskStatus } from "../task-card.fixtures";
import { TaskCardComposition } from "./task-card.composition";

export function TaskCardStateMatrixComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState(() => [...TASK_FIXTURES]);
  const handleStatus = (taskId: string, status: TaskStatus) => {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)));
  };

  return (
    <div className="relative w-full max-w-5xl">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TaskCardComposition task={tasks[0]} onStatusChange={handleStatus} portalRef={portalRef} />
        <TaskCardComposition task={tasks[1]} onStatusChange={handleStatus} portalRef={portalRef} />
        <TaskCardComposition task={tasks[3]} onStatusChange={handleStatus} portalRef={portalRef} />
        <TaskCardComposition task={tasks[0]} disabled />
        <TaskCardComposition task={tasks[2]} busy />
        <TaskCardComposition
          task={tasks[4]}
          menuOpen
          onStatusChange={handleStatus}
          portalRef={portalRef}
        />
      </div>
      <div
        ref={portalRef}
        className="pointer-events-none absolute inset-0 z-50 [&>*]:pointer-events-auto"
      />
    </div>
  );
}
