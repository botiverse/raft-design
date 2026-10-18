import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@botiverse/raft-ui";

const DEFAULT_VALUE = ["left"];

export function ToggleGroupAlignmentComposition() {
  return (
    <ToggleGroup defaultValue={DEFAULT_VALUE} aria-label="Text alignment">
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeft aria-hidden />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter aria-hidden />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRight aria-hidden />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
