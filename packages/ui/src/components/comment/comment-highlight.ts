import { ownerWindow } from "../../lib/owner-window";

/** The highlight of every passage that has comments (`::highlight(raft-comment)` in styles.css). */
export const COMMENT_HIGHLIGHT = "raft-comment";

/** The highlight of the passage of the open discussion (`::highlight(raft-comment-active)`). */
export const COMMENT_HIGHLIGHT_ACTIVE = "raft-comment-active";

/**
 * Highlights the passages comments are on with the CSS Custom Highlight API,
 * so the document's DOM is never changed: no `<mark>` is wrapped around its
 * text. Register the ranges of every anchored comment under
 * `COMMENT_HIGHLIGHT`, and the open discussion's under
 * `COMMENT_HIGHLIGHT_ACTIVE`, which paints over it. Passing no ranges clears
 * the name. Returns a function that clears it.
 *
 * The highlight is registered in the window the passages are in, read from
 * the first range's `startContainer`: a document rendered into another window
 * (popover.md, "Rendering in another window") is painted by that window's
 * `CSS.highlights`, not the page's. Passing no ranges has nothing to read it
 * from: pass `within`, any node of that document, to clear the name there
 * (the page's own window without it).
 *
 * Where the browser has no `CSS.highlights`, it does nothing: the passages are
 * not highlighted, and the cards still say where they belong.
 */
export function setCommentHighlights(
  name: string,
  ranges: Iterable<Range>,
  within?: Node | null,
): () => void {
  if (typeof window === "undefined") return () => {};
  const list = [...ranges];
  const view = ownerWindow(list[0]?.startContainer ?? within);
  const registry = typeof view.CSS === "undefined" ? undefined : view.CSS.highlights;
  if (!registry || typeof view.Highlight === "undefined") return () => {};
  if (list.length === 0) {
    registry.delete(name);
    return () => {};
  }
  const highlight = new view.Highlight(...list);
  if (name === COMMENT_HIGHLIGHT_ACTIVE) highlight.priority = 1;
  registry.set(name, highlight);
  return () => {
    if (registry.get(name) === highlight) registry.delete(name);
  };
}
