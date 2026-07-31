import { SystemMessageGroupComposition } from "#/modules/system-message/compositions/grouped-generic.composition.tsx";
import { SystemMessageRowComposition } from "#/modules/system-message/compositions/preview.composition.tsx";
import type { PlaygroundSystemMessage } from "../mock/index.ts";

export function PlaygroundSystemMessageRow({ message }: { message: PlaygroundSystemMessage }) {
  if (message.event.kind === "single") {
    return (
      <SystemMessageRowComposition
        id={`message-${message.id}`}
        createdAt={message.createdAt}
        createdAtDateTime={message.createdAtDateTime}
        content={message.event.content}
      />
    );
  }

  return (
    <SystemMessageGroupComposition
      id={`message-${message.id}`}
      summary={message.event.summary}
      events={message.event.events}
    />
  );
}
