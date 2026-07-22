import {
  SYSTEM_MESSAGE_GROUPED_GENERIC,
  SYSTEM_MESSAGE_GROUPED_UPDATES,
  SYSTEM_MESSAGE_PREVIEW_CATALOG,
} from "../system-message.fixtures.ts";
import { SystemMessageGroupedList, SystemMessageRow } from "../system-message-row.tsx";

export function MessageSystemMessagesComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      {SYSTEM_MESSAGE_PREVIEW_CATALOG.map((section) => (
        <section key={section.title} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-foreground-muted">{section.title}</h3>
          <div className="flex flex-col gap-1">
            {section.messages.map((message) => (
              <SystemMessageRow key={message.id} message={message} />
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
