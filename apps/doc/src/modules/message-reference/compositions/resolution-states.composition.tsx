import { MessageReferencePending, MessageReferenceUnavailable, Spinner } from "raft-ui";
import { CircleOff } from "lucide-react";

export function MessageReferenceResolutionStatesComposition() {
  return (
    <p className="text-sm text-foreground-strong">
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
