import { TaskChip } from "raft-ui";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceTaskReferencesComposition() {
  return (
    <p className="text-sm text-foreground">
      Review task{" "}
      <TaskChip
        variant="inline"
        status="todo"
        render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} aria-label="Open task #205" />}
      >
        #205
      </TaskChip>{" "}
      before posting the update. The known shorthand{" "}
      <TaskChip
        variant="inline"
        status="in-progress"
        render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} aria-label="Open task #206" />}
      >
        #206
      </TaskChip>{" "}
      resolves in the same channel; #999 remains plain text when no matching task exists.
    </p>
  );
}
