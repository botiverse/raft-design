import { TaskBoardComposition } from "#/modules/task-board/compositions/task-board.composition.tsx";
import { TASK_FIXTURES } from "#/modules/task-card/task-card.fixtures.ts";

const DND_TASKS = [TASK_FIXTURES[0], TASK_FIXTURES[2]];
const STATUS_LOCKED_TASK_IDS = ["task-137"];

/**
 * Todo + In Progress only, so the other columns stay empty. Any status can be
 * set from any status; the refusal shown here is a permission: the person may
 * not change #137's status, so every column but its own refuses it. Drag #142
 * onto an empty column for the allowed copy, #137 for the refused one.
 */
export function TaskDndComposition() {
  return (
    <TaskBoardComposition
      tasks={DND_TASKS}
      statusLockedTaskIds={STATUS_LOCKED_TASK_IDS}
      expandAll
    />
  );
}
