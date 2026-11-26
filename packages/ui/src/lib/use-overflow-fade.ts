import { useCallback, useState } from "react";
import type { ScrollAreaEdges } from "../components/scroll-area/types";

/**
 * ScrollArea's `fade`, only while the area has something to scroll. A popup's
 * scroller (a menu's items, `PopoverBody`, `PreviewCardBody`) usually fits;
 * a mask on it then fades nothing, yet Chromium draws the content through it
 * and rasterizes its icons' edges a few levels apart, so a menu that fits
 * wouldn't draw exactly as it did before it could scroll. Spread the result
 * on the ScrollArea; `onEdgeChange` of your own is called too.
 */
export function useOverflowFade(onEdgeChange?: (edges: ScrollAreaEdges) => void) {
  const [fade, setFade] = useState(false);
  const handleEdgeChange = useCallback(
    (edges: ScrollAreaEdges) => {
      setFade(!(edges.top && edges.bottom && edges.left && edges.right));
      onEdgeChange?.(edges);
    },
    [onEdgeChange],
  );
  return { fade, onEdgeChange: handleEdgeChange };
}
