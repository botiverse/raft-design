import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "../button/button";
import { ScrollArea } from "../scroll-area";
import type { ScrollAreaEdges } from "../scroll-area";
import { composerAttachment as composerAttachmentRecipe } from "./composer-attachment.recipe";

export type ComposerAttachmentsScrollAreaProps = ComponentPropsWithoutRef<"div">;

function scrollByPage(viewport: HTMLDivElement | null, direction: -1 | 1) {
  if (!viewport) return;
  const page = viewport.clientWidth;
  if (page <= 0) return;
  const target = Math.round(viewport.scrollLeft / page) * page + direction * page;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  viewport.scrollTo({
    left: target,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

/**
 * One scrolling row of attachments: a horizontal ScrollArea (its thin
 * scrollbar shows only while the row scrolls), with an arrow on each side
 * that has more attachments past it. The ScrollArea reports the edges, so
 * the arrows follow scrolling, resizing and attachments coming and going.
 */
export function ComposerAttachmentsScrollArea({
  children,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ComposerAttachmentsScrollAreaProps) {
  const { attachmentsScrollArea, attachmentsRow } = composerAttachmentRecipe();
  const prevNavClassName = composerAttachmentRecipe({ side: "prev" }).attachmentsNav();
  const nextNavClassName = composerAttachmentRecipe({ side: "next" }).attachmentsNav();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const handleEdgeChange = useCallback((edges: ScrollAreaEdges) => {
    setCanPrev(!edges.left);
    setCanNext(!edges.right);
  }, []);
  const handleScrollPrev = useCallback(() => scrollByPage(viewportRef.current, -1), []);
  const handleScrollNext = useCallback(() => scrollByPage(viewportRef.current, 1), []);

  // Affordances only — never show a dead-end / disabled arrow.
  const showPrev = canPrev;
  const showNext = canNext;
  const navVariant = "default";

  return (
    <div
      data-slot="composer-attachments-scroll-area"
      className={attachmentsScrollArea({ className })}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {showPrev ? (
        <Button
          type="button"
          size="icon-md"
          variant={navVariant}
          aria-label="Scroll attachments left"
          className={prevNavClassName}
          onClick={handleScrollPrev}
        >
          <ChevronLeft />
        </Button>
      ) : null}
      <ScrollArea
        ref={viewportRef}
        data-slot="composer-attachments-viewport"
        orientation="horizontal"
        trigger="scroll"
        size="small"
        overscroll="contain"
        // The attachments themselves take focus and scroll into view; the row
        // is no extra tab stop, as the native row it replaces wasn't.
        tabIndex={-1}
        contentClassName={attachmentsRow()}
        onEdgeChange={handleEdgeChange}
      >
        {children}
      </ScrollArea>
      {showNext ? (
        <Button
          type="button"
          size="icon-md"
          variant={navVariant}
          aria-label="Scroll attachments right"
          className={nextNavClassName}
          onClick={handleScrollNext}
        >
          <ChevronRight />
        </Button>
      ) : null}
    </div>
  );
}
