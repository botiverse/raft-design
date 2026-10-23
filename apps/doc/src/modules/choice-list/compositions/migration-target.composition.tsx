import { useState } from "react";
import { Info } from "lucide-react";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@botiverse/raft-ui";
import { ChoiceList } from "@botiverse/raft-ui/wip";

function ComputerDetails({ name, details }: { name: string; details: string }) {
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon-md" aria-label={`${name} details`} />}
      >
        <Info />
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <PopoverTitle>{name}</PopoverTitle>
        <PopoverDescription>{details}</PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}

const COMPUTERS = [
  {
    value: "studio-mac",
    label: "Studio Mac",
    description: ["Claude Max · 5h 72% left · this week 40% left", "120 GB free · 3 agents"],
    action: (
      <ComputerDetails
        name="Studio Mac"
        details="macOS 15 · 64 GB memory · daemon 1.0.52. Kirby's workspace moves here in one step."
      />
    ),
  },
  {
    value: "hetzner-ex63-2",
    label: "hetzner-ex63-2",
    description: [
      <>
        Claude Max · 5h <span className="text-warning-strong">used up</span> · this week 12% left
      </>,
      "48 GB free · 9 agents",
    ],
    action: (
      <ComputerDetails
        name="hetzner-ex63-2"
        details="Linux x64 · 128 GB memory · daemon 1.0.52. The 5-hour window resets at 14:00."
      />
    ),
  },
  {
    value: "old-laptop",
    label: "old-laptop",
    description: ["No Claude login", "Offline since Monday"],
    disabled: true,
  },
  {
    value: "raft-cloud",
    label: "Raft Cloud",
    description: "Runs in Raft's cloud",
  },
];

export function ChoiceListMigrationTargetComposition() {
  const [target, setTarget] = useState<string | null>("studio-mac");
  return (
    <div className="w-104 max-w-full">
      <ChoiceList
        aria-label="Move Kirby to"
        items={COMPUTERS}
        value={target}
        onValueChange={setTarget}
      />
    </div>
  );
}
