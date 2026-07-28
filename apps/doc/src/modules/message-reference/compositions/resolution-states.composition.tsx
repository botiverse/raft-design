import { Spinner } from "raft-ui";
import { CircleOff } from "lucide-react";
import { MessageReferencePending, MessageReferenceUnavailable } from "raft-ui/wip";

export function MessageReferenceResolutionStatesComposition() {
  return (
    <p className="text-sm text-foreground">
      <MessageReferencePending>
        <Spinner size="xs" />
        release-notes
      </MessageReferencePending>{" "}
      <MessageReferenceUnavailable>
        <CircleOff size={12} />
        release-notes
      </MessageReferenceUnavailable>{" "}
      missing
    </p>
  );
}
