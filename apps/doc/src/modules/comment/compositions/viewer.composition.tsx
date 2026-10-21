import { useState } from "react";
import { useCommentMarginFits } from "@botiverse/raft-ui/wip";

import { CommentMarginContent } from "./margin.composition.tsx";
import { CommentMarkerSheetContent } from "./marker-sheet.composition.tsx";

/**
 * The document viewer decides which comments it shows: the margin of cards on
 * a desktop with room for it (784px), markers and a bottom sheet everywhere
 * else. The two are different trees, so the viewer measures itself.
 */
export function CommentViewerContent() {
  const [viewer, setViewer] = useState<HTMLDivElement | null>(null);
  const fits = useCommentMarginFits(viewer, { minWidth: 784 });

  return (
    <div ref={setViewer} className="flex w-full justify-center">
      {fits ? <CommentMarginContent /> : <CommentMarkerSheetContent />}
    </div>
  );
}
