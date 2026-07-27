import { ActionCardMessageComposition } from "./action-card-message.composition.tsx";
import { ACTION_CARD_FIXTURES } from "../message-action-card.fixtures.ts";

export function MessageActionCardTypesComposition() {
  return (
    <div className="grid w-full max-w-4xl gap-6">
      {ACTION_CARD_FIXTURES.map((fixture) => (
        <section
          key={fixture.type}
          className="grid gap-2"
          aria-labelledby={`action-${fixture.type}`}
        >
          <h3
            id={`action-${fixture.type}`}
            className="font-mono text-xs font-bold text-foreground-muted"
          >
            {fixture.type}
          </h3>
          <ActionCardMessageComposition fixture={fixture} initialState="prepared" />
        </section>
      ))}
    </div>
  );
}
