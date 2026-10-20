import { useEffect, useState } from "react";
import {
  COMMENT_HIGHLIGHT,
  COMMENT_HIGHLIGHT_ACTIVE,
  setCommentHighlights,
} from "@botiverse/raft-ui/wip";

/**
 * The range of the first place `quote` appears in `root`'s text, across
 * element boundaries, or null when the document no longer has it (the
 * passage was edited or deleted). How a product stores an anchor is its own
 * business; a quote is the simplest that survives a re-render.
 */
export function findQuote(root: Node, quote: string): Range | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let text = "";
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    nodes.push(node as Text);
    text += node.nodeValue ?? "";
  }
  const start = text.indexOf(quote);
  if (start < 0 || quote.length === 0) return null;
  const end = start + quote.length;
  const range = document.createRange();
  let offset = 0;
  for (const node of nodes) {
    const length = node.length;
    if (start >= offset && start <= offset + length) range.setStart(node, start - offset);
    if (end >= offset && end <= offset + length) {
      range.setEnd(node, end - offset);
      break;
    }
    offset += length;
  }
  return range;
}

/**
 * Finds each quote in the document and measures how far below the margin's
 * top its first line is, again whenever either one changes size (the window
 * narrows, the text rewraps). A quote that isn't found has no top.
 */
export function useCommentAnchors<Id extends string>(
  documentElement: HTMLElement | null,
  marginElement: HTMLElement | null,
  quotes: Record<Id, string>,
) {
  const [anchors, setAnchors] = useState<{
    ranges: Partial<Record<Id, Range>>;
    tops: Partial<Record<Id, number>>;
  }>({ ranges: {}, tops: {} });

  useEffect(() => {
    if (!documentElement || !marginElement) return;
    const ranges: Partial<Record<Id, Range>> = {};
    for (const id of Object.keys(quotes) as Id[]) {
      const range = findQuote(documentElement, quotes[id]);
      if (range) ranges[id] = range;
    }
    const measure = () => {
      const origin = marginElement.getBoundingClientRect().top;
      const tops: Partial<Record<Id, number>> = {};
      for (const id of Object.keys(ranges) as Id[]) {
        const line = ranges[id]!.getClientRects()[0];
        if (line) tops[id] = Math.round(line.top - origin);
      }
      setAnchors({ ranges, tops });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(documentElement);
    observer.observe(marginElement);
    return () => observer.disconnect();
  }, [documentElement, marginElement, quotes]);

  return anchors;
}

/** Highlights every anchored passage, and the open discussion's more strongly. */
export function useCommentHighlights(
  ranges: Partial<Record<string, Range>>,
  activeId: string | null,
) {
  useEffect(() => {
    const entries = Object.entries(ranges) as [string, Range][];
    const clearAll = setCommentHighlights(
      COMMENT_HIGHLIGHT,
      entries.filter(([id]) => id !== activeId).map(([, range]) => range),
    );
    const active = activeId ? ranges[activeId] : undefined;
    const clearActive = setCommentHighlights(COMMENT_HIGHLIGHT_ACTIVE, active ? [active] : []);
    return () => {
      clearAll();
      clearActive();
    };
  }, [ranges, activeId]);
}
