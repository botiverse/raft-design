import { useCallback, useState } from "react";
import { ScrollArea } from "@botiverse/raft-ui";
import type { ScrollAreaEdges } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

/** The sticky header and footer are both 40px tall: the scrollbar runs between them. */
const HEADER_FOOTER_INSET = { top: 40, bottom: 40 };

const files = Array.from({ length: 18 }, (_, index) => `design-review-${index + 1}.fig`);

export function ScrollAreaEdgeStateContent() {
  const [edges, setEdges] = useState<ScrollAreaEdges | null>(null);
  const handleEdgeChange = useCallback((next: ScrollAreaEdges) => setEdges(next), []);
  let position = "in the middle";
  if (edges?.top !== false) position = "at the top";
  else if (edges.bottom) position = "at the bottom";

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <ScrollArea
        role="region"
        aria-label="Files"
        railInset={HEADER_FOOTER_INSET}
        onEdgeChange={handleEdgeChange}
        className="group/files h-64 w-full rounded-container border border-line-hairline bg-layer-canvas"
      >
        <header className="sticky top-0 flex h-10 items-center border-b border-transparent bg-layer-canvas px-4 text-sm font-bold text-foreground group-[.r-scroll-area--overflow-y-start]/files:border-line-hairline">
          Files
        </header>
        <div className="px-4">
          {files.map((file) => (
            <p key={file} className="py-2 text-sm text-foreground">
              {file}
            </p>
          ))}
        </div>
        <footer className="sticky bottom-0 flex h-10 items-center border-t border-transparent bg-layer-canvas px-4 text-sm text-foreground-muted group-[.r-scroll-area--overflow-y-end]/files:border-line-hairline">
          {files.length} files
        </footer>
      </ScrollArea>
      <p className="font-mono text-mono-meta text-foreground-muted">onEdgeChange: {position}</p>
    </div>
  );
}

// @docs-source-strip-start
export function ScrollAreaEdgeStateComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ScrollAreaEdgeStateContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
