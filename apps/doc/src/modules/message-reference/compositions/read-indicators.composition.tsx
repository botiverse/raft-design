import { MessageReferenceIndicator, MessageReferenceText, Status } from "@botiverse/raft-ui";

export function MessageReferenceReadIndicatorsComposition() {
  return (
    <p className="text-sm text-foreground">
      Ask{" "}
      <MessageReferenceText>
        @Atlas
        <MessageReferenceIndicator>
          <Status aria-label="Read" size="sm" variant="success" />
        </MessageReferenceIndicator>
      </MessageReferenceText>{" "}
      or{" "}
      <MessageReferenceText>
        @Sage
        <MessageReferenceIndicator>
          <Status aria-label="Not read yet" size="sm" />
        </MessageReferenceIndicator>
      </MessageReferenceText>
      , then loop in <MessageReferenceText>@Noah</MessageReferenceText>.
    </p>
  );
}
