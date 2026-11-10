import { useLayoutEffect, useState } from "react";

/**
 * How many times `element` has been attached to its document after it was
 * committed outside it: 0 for an element that was in the document when it
 * mounted, the usual case. A component built on a Base UI composite (a
 * Toolbar, a RadioGroup) uses it to make its items register again.
 *
 * Why: Base UI's composite list numbers only the items that are connected
 * when it takes its snapshot, on the commit an item registers in, and
 * attaching a subtree later registers nothing again. A toolbar rendered into
 * a host the page attaches after its first commit (a side area's section, a
 * portal that mounts later) kept every item at `tabIndex` -1, so Tab passed
 * over it and only a remount brought its Tab stop back (slock #14149).
 *
 * It watches the document only while the element is detached, and stops once
 * it is attached.
 *
 * @param element The composite's root, as state (null before it mounts).
 * @returns A count that changes when the element gets attached.
 */
export function useAttachCount(element: Element | null): number {
  const [count, setCount] = useState(0);
  useLayoutEffect(() => {
    if (!element || element.isConnected || typeof MutationObserver === "undefined") return;
    const root = element.ownerDocument.documentElement;
    const observer = new MutationObserver(() => {
      if (!element.isConnected) return;
      observer.disconnect();
      setCount((previous) => previous + 1);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [element]);
  return count;
}
