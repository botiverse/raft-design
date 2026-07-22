import {
  ReminderReceiptEventRow,
  SystemMessageGroupRow,
  ThreadArchiveEventRow,
} from "./row.compositions.tsx";

export function MessageSystemMessagesComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <ThreadArchiveEventRow />
      <ReminderReceiptEventRow />
      <SystemMessageGroupRow />
    </div>
  );
}
