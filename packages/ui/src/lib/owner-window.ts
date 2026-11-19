/**
 * The document and the window a node belongs to, for code that must also work
 * where raft-ui renders into another document: a window opened with
 * `window.open`, or an iframe, under `PortalContainerProvider`
 * (popover.md, "Rendering in another window"). A node of another window is an
 * object of that window: `instanceof HTMLElement` is false for it, its events
 * reach that window's listeners, and its layout is that window's viewport.
 *
 * A node of the page's own document gives the global `window` itself, not
 * `document.defaultView`. In a browser the two are the same object; in jsdom
 * they are not, and a test stubs the globals (`vi.stubGlobal`), so the page's
 * own nodes read exactly what they read before these helpers.
 */

/** The document `node` is in: itself for a document, the global `document` for none. */
export function ownerDocument(node: Node | null | undefined): Document {
  if (!node) return document;
  if (node.nodeType === 9) return node as Document;
  return node.ownerDocument ?? document;
}

/** The window of the document `node` is in: the global `window` for the page's own document and for none. */
export function ownerWindow(node: Node | null | undefined): Window & typeof globalThis {
  const doc = ownerDocument(node);
  if (doc === document) return window;
  return (doc.defaultView as (Window & typeof globalThis) | null) ?? window;
}

/** Whether `value` is a DOM node, of this window or of another. */
export function isNode(value: unknown): value is Node {
  return (
    typeof value === "object" && value !== null && typeof (value as Node).nodeType === "number"
  );
}

/** Whether `value` is an element, of this window or of another. */
export function isElement(value: unknown): value is Element {
  return isNode(value) && value.nodeType === 1;
}

/** Whether `value` is an HTML element, of this window or of another. */
export function isHTMLElement(value: unknown): value is HTMLElement {
  return isElement(value) && value instanceof ownerWindow(value).HTMLElement;
}
