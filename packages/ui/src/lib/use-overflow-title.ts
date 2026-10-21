import { useCallback, useRef } from "react";
import type { Ref, RefCallback } from "react";

function cut(element: Element) {
  return (
    element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1
  );
}

function assign<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

/**
 * Gives a value that is cut off (an ellipsis, a clamp) its whole text as its
 * `title`, and takes it away again when the value fits: a value that shows in
 * full needs no tooltip repeating it (design/patterns/forms.md#long-values-in-fields).
 * It watches the element and its children, so a part whose text sits in a
 * child that truncates (a chip's label) is covered too. A `title` the caller
 * passes wins, and is never touched.
 */
export function useOverflowTitle<T extends HTMLElement>(
  ref?: Ref<T>,
  title?: string,
): RefCallback<T> {
  const cleanup = useRef<() => void>(undefined);
  const own = title !== undefined;

  return useCallback(
    (node: T | null) => {
      cleanup.current?.();
      cleanup.current = undefined;
      assign(ref, node);
      const view = node?.ownerDocument.defaultView;
      if (!node || own || !view || !("ResizeObserver" in view)) return;

      const update = () => {
        const text = node.textContent?.trim() ?? "";
        if (text && (cut(node) || Array.from(node.children).some(cut))) node.title = text;
        else node.removeAttribute("title");
      };
      // Measured only from the observers, which report once layout is done:
      // reading sizes while React commits would force a style pass early, and
      // a field mounting under a theme scope would then animate into its colors.
      const resize = new view.ResizeObserver(update);
      resize.observe(node);
      for (const child of Array.from(node.children)) resize.observe(child);
      const mutation = new view.MutationObserver(update);
      mutation.observe(node, { childList: true, characterData: true, subtree: true });
      cleanup.current = () => {
        resize.disconnect();
        mutation.disconnect();
      };
    },
    [own, ref],
  );
}
