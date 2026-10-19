const TEXT_NODE = 3;
const SHOW_TEXT = 4;

type RectLike = { top: number; right: number; bottom: number; left: number };

export type MessageTextSelectionAnchor = {
  contextElement?: Element;
  getBoundingClientRect: () => DOMRect;
  getClientRects: () => DOMRect[];
};

function toDOMRect({ top, right, bottom, left }: RectLike): DOMRect {
  return {
    x: left,
    y: top,
    top,
    right,
    bottom,
    left,
    width: right - left,
    height: bottom - top,
    toJSON() {
      return {
        x: left,
        y: top,
        top,
        right,
        bottom,
        left,
        width: right - left,
        height: bottom - top,
      };
    },
  } as DOMRect;
}

function textRects(range: Range): DOMRect[] {
  const ownerDocument = range.startContainer.ownerDocument;
  const root = range.commonAncestorContainer;
  if (!ownerDocument) return [];

  const rects: DOMRect[] = [];
  const collect = (node: Node) => {
    const part = ownerDocument.createRange();
    part.selectNodeContents(node);
    if (node === range.startContainer) part.setStart(node, range.startOffset);
    if (node === range.endContainer) part.setEnd(node, range.endOffset);
    for (const rect of Array.from(part.getClientRects())) {
      if (rect.width > 0 && rect.height > 0) rects.push(rect);
    }
  };

  if (root.nodeType === TEXT_NODE) {
    collect(root);
    return rects;
  }

  const walker = ownerDocument.createTreeWalker(root, SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (range.intersectsNode(node)) collect(node);
  }
  return rects;
}

function sameLine(a: RectLike, b: RectLike) {
  const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return overlap > Math.min(a.bottom - a.top, b.bottom - b.top) / 2;
}

/**
 * The box of the line the selection's focus end is on: the text of the range
 * on that line, not the whole range's bounding box (a whole-line or
 * multi-block selection spans the row, and its center is nowhere near where
 * the person let go). Element boxes are skipped, so a triple-click that ends
 * at the start of the next block still lands on the last selected line.
 */
export function getTextSelectionFocusRect(range: Range, backward = false): DOMRect {
  const rects = textRects(range);
  const focus = backward ? rects[0] : rects[rects.length - 1];
  if (!focus) return range.getBoundingClientRect();

  const line = { top: focus.top, right: focus.right, bottom: focus.bottom, left: focus.left };
  for (const rect of rects) {
    if (!sameLine(rect, focus)) continue;
    line.top = Math.min(line.top, rect.top);
    line.right = Math.max(line.right, rect.right);
    line.bottom = Math.max(line.bottom, rect.bottom);
    line.left = Math.min(line.left, rect.left);
  }
  return toDOMRect(line);
}

function isBackward(selection: Selection) {
  const direction = (selection as Selection & { direction?: string }).direction;
  if (direction) return direction === "backward";

  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  if (!anchorNode || !focusNode || !anchorNode.ownerDocument) return false;
  if (anchorNode === focusNode) return focusOffset < anchorOffset;
  const probe = anchorNode.ownerDocument.createRange();
  probe.setStart(anchorNode, anchorOffset);
  probe.setEnd(focusNode, focusOffset);
  return probe.collapsed;
}

/**
 * A positioning anchor for the toolbar over selected text: it measures the
 * line the selection's focus end is on, each time it is read, so the toolbar
 * follows the text when it scrolls. Pass it to `PopoverContent`'s `anchor`.
 * Returns `null` when nothing is selected.
 */
export function createMessageTextSelectionAnchor(
  selection: Selection,
  contextElement?: Element,
): MessageTextSelectionAnchor | null {
  if (selection.isCollapsed || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0).cloneRange();
  const backward = isBackward(selection);
  const getBoundingClientRect = () => getTextSelectionFocusRect(range, backward);

  return {
    contextElement,
    getBoundingClientRect,
    getClientRects: () => [getBoundingClientRect()],
  };
}
