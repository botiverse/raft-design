import { useCallback, useRef } from "react";
import type { Ref, RefCallback } from "react";
import { measureElement, observeTruncation } from "./truncation";

function cut(element: Element) {
  return measureElement(element) === true;
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
 *
 * Pass a stable `ref`: a ref object, or a callback ref made with `useCallback`
 * (or defined outside the component). The returned callback ref changes
 * whenever `ref` does, and React then detaches and re-attaches it, so an inline
 * `ref={(node) => ...}` disconnects and rebuilds both observers on every render.
 * The title stays right, but each render pays for new observers and a fresh
 * measurement.
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
      if (!node || own || !view) return;

      // The shared measurer (lib/truncation.ts) reads once layout is done, in
      // a batched frame: reading sizes while React commits would force a
      // style pass early, and a field mounting under a theme scope would then
      // animate into its colors.
      const children = Array.from(node.children);
      cleanup.current = observeTruncation({
        observe: () => [node, ...children],
        watch: () => node,
        read: () => cut(node) || children.some(cut),
        commit: (truncated) => {
          const text = node.textContent?.trim() ?? "";
          if (text && truncated) node.title = text;
          else node.removeAttribute("title");
        },
      });
    },
    [own, ref],
  );
}
