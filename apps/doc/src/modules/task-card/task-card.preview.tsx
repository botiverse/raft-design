import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { TaskCardComposition } from "./compositions/task-card.composition";
import { getTaskStatusLabel, TASK_FIXTURES, TASK_STATUSES } from "./task-card.fixtures";
import type { TaskStatus } from "./task-card.fixtures";

type CodeContent = ReactNode | AnyRenderableServerComponent;

const STATUS_OPTIONS = TASK_STATUSES.map((status) => status.label);

type TaskCardPlaygroundPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
  /** Multi-file code block; takes precedence over the single `code` snippet. */
  codeBlock?: ReactNode;
};

export function TaskCardPlaygroundPreview({
  code,
  collapsedCode,
  codeBlock,
}: TaskCardPlaygroundPreviewProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [task, setTask] = useState(() => TASK_FIXTURES[0]);

  const handleStatusChange = useCallback((taskId: string, status: TaskStatus) => {
    setTask((current) => (current.id === taskId ? { ...current, status } : current));
  }, []);

  const handleStatusLabelChange = useCallback((label: string) => {
    const status = TASK_STATUSES.find((item) => item.label === label)?.id as TaskStatus | undefined;
    if (!status) return;
    setTask((current) => ({ ...current, status }));
  }, []);

  return (
    <Preview>
      <Preview.Canvas>
        <div className="relative w-full max-w-sm">
          <TaskCardComposition
            task={task}
            onStatusChange={handleStatusChange}
            portalRef={portalRef}
          />
          <div
            ref={portalRef}
            className="pointer-events-none absolute inset-0 z-50 *:pointer-events-auto"
          />
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Status" htmlFor="task-card-preview-status">
          <Preview.Select
            id="task-card-preview-status"
            label="Status"
            options={STATUS_OPTIONS}
            value={getTaskStatusLabel(task.status)}
            onValueChange={handleStatusLabelChange}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} codeBlock={codeBlock} />
    </Preview>
  );
}
