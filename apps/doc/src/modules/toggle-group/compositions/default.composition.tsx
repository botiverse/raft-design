import { ToggleGroup, ToggleGroupCount, ToggleGroupItem, ToggleGroupLabel } from "raft-ui/wip";
import { useState } from "react";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function ToggleGroupDefaultContent() {
  const [value, setValue] = useState("all");

  return (
    <ToggleGroup ariaLabel="Filter" value={value} onValueChange={setValue}>
      <ToggleGroupItem value="all">
        <ToggleGroupLabel>All</ToggleGroupLabel>
        <ToggleGroupCount>12</ToggleGroupCount>
      </ToggleGroupItem>
      <ToggleGroupItem value="unread">
        <ToggleGroupLabel>Unread</ToggleGroupLabel>
        <ToggleGroupCount>3</ToggleGroupCount>
      </ToggleGroupItem>
      <ToggleGroupItem value="mentions">
        <ToggleGroupLabel>Mentions</ToggleGroupLabel>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

// @docs-source-strip-start
export function ToggleGroupDefaultComposition() {
  return (
    <SourceComparisonPreview>
      <ToggleGroupDefaultContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
