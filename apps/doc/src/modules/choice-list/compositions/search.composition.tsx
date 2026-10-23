import { useState } from "react";
import { ChoiceList } from "@botiverse/raft-ui/wip";

const COMPUTERS = [
  { value: "studio-mac", label: "Studio Mac", description: "120 GB free · 3 agents" },
  { value: "hetzner-ex63-1", label: "hetzner-ex63-1", description: "64 GB free · 6 agents" },
  { value: "hetzner-ex63-2", label: "hetzner-ex63-2", description: "48 GB free · 9 agents" },
  { value: "hetzner-ax41", label: "hetzner-ax41", description: "210 GB free · 2 agents" },
  { value: "mini-office", label: "mini-office", description: "18 GB free · 1 agent" },
  { value: "pi-cluster", label: "pi-cluster", description: "8 GB free · 1 agent" },
  { value: "build-box", label: "build-box", description: "300 GB free · no agents" },
  { value: "raft-cloud", label: "Raft Cloud", description: "Runs in Raft's cloud" },
];

export function ChoiceListSearchComposition() {
  const [target, setTarget] = useState<string | null>("hetzner-ex63-2");
  return (
    <div className="w-104 max-w-full">
      <ChoiceList
        aria-label="Target computer"
        searchLabel="Search computers"
        searchPlaceholder="Search computers"
        clearSearchLabel="Clear search"
        noMatchLabel="No matches"
        items={COMPUTERS}
        value={target}
        onValueChange={setTarget}
      />
    </div>
  );
}
