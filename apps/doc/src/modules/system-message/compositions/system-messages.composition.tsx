import { useMemo, useState } from "react";
import {
  buildSystemMessageRenderStates,
  SystemMessage,
  SystemMessageContent,
  SystemMessageGroup,
  SystemMessageGroupChevron,
  SystemMessageGroupDisclosure,
  SystemMessageGroupHeader,
  SystemMessageGroupPanel,
  SystemMessageGroupSummary,
  SystemMessageTime,
  type SystemMessageSlice,
} from "raft-ui/wip";

const FIXTURE_NOW = new Date("2026-07-16T01:00:00.000Z");

const FIXTURE_MESSAGES: SystemMessageSlice[] = [
  {
    id: "sys-archive",
    messageType: "system",
    content: "Atlas archived this thread.",
  },
  {
    id: "sys-reminder",
    messageType: "system",
    content:
      '@Atlas scheduled a reminder: "Ship the docs cut" — fires <span data-reminder-fire-at="2026-07-16T09:00:00.000Z">2026-07-16 09:00 UTC</span>',
  },
  {
    id: "sys-task-done",
    messageType: "system",
    content: '✅ Atlas moved #41 "Release review checklist" to Done',
  },
  {
    id: "sys-task-claimed",
    messageType: "system",
    content: '📌 Ada claimed #42 "Polish SystemMessage docs"',
  },
  {
    id: "sys-reminder-notice",
    messageType: "system",
    content:
      '🔔 Reminder #7ddfdf1d (one-time) — #proj-uiux:141a05fd — "Check PR #1306 CI for task #103"',
  },
];

function SystemMessageRow({ message, time }: { message: SystemMessageSlice; time: string }) {
  return (
    <SystemMessage>
      <SystemMessageTime>{time}</SystemMessageTime>
      <SystemMessageContent content={message.content} now={FIXTURE_NOW} timeFormat="12h" />
    </SystemMessage>
  );
}

export function ThreadArchiveEventRow() {
  return <SystemMessageRow message={FIXTURE_MESSAGES[0]} time="2:16 PM" />;
}

export function ReminderReceiptEventRow() {
  return <SystemMessageRow message={FIXTURE_MESSAGES[1]} time="2:17 PM" />;
}

export function TaskUpdateEventRows() {
  return (
    <div>
      <SystemMessageRow message={FIXTURE_MESSAGES[2]} time="2:18 PM" />
      <SystemMessageRow message={FIXTURE_MESSAGES[3]} time="2:19 PM" />
    </div>
  );
}

export function SystemMessageGroupedListComposition() {
  const messages = FIXTURE_MESSAGES.slice(2);
  const states = useMemo(() => buildSystemMessageRenderStates(messages), [messages]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());

  return (
    <div className="w-full max-w-3xl">
      {messages.map((message, index) => {
        const state = states[index];
        if (state?.kind === "hide") return null;

        if (state?.kind === "summary") {
          const open = expandedGroups.has(state.groupId);
          return (
            <SystemMessageGroup
              key={state.groupId}
              open={open}
              onOpenChange={(nextOpen) => {
                setExpandedGroups((current) => {
                  const next = new Set(current);
                  if (nextOpen) next.add(state.groupId);
                  else next.delete(state.groupId);
                  return next;
                });
              }}
            >
              <SystemMessageGroupHeader>
                <SystemMessageGroupDisclosure title={state.content}>
                  <SystemMessageGroupSummary>{state.content}</SystemMessageGroupSummary>
                  <SystemMessageGroupChevron />
                </SystemMessageGroupDisclosure>
              </SystemMessageGroupHeader>
              <SystemMessageGroupPanel>
                {state.messageIndexes.map((messageIndex) => {
                  const grouped = messages[messageIndex];
                  if (!grouped) return null;
                  return (
                    <SystemMessageRow
                      key={grouped.id}
                      message={grouped}
                      time={
                        messageIndex === 0 ? "2:18 PM" : messageIndex === 1 ? "2:19 PM" : "2:20 PM"
                      }
                    />
                  );
                })}
              </SystemMessageGroupPanel>
            </SystemMessageGroup>
          );
        }

        return <SystemMessageRow key={message.id} message={message} time="2:18 PM" />;
      })}
    </div>
  );
}

export function MessageSystemMessagesComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <ThreadArchiveEventRow />
        <ReminderReceiptEventRow />
        <TaskUpdateEventRows />
      </div>
      <SystemMessageGroupedListComposition />
    </div>
  );
}
