/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { COMMENT_HIGHLIGHT, setCommentHighlights } from "./comment-highlight";

// jsdom has no CSS Custom Highlight API: each window gets a registry and a
// Highlight constructor of its own, so the test sees which one was used.
class FakeHighlight {
  ranges: Range[];
  priority = 0;
  constructor(...ranges: Range[]) {
    this.ranges = ranges;
  }
}

function giveHighlights(view: object) {
  const highlights = new Map<string, unknown>();
  Object.defineProperty(view, "CSS", { value: { highlights }, configurable: true });
  Object.defineProperty(view, "Highlight", { value: FakeHighlight, configurable: true });
  return highlights;
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

test("ranges of another window are registered in that window's CSS.highlights", () => {
  const page = new Map<string, unknown>();
  vi.stubGlobal("CSS", { highlights: page });
  vi.stubGlobal("Highlight", FakeHighlight);
  const frame = document.createElement("iframe");
  document.body.append(frame);
  const other = frame.contentWindow!;
  const registry = giveHighlights(other);
  const doc = frame.contentDocument!;
  doc.body.textContent = "A passage with a comment";
  const range = doc.createRange();
  range.selectNodeContents(doc.body);

  const clear = setCommentHighlights(COMMENT_HIGHLIGHT, [range]);
  const highlight = registry.get(COMMENT_HIGHLIGHT) as FakeHighlight;
  expect(highlight).toBeInstanceOf(FakeHighlight);
  expect(highlight.ranges).toEqual([range]);
  expect(page.size).toBe(0);

  clear();
  expect(registry.has(COMMENT_HIGHLIGHT)).toBe(false);

  // No ranges: `within` names the window whose highlight is cleared.
  setCommentHighlights(COMMENT_HIGHLIGHT, [range]);
  page.set(COMMENT_HIGHLIGHT, "the page's own");
  setCommentHighlights(COMMENT_HIGHLIGHT, [], doc.body);
  expect(registry.has(COMMENT_HIGHLIGHT)).toBe(false);
  expect(page.get(COMMENT_HIGHLIGHT)).toBe("the page's own");
});

test("ranges of the page are registered in the page's CSS.highlights", () => {
  const page = new Map<string, unknown>();
  vi.stubGlobal("CSS", { highlights: page });
  vi.stubGlobal("Highlight", FakeHighlight);
  document.body.textContent = "A passage";
  const range = document.createRange();
  range.selectNodeContents(document.body);
  setCommentHighlights(COMMENT_HIGHLIGHT, [range]);
  expect(page.get(COMMENT_HIGHLIGHT)).toBeInstanceOf(FakeHighlight);
});
