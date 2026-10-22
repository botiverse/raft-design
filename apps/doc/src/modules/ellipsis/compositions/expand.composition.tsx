import { Ellipsis, EllipsisToggle } from "@botiverse/raft-ui/wip";
import type { EllipsisState } from "@botiverse/raft-ui/wip";

function showMore({ expanded }: EllipsisState) {
  return <EllipsisToggle>{expanded ? "Show Less" : "Show More"}</EllipsisToggle>;
}

const LONG =
  "Ships the new sidebar to everyone on Thursday. The rollout goes in three steps: staff first, then the beta servers, then everyone. Each step waits a day for the error rate to settle, and the flag stays in place for a week after the last one so we can turn it off without a deploy.";

const SHORT = "Ships the new sidebar to everyone on Thursday.";

export function EllipsisExpandContent() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 text-callout">
      {[LONG, SHORT].map((text) => (
        <Ellipsis key={text} lines={3} tooltip={false} after={showMore}>
          {text}
        </Ellipsis>
      ))}
    </div>
  );
}
