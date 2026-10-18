import { List, ListOrdered, Quote } from "lucide-react";
import { ToggleGroup, ToggleGroupItem, ToggleGroupLabel } from "@botiverse/raft-ui";

export function ToggleGroupVerticalComposition() {
  return (
    <ToggleGroup multiple orientation="vertical" aria-label="Block formatting">
      <ToggleGroupItem value="bulleted-list">
        <List aria-hidden />
        <ToggleGroupLabel>Bulleted list</ToggleGroupLabel>
      </ToggleGroupItem>
      <ToggleGroupItem value="numbered-list">
        <ListOrdered aria-hidden />
        <ToggleGroupLabel>Numbered list</ToggleGroupLabel>
      </ToggleGroupItem>
      <ToggleGroupItem value="quote">
        <Quote aria-hidden />
        <ToggleGroupLabel>Quote</ToggleGroupLabel>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
