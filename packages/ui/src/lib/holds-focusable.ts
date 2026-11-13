import { useEffect, useState } from "react";

// The Tab-stop rule of a body that scrolls in a ScrollArea (DialogBody and
// DrawerBody with `unstable_scrollArea`): a Tab stop only while it overflows
// and holds nothing Tab stops at, as a native scroller is in Chromium.

const FOCUSABLE =
  'a[href], button, input:not([type="hidden"]), select, textarea, summary, iframe, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]';

/** Whether Tab stops at `candidate`: enabled, not inert, and rendered. */
function takesTab(candidate: HTMLElement) {
  // An editable region's `tabIndex` is -1 in Chromium, yet Tab stops at it.
  if (!candidate.isContentEditable && candidate.tabIndex < 0) return false;
  if (candidate.matches(":disabled") || candidate.closest("[inert]")) return false;
  // `display: none`, `hidden` and `visibility: hidden` take a control out of
  // the Tab order. Where the browser can't say (jsdom), it counts as shown.
  if (typeof candidate.checkVisibility !== "function") return true;
  return candidate.checkVisibility({ visibilityProperty: true });
}

/** Whether `element` holds something Tab stops at, kept current as its content changes. */
export function useHoldsFocusable(element: HTMLElement | null) {
  const [holds, setHolds] = useState(true);
  useEffect(() => {
    if (!element) return;
    const read = () => {
      for (const candidate of element.querySelectorAll<HTMLElement>(FOCUSABLE)) {
        if (takesTab(candidate)) {
          setHolds(true);
          return;
        }
      }
      setHolds(false);
    };
    read();
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(read);
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      // What can make a control take Tab or stop taking it, hiding included.
      attributeFilter: [
        "disabled",
        "tabindex",
        "href",
        "inert",
        "contenteditable",
        "hidden",
        "class",
        "style",
        "open",
      ],
    });
    return () => observer.disconnect();
  }, [element]);
  return holds;
}
