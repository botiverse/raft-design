import { ToggleGroup, ToggleGroupItem, ToggleGroupLabel } from "raft-ui/wip";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
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
    <CompositionPreview>
      <ToggleGroupDisabledContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
