import { ActionCardMessageComposition } from "./action-card-message.composition.tsx";
import {
  ACTION_CARD_FIXTURES,
  type SimulatedActionCardState,
} from "../message-action-card.fixtures.ts";

const STATES: readonly SimulatedActionCardState[] = ["prepared", "busy", "failed", "executed"];

export function MessageActionCardStatesComposition() {
  return (
    <div className="grid w-full max-w-4xl gap-4 xl:grid-cols-2">
      {STATES.map((state) => (
        <section key={state} className="grid gap-1" aria-labelledby={`action-state-${state}`}>
          <h4
            id={`action-state-${state}`}
            className="font-mono text-xs font-bold uppercase text-foreground-muted"
          >
            {state}
          </h4>
          <ActionCardMessageComposition fixture={ACTION_CARD_FIXTURES[0]} initialState={state} />
        </section>
      ))}
    </div>
  );
}
