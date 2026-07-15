import {
  AuthoredMessageRow,
  ConsecutiveMessageRow,
  ConvertingMessageRow,
  DeactivatedAgentMessageRow,
  LeftSenderMessageRow,
  RemovedSenderMessageRow,
  ReminderReceiptEventRow,
  SystemMessageGroupRow,
  ThreadArchiveEventRow,
} from "./row.compositions.tsx";

export function MessageRowsShowcaseComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <AuthoredMessageRow />
      <ConsecutiveMessageRow />
      <ThreadArchiveEventRow />
      <ReminderReceiptEventRow />
      <SystemMessageGroupRow />
      <RemovedSenderMessageRow />
      <LeftSenderMessageRow />
      <DeactivatedAgentMessageRow />
      <ConvertingMessageRow />
    </div>
  );
}
