import { ToggleGroup, ToggleGroupItem, ToggleGroupLabel } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function ToggleGroupDisabledContent() {
  return (
    <ToggleGroup disabled ariaLabel="Filter" value="all" onValueChange={() => {}}>
      <ToggleGroupItem value="all">
        <ToggleGroupLabel>All</ToggleGroupLabel>
      </ToggleGroupItem>
      <ToggleGroupItem value="unread">
        <ToggleGroupLabel>Unread</ToggleGroupLabel>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

// @docs-source-strip-start
export function ToggleGroupDisabledComposition() {
  return (
    <SourceComparisonPreview>
      <ToggleGroupDisabledContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
