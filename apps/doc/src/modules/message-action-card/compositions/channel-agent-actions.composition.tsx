import { ActionCardDemo } from "../action-card-demo.tsx";
import { ActionCardMessage } from "../action-card-message.tsx";
import { ACTION_CARD_FIXTURES, REVIEW_KINDS } from "../action-card.fixtures.ts";

/** Review pattern: the primary button opens the regular dialog, prefilled. */
export function ActionCardChannelAndAgentComposition() {
  return (
    <ActionCardMessage time="2:31 PM">
      {REVIEW_KINDS.map((kind) => (
        <ActionCardDemo key={kind} card={ACTION_CARD_FIXTURES[kind]} state="pending" />
      ))}
    </ActionCardMessage>
  );
}
