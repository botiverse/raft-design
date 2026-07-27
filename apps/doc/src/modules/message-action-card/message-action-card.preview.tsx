import { useState, type ReactNode } from "react";

import { Preview } from "#/components/preview.tsx";
import { ActionCardMessageComposition } from "./compositions/action-card-message.composition.tsx";
import {
  ACTION_CARD_FIXTURES,
  type ActionCardFixture,
  type SimulatedActionCardState,
} from "./message-action-card.fixtures.ts";

const STATES: readonly SimulatedActionCardState[] = ["prepared", "busy", "failed", "executed"];
const ACTION_TYPES = ACTION_CARD_FIXTURES.map((fixture) => fixture.type);

function isActionType(value: string): value is ActionCardFixture["type"] {
  return ACTION_TYPES.some((type) => type === value);
}

function isActionState(value: string): value is SimulatedActionCardState {
  return STATES.some((state) => state === value);
}

export function MessageActionCardPreview({ code }: { code: ReactNode }) {
  const [actionType, setActionType] = useState<ActionCardFixture["type"]>(ACTION_TYPES[0]);
  const [initialState, setInitialState] = useState<SimulatedActionCardState>("prepared");
  const fixture = ACTION_CARD_FIXTURES.find((candidate) => candidate.type === actionType)!;

  return (
    <Preview previewClassName="items-stretch">
      <Preview.Canvas>
        <ActionCardMessageComposition
          key={`${fixture.type}-${initialState}`}
          fixture={fixture}
          initialState={initialState}
        />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.ControlGroup label="Scenario">
          <Preview.Control label="Action" htmlFor="action-card-preview-action">
            <Preview.Select
              id="action-card-preview-action"
              label="Action type"
              options={ACTION_TYPES}
              value={actionType}
              onValueChange={(value) => {
                if (isActionType(value)) {
                  setActionType(value);
                }
              }}
            />
          </Preview.Control>
          <Preview.Control label="State" htmlFor="action-card-preview-state">
            <Preview.Select
              id="action-card-preview-state"
              label="Initial action state"
              options={STATES}
              value={initialState}
              onValueChange={(value) => {
                if (isActionState(value)) {
                  setInitialState(value);
                }
              }}
            />
          </Preview.Control>
        </Preview.ControlGroup>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}
