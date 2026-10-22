import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";
import { measureElement, observeTruncation } from "./truncation";
import type { Truncation } from "./truncation";

/**
 * Whether the text in the element `ref` points at is cut off by its CSS
 * (`truncate`, `line-clamp`, a fixed size with `overflow: hidden`): `true`,
 * `false`, or `undefined` until it is measured or while it has no box.
 *
 * It measures fractional sizes with a 0.5px tolerance, past either inline
 * edge and below the bottom edge, so it needs no line count. It measures again
 * when the element changes size, when its text changes and when a web font
 * finishes loading, in one batched frame for every measured element on the
 * page (lib/truncation.ts), before that frame paints.
 *
 * The element is read when the component mounts: keep `ref` on one element
 * for the component's life, or give the component a `key` that changes with
 * the element.
 */
export function useTruncated(ref: RefObject<Element | null>): Truncation {
  const [truncated, setTruncated] = useState<Truncation>(undefined);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    return observeTruncation({
      observe: () => [element],
      watch: () => element,
      read: () => measureElement(element),
      commit: setTruncated,
    });
  }, [ref]);
  return truncated;
}
