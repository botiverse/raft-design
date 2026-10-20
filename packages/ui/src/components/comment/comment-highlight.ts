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
 * Where the browser has no `CSS.highlights`, it does nothing: the passages are
 * not highlighted, and the cards still say where they belong.
 */
export function setCommentHighlights(name: string, ranges: Iterable<Range>): () => void {
  const registry = typeof CSS === "undefined" ? undefined : CSS.highlights;
  if (!registry || typeof Highlight === "undefined") return () => {};
  const list = [...ranges];
  if (list.length === 0) {
    registry.delete(name);
    return () => {};
  }
  const highlight = new Highlight(...list);
  if (name === COMMENT_HIGHLIGHT_ACTIVE) highlight.priority = 1;
  registry.set(name, highlight);
  return () => {
    if (registry.get(name) === highlight) registry.delete(name);
  };
}
