import { MessageReferenceReadMark, MessageReferenceText } from "@botiverse/raft-ui";

export function MessageReferenceReadIndicatorsComposition() {
  return (
    <p className="text-sm text-foreground">
      Ask{" "}
      <MessageReferenceText>
        @Atlas
        <MessageReferenceReadMark>Read</MessageReferenceReadMark>
      </MessageReferenceText>{" "}
      or <MessageReferenceText>@Sage</MessageReferenceText>, then loop in{" "}
      <MessageReferenceText>@Noah</MessageReferenceText>.
    </p>
  );
}
