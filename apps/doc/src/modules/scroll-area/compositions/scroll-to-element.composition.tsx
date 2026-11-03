import { useCallback, useRef } from "react";
import type { MouseEvent } from "react";
import { Button, ScrollArea } from "@botiverse/raft-ui";
import type { ScrollAreaActions } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const chapters = Array.from({ length: 6 }, (_, index) => ({
  id: `handbook-chapter-${index + 1}`,
  title: `Chapter ${index + 1}`,
}));
/** The sticky header's height: the chapter scrolled to starts just below it, and so does the scrollbar. */
const HEADER_HEIGHT = 40;
const HEADER_INSET = { top: HEADER_HEIGHT };

export function ScrollAreaScrollToElementContent() {
  const actions = useRef<ScrollAreaActions>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const jump = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const target = areaRef.current?.querySelector(`#${event.currentTarget.value}`);
    if (target) {
      actions.current?.scrollToElement(target, { behavior: "smooth", offset: HEADER_HEIGHT });
    }
  }, []);

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {chapters.map((chapter) => (
          <Button key={chapter.id} variant="outline" value={chapter.id} onClick={jump}>
            {chapter.title}
          </Button>
        ))}
      </div>
      <ScrollArea
        ref={areaRef}
        actionsRef={actions}
        aria-label="Handbook"
        railInset={HEADER_INSET}
        className="h-56 w-full rounded-container border border-line-hairline bg-layer-canvas"
      >
        <header className="sticky top-0 flex h-10 items-center border-b border-line-hairline bg-layer-canvas px-4 text-sm font-bold text-foreground">
          Handbook
        </header>
        <div className="px-4">
          {chapters.map((chapter) => (
            <section key={chapter.id} id={chapter.id} className="py-2.5">
              <h4 className="text-sm font-bold text-foreground">{chapter.title}</h4>
              <p className="text-sm text-foreground-muted">
                How the team plans a release: who owns the checklist, when the branch is cut, and
                how a fix makes it in after that.
              </p>
            </section>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// @docs-source-strip-start
export function ScrollAreaScrollToElementComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ScrollAreaScrollToElementContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
