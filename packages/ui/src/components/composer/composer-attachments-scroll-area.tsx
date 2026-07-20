import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button } from "../button/button";
import { composerAttachment as composerAttachmentRecipe } from "./composer-attachment.recipe";

export type ComposerAttachmentsScrollAreaProps = ComponentPropsWithoutRef<"div">;

export function ComposerAttachmentsScrollArea({
  children,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ComposerAttachmentsScrollAreaProps) {
  const theme = useThemeFamily();
  const { attachmentsScrollArea, attachmentsViewport } = composerAttachmentRecipe({ theme });
  const prevNavClassName = composerAttachmentRecipe({ theme, side: "prev" }).attachmentsNav();
  const nextNavClassName = composerAttachmentRecipe({ theme, side: "next" }).attachmentsNav();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [hovered, setHovered] = useState(false);

  const updateScrollState = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    setOverflowing(maxScrollLeft > 1);
    setCanPrev(viewport.scrollLeft > 1);
    setCanNext(maxScrollLeft - viewport.scrollLeft > 1);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(viewport);
    for (const child of viewport.children) {
      resizeObserver.observe(child);
    }

    const mutationObserver = new MutationObserver(() => {
      for (const child of viewport.children) {
        resizeObserver.observe(child);
      }
      updateScrollState();
    });
    mutationObserver.observe(viewport, { childList: true });

    viewport.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      viewport.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollByPage = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const page = viewport.clientWidth;
    if (page <= 0) return;
    const target = Math.round(viewport.scrollLeft / page) * page + direction * page;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollTo({
      left: target,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const showPrev = overflowing && (hovered || canPrev);
  const showNext = overflowing && (hovered || canNext);

  return (
    <div
      data-slot="composer-attachments-scroll-area"
      className={attachmentsScrollArea({ className })}
      onMouseEnter={(event) => {
        setHovered(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setHovered(false);
        onMouseLeave?.(event);
      }}
      {...props}
    >
      {showPrev ? (
        <Button
          type="button"
          size="icon-sm"
          variant="default"
          aria-label="Scroll attachments left"
          disabled={!canPrev}
          className={prevNavClassName}
          onClick={() => scrollByPage(-1)}
        >
          <ChevronLeft />
        </Button>
      ) : null}
      <div
        ref={viewportRef}
        data-slot="composer-attachments-viewport"
        className={attachmentsViewport()}
      >
        {children}
      </div>
      {showNext ? (
        <Button
          type="button"
          size="icon-sm"
          variant="default"
          aria-label="Scroll attachments right"
          disabled={!canNext}
          className={nextNavClassName}
          onClick={() => scrollByPage(1)}
        >
          <ChevronRight />
        </Button>
      ) : null}
    </div>
  );
}
