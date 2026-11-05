import { SystemMessage, SystemMessageContent, SystemMessageTime } from "@botiverse/raft-ui";

export type SystemMessageRowCompositionProps = {
  content: string;
  createdAt: string;
  createdAtDateTime?: string;
  id?: string;
};

export function SystemMessageRowComposition({
  content,
  createdAt,
  createdAtDateTime,
  id,
}: SystemMessageRowCompositionProps) {
  return (
    <SystemMessage id={id}>
      <SystemMessageTime
        render={createdAtDateTime ? <time dateTime={createdAtDateTime} /> : undefined}
      >
        {createdAt}
      </SystemMessageTime>
      <SystemMessageContent>{content}</SystemMessageContent>
    </SystemMessage>
  );
}

export function MessageSystemMessagesComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-1">
      <SystemMessageRowComposition createdAt="2:16 PM" content="📦 Atlas archived this channel" />
      <SystemMessageRowComposition createdAt="2:16 PM" content="@hermes joined this channel." />
      <SystemMessageRowComposition
        createdAt="2:16 PM"
        content={'✅ Atlas moved #41 "Release review checklist" to Done'}
      />
    </div>
  );
}
