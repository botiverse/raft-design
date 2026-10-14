import { ActionCardDemo } from "../action-card-demo.tsx";
import { ActionCardMessage } from "../action-card-message.tsx";
import { ACTION_CARD_FIXTURES, ACTION_CARD_STATES } from "../action-card.fixtures.ts";

/** Every state of one card. Done, declined and view-only start folded. */
export function ActionCardResolutionStatesComposition() {
  return (
    <ActionCardMessage time="3:02 PM">
      {ACTION_CARD_STATES.map((option) => (
        <ActionCardDemo
          key={option.value}
          card={ACTION_CARD_FIXTURES.channel}
          state={option.value}
        />
      ))}
    </ActionCardMessage>
  );
}
