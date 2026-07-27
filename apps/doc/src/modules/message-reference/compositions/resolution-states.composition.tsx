import { Spinner } from "raft-ui";
import { CircleHelp, CircleOff } from "lucide-react";
import { MessageReferencePending, MessageReferenceUnavailable } from "raft-ui/wip";

export function MessageReferenceResolutionStatesComposition() {
  return (
    <p className="text-sm text-foreground">
      <MessageReferencePending>
        release-notes · abc123 <Spinner size="xs" />
      </MessageReferencePending>{" "}
      <MessageReferenceUnavailable>
        <CircleOff size={12} />
        release-notes · missing-parent
      </MessageReferenceUnavailable>{" "}
      <MessageReferenceUnavailable>
        <CircleHelp size={12} />
        missing
      </MessageReferenceUnavailable>
    </p>
  );
}
