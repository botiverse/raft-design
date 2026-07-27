import {
  SYSTEM_MESSAGE_GROUPED_GENERIC,
  SYSTEM_MESSAGE_GROUPED_UPDATES,
  SYSTEM_MESSAGE_PREVIEW_CATALOG,
} from "../system-message.fixtures.ts";
import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";
import { SystemMessageGroupedList } from "../system-message-grouped-list.tsx";

export function MessageSystemMessagesComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      {SYSTEM_MESSAGE_PREVIEW_CATALOG.map((section) => (
        <section key={section.title} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-foreground-muted">{section.title}</h3>
          <div className="flex flex-col gap-1">
            {section.messages.map((message) => (
              <SystemMessage key={message.id}>
                <SystemMessageTime>2:16 PM</SystemMessageTime>
                <SystemMessageContent>{message.content}</SystemMessageContent>
              </SystemMessage>
            ))}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-foreground-muted">Grouped updates</h3>
        <SystemMessageGroupedList messages={SYSTEM_MESSAGE_GROUPED_UPDATES} />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-foreground-muted">Grouped generic</h3>
        <SystemMessageGroupedList messages={SYSTEM_MESSAGE_GROUPED_GENERIC} />
      </section>
    </div>
  );
}
