import { TaskBoardComposition } from "#/modules/task-board/compositions/task-board.composition.tsx";
import { TASK_FIXTURES } from "#/modules/task-card/task-card.fixtures.ts";

const DND_TASKS = [TASK_FIXTURES[0], TASK_FIXTURES[2]];

/**
 * Todo + In Progress only so Closed stays empty. Drag onto Closed for blocked
 * empty-column copy; drag onto Done / In Review for allowed empty-column copy.
 */
export function TaskDndComposition() {
  return <TaskBoardComposition tasks={DND_TASKS} blockedDropStatus="closed" expandAll />;
}
