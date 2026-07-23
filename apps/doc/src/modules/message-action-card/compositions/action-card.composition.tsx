import { ActionCardMessageComposition } from "./action-card-message.composition.tsx";
import { ACTION_CARD_FIXTURES } from "../message-action-card.fixtures.ts";

export function MessageActionCardShowcaseComposition() {
  return (
    <div className="grid w-full max-w-4xl gap-8">
      {ACTION_CARD_FIXTURES.map((fixture) => (
        <section
          key={fixture.type}
          className="grid gap-3"
          aria-labelledby={`action-${fixture.type}`}
        >
          <h3
            id={`action-${fixture.type}`}
            className="font-mono text-xs font-bold text-foreground-muted"
          >
            {fixture.type}
          </h3>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="grid gap-1">
              <div className="text-xs font-bold uppercase text-foreground-muted">
                Initial: prepared
              </div>
              <ActionCardMessageComposition fixture={fixture} initialState="prepared" />
            </div>
            <div className="grid gap-1">
              <div className="text-xs font-bold uppercase text-foreground-muted">
                Initial: executed
              </div>
              <ActionCardMessageComposition fixture={fixture} initialState="executed" />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
