import { TASK_FIXTURES } from "#/modules/task-card/task-card.fixtures.ts";

import { TaskListComposition } from "./task-list.composition.tsx";

const EMPTY_SECTION_TASKS = [TASK_FIXTURES[0], TASK_FIXTURES[2]] as const;

/** Section empties for In Review / Done / Closed. */
export function TaskListEmptySectionsComposition() {
  return <TaskListComposition tasks={EMPTY_SECTION_TASKS} expandAll />;
}
