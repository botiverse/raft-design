import { MessageReferencePending, Spinner } from "@botiverse/raft-ui";

export function MessageReferenceResolutionStatesComposition() {
  return (
    <p className="text-sm text-foreground">
      Opening{" "}
      <MessageReferencePending>
        <Spinner size="xs" />
        #state-model:29a90e07
      </MessageReferencePending>{" "}
      may take a moment. If the thread cannot be opened, keep #state-model:29a90e07 in the message;
      #missing-channel also remains plain text.
    </p>
  );
}
