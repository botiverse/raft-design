import { Button } from "@botiverse/raft-ui";
import {
  ModeBar,
  ModeBarAction,
  ModeBarContent,
  ModeBarDescription,
  ModeBarTitle,
} from "@botiverse/raft-ui/wip";
import { useCallback, useState } from "react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function ModeBarNarrowContent() {
  const [commenting, setCommenting] = useState(true);
  const start = useCallback(() => setCommenting(true), []);
  const done = useCallback(() => setCommenting(false), []);

  if (!commenting) {
    return (
      <Button variant="default" size="md" onClick={start}>
        Comment
      </Button>
    );
  }

  return (
    <ModeBar className="w-90 max-w-full">
      <ModeBarContent>
        <ModeBarTitle>Commenting · 3 drafts.</ModeBarTitle>
        <ModeBarDescription>Select text or tap a block to comment on it.</ModeBarDescription>
      </ModeBarContent>
      <ModeBarAction onClick={done}>Done</ModeBarAction>
    </ModeBar>
  );
}

// @docs-source-strip-start
export function ModeBarNarrowComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ModeBarNarrowContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
