import { TASK_FIXTURES } from "#/modules/task-card/task-card.fixtures.ts";

import { TaskBoardComposition } from "./task-board.composition.tsx";

const EMPTY_COLUMN_TASKS = [TASK_FIXTURES[0], TASK_FIXTURES[2]] as const;

/** Idle column empties for In Review / Done / Closed. Drag onto empty columns for Allowed/Blocked. */
export function TaskBoardEmptyColumnsComposition() {
  return <TaskBoardComposition tasks={EMPTY_COLUMN_TASKS} expandAll />;
}
