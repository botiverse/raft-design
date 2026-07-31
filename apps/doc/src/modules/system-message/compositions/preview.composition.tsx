import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui";

export function MessageSystemMessagesComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-1">
      <SystemMessage>
        <SystemMessageTime>2:16 PM</SystemMessageTime>
        <SystemMessageContent>📦 Atlas archived this channel</SystemMessageContent>
      </SystemMessage>
      <SystemMessage>
        <SystemMessageTime>2:16 PM</SystemMessageTime>
        <SystemMessageContent>@hermes joined this channel.</SystemMessageContent>
      </SystemMessage>
      <SystemMessage>
        <SystemMessageTime>2:16 PM</SystemMessageTime>
        <SystemMessageContent>
          ✅ Atlas moved #41 &quot;Release review checklist&quot; to Done
        </SystemMessageContent>
      </SystemMessage>
    </div>
  );
}
