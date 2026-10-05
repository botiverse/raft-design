import { Bold, Italic, Underline } from "lucide-react";
import { ToggleGroup, ToggleGroupItem, ToggleGroupLabel } from "raft-ui";

const DEFAULT_VALUE = ["bold"];

export function ToggleGroupItemDisabledComposition() {
  return (
    <ToggleGroup multiple defaultValue={DEFAULT_VALUE} aria-label="Text formatting">
      <ToggleGroupItem value="bold">
        <Bold aria-hidden />
        <ToggleGroupLabel>Bold</ToggleGroupLabel>
      </ToggleGroupItem>
      <ToggleGroupItem value="italic">
        <Italic aria-hidden />
        <ToggleGroupLabel>Italic</ToggleGroupLabel>
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" disabled>
        <Underline aria-hidden />
        <ToggleGroupLabel>Underline</ToggleGroupLabel>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
