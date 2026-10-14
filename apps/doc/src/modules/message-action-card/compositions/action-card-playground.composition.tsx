import { useCallback, useState } from "react";
import { SegmentedControl, SegmentedControlItem, SegmentedControlLabel } from "raft-ui";

import { ActionCardDemo } from "../action-card-demo.tsx";
import { ActionCardMessage } from "../action-card-message.tsx";
import { ACTION_CARD_FIXTURES, ACTION_CARD_STATES } from "../action-card.fixtures.ts";
import type { ActionCardKind, ActionCardState } from "../action-card.fixtures.ts";

const EXAMPLES: ReadonlyArray<{ value: ActionCardKind; label: string }> = [
  { value: "channel", label: "Review · Create channel" },
  { value: "login", label: "Approve · App login" },
];

/** One card you can walk through every state; resolved states fold, with the
 *  header toggle to open them again. */
export function ActionCardPlaygroundComposition() {
  const [kind, setKind] = useState<ActionCardKind>("channel");
  const [state, setState] = useState<ActionCardState>("pending");
  const handleKindChange = useCallback((value: unknown) => setKind(value as ActionCardKind), []);
  const handleStateChange = useCallback((value: unknown) => setState(value as ActionCardState), []);

  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl value={kind} onValueChange={handleKindChange} aria-label="Pattern">
          {EXAMPLES.map((example) => (
            <SegmentedControlItem key={example.value} value={example.value}>
              <SegmentedControlLabel>{example.label}</SegmentedControlLabel>
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <SegmentedControl value={state} onValueChange={handleStateChange} aria-label="State">
          {ACTION_CARD_STATES.map((option) => (
            <SegmentedControlItem key={option.value} value={option.value}>
              <SegmentedControlLabel>{option.label}</SegmentedControlLabel>
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
      <ActionCardMessage time="2:27 PM">
        <ActionCardDemo card={ACTION_CARD_FIXTURES[kind]} state={state} />
      </ActionCardMessage>
    </div>
  );
}
