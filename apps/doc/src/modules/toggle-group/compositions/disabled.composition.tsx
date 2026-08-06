import { Bold, Italic, Underline } from "lucide-react";
import { ToggleGroup, ToggleGroupItem, ToggleGroupLabel } from "raft-ui";

export function ToggleGroupDisabledComposition() {
  return (
    <ToggleGroup multiple disabled defaultValue={["bold"]} aria-label="Text formatting">
      <ToggleGroupItem value="bold">
        <Bold aria-hidden />
        <ToggleGroupLabel>Bold</ToggleGroupLabel>
      </ToggleGroupItem>
      <ToggleGroupItem value="italic">
        <Italic aria-hidden />
        <ToggleGroupLabel>Italic</ToggleGroupLabel>
      </ToggleGroupItem>
      <ToggleGroupItem value="underline">
        <Underline aria-hidden />
        <ToggleGroupLabel>Underline</ToggleGroupLabel>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
