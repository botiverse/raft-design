import { useState, type ReactNode } from "react";

import { Preview } from "#/components/preview.tsx";
import { ActionCardMessageComposition } from "./compositions/action-card-message.composition.tsx";
import type { SimulatedActionCardState } from "./message-action-card.fixtures.ts";

const STATES: readonly SimulatedActionCardState[] = ["prepared", "busy", "failed", "executed"];

function isActionState(value: string): value is SimulatedActionCardState {
  return STATES.some((state) => state === value);
}

export function MessageActionCardPreview({ code }: { code: ReactNode }) {
  const [initialState, setInitialState] = useState<SimulatedActionCardState>("prepared");

  return (
    <Preview previewClassName="items-stretch">
      <Preview.Canvas>
        <ActionCardMessageComposition key={initialState} initialState={initialState} />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.ControlGroup label="State">
          <Preview.Segmented
            label="Initial action state"
            options={STATES}
            value={initialState}
            onValueChange={(value) => {
              if (isActionState(value)) {
                setInitialState(value);
              }
            }}
          />
        </Preview.ControlGroup>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}
