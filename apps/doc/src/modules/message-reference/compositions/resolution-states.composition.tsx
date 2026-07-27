import { Spinner } from "raft-ui";
import { CircleHelp, CircleOff } from "lucide-react";
import { MessageReference } from "raft-ui/wip";

export function MessageReferenceResolutionStatesComposition() {
  return (
    <p className="text-sm text-foreground">
      <MessageReference variant="pending">
        release-notes · abc123 <Spinner size="xs" />
      </MessageReference>{" "}
      <MessageReference variant="unavailable">
        <CircleOff size={12} />
        release-notes · missing-parent
      </MessageReference>{" "}
      <MessageReference variant="unavailable">
        <CircleHelp size={12} />
        missing
      </MessageReference>
    </p>
  );
}
