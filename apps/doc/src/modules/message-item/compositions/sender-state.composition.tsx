import {
  DeactivatedAgentMessageRow,
  LeftSenderMessageRow,
  RemovedSenderMessageRow,
} from "./row.compositions.tsx";

export function MessageSenderStateComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <RemovedSenderMessageRow />
      <LeftSenderMessageRow />
      <DeactivatedAgentMessageRow />
    </div>
  );
}
