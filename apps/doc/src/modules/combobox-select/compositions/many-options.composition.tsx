import { useId, useState } from "react";
import { Field, FieldLabel } from "@botiverse/raft-ui";
import { ComboboxSelect } from "@botiverse/raft-ui/wip";
import type { ComboboxSelectValue } from "@botiverse/raft-ui/wip";

const computers = [
  { value: "xxchan-linux", label: "xxchan-linux" },
  { value: "armbian-raft", label: "armbian-raft" },
  { value: "armbian-gx", label: "armbian-gx" },
  { value: "botiversemac-mini", label: "botiversemac-mini" },
  { value: "macmini-agent-1", label: "macmini-agent-1" },
  { value: "macmini-agent-2", label: "macmini-agent-2" },
  { value: "macmini-agent-3", label: "macmini-agent-3" },
  { value: "hetzner-ex63-1", label: "hetzner-ex63-1" },
  { value: "hetzner-ex63-2", label: "hetzner-ex63-2" },
  { value: "hetzner-ex63-3", label: "hetzner-ex63-3" },
  { value: "hetzner-ex63-4", label: "hetzner-ex63-4" },
  { value: "studio-m4", label: "studio-m4" },
  { value: "build-runner-1", label: "build-runner-1" },
  { value: "build-runner-2", label: "build-runner-2" },
];

export function ManyOptionsComposition() {
  const id = useId();
  const [computer, setComputer] = useState<ComboboxSelectValue | null>("xxchan-linux");

  return (
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor={id}>Target computer</FieldLabel>
      <ComboboxSelect
        id={id}
        options={computers}
        value={computer}
        onValueChange={setComputer}
        placeholder="Choose a computer"
        emptyContent="No computers match"
      />
    </Field>
  );
}
