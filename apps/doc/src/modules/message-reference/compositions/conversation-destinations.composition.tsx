import { Hash, MessageCircle, MessagesSquare, MessageSquareText } from "lucide-react";
import { MessageReference } from "raft-ui/wip";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceConversationDestinationsComposition() {
  return (
    <p className="text-sm text-foreground">
      Continue in{" "}
      <MessageReference
        variant="conversation"
        render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesChannel} />}
      >
        <Hash size={12} />
        release-notes
      </MessageReference>
      , message{" "}
      <MessageReference variant="conversation" render={<a href={MESSAGE_PLAYGROUND_URLS.noahDm} />}>
        <MessageCircle size={12} />
        Noah
      </MessageReference>
      , or open{" "}
      <MessageReference
        variant="conversation"
        render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
      >
        <MessagesSquare size={12} />
        release-notes · abc123
      </MessageReference>
      , or jump to{" "}
      <MessageReference
        variant="conversation"
        render={<a href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage} />}
      >
        <MessageSquareText size={12} />
        all · api-docs
      </MessageReference>
      .
    </p>
  );
}
