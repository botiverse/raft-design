import { ActionCardDemo } from "../action-card-demo.tsx";
import { ActionCardMessage } from "../action-card-message.tsx";
import { ACTION_CARD_FIXTURES, APPROVE_KINDS } from "../action-card.fixtures.ts";

/** Approve pattern: the primary button runs the action in one click. */
export function ActionCardIntegrationComposition() {
  return (
    <ActionCardMessage time="2:42 PM">
      {APPROVE_KINDS.map((kind) => (
        <ActionCardDemo key={kind} card={ACTION_CARD_FIXTURES[kind]} state="pending" />
      ))}
    </ActionCardMessage>
  );
}
