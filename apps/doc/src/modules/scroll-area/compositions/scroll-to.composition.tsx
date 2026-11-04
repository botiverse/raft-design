import { useCallback, useRef, useState } from "react";
import type { UIEvent } from "react";
import { Button, ScrollArea } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const sections = Array.from({ length: 12 }, (_, index) => `Week ${index + 1}`);

export function ScrollAreaScrollToContent() {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  const scrollToTop = useCallback(() => ref.current?.scrollTo({ behavior: "smooth", top: 0 }), []);
  const scrollDown = useCallback(() => ref.current?.scrollBy({ behavior: "smooth", top: 120 }), []);
  const scrollToBottom = useCallback(
    () => ref.current?.scrollTo({ behavior: "smooth", top: ref.current.scrollHeight }),
    [],
  );
  const trackTop = useCallback(
    (event: UIEvent<HTMLDivElement>) => setTop(event.currentTarget.scrollTop),
    [],
  );

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={scrollToTop}>
          Top
        </Button>
        <Button variant="outline" onClick={scrollDown}>
          Down 120px
        </Button>
        <Button variant="outline" onClick={scrollToBottom}>
          Bottom
        </Button>
        <span className="font-mono text-mono-meta text-foreground-muted">
          scrollTop: {Math.round(top)}
        </span>
      </div>
      <ScrollArea
        ref={ref}
        role="region"
        aria-label="Weekly notes"
        onScroll={trackTop}
        className="h-56 w-full rounded-container border border-line-hairline bg-layer-canvas"
        contentClassName="px-4"
      >
        {sections.map((section) => (
          <section key={section} className="py-2.5">
            <h4 className="text-sm font-bold text-foreground">{section}</h4>
            <p className="text-sm text-foreground-muted">
              Shipped the sidebar sections, fixed the composer's paste of large files, and moved the
              release checks into CI.
            </p>
          </section>
        ))}
      </ScrollArea>
    </div>
  );
}

// @docs-source-strip-start
export function ScrollAreaScrollToComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ScrollAreaScrollToContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
