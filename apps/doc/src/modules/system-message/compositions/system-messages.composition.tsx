import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  SystemMessage,
  SystemMessageContent,
  SystemMessageGroupDisclosure,
  SystemMessageTime,
} from "raft-ui/wip";

export function ThreadArchiveEventRow() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:16 PM</SystemMessageTime>
      <SystemMessageContent>Atlas archived this thread.</SystemMessageContent>
    </SystemMessage>
  );
}

export function ReminderReceiptEventRow() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:17 PM</SystemMessageTime>
      <SystemMessageContent title="Reminder fires Jul 16, 9:00 AM">
        Reminder scheduled for tomorrow at 9:00 AM.
      </SystemMessageContent>
    </SystemMessage>
  );
}

export function SystemMessageGroupRow() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-1">
      <div className="flex justify-center py-1.5">
        <SystemMessageGroupDisclosure
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          title="There are 2 system updates: 1 task update, 1 reminder update"
        >
          <span className="truncate">
            There are 2 system updates: 1 task update, 1 reminder update
          </span>
          <ChevronRight aria-hidden />
        </SystemMessageGroupDisclosure>
      </div>
      {expanded ? (
        <div>
          <SystemMessage>
            <SystemMessageTime>2:18 PM</SystemMessageTime>
            <SystemMessageContent>Task #41 was completed.</SystemMessageContent>
          </SystemMessage>
          <ReminderReceiptEventRow />
        </div>
      ) : null}
    </div>
  );
}

export function MessageSystemMessagesComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <ThreadArchiveEventRow />
      <ReminderReceiptEventRow />
      <SystemMessageGroupRow />
    </div>
  );
}
