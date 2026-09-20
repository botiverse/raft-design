import { ComboboxSelect } from "raft-ui/wip";
import type { ComboboxSelectOption, ComboboxSelectProps } from "raft-ui/wip";

const models = [
  { value: "raft-fast", label: "Raft Fast" },
  { value: "raft-reasoning", label: "Raft Reasoning" },
  { value: "raft-vision", label: "Raft Vision", disabled: true },
  { value: "raft-code", label: "Raft Code" },
];

type PreviewProps = Omit<ComboboxSelectProps<ComboboxSelectOption, boolean>, "options">;

export function ComboboxPreviewComposition(props: PreviewProps = {}) {
  return (
    <ComboboxSelect
      options={models}
      defaultValue="raft-fast"
      clearable
      aria-label="Model"
      placeholder="Choose a model"
      {...props}
    />
  );
}
