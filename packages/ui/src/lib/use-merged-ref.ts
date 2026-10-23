/* oxlint-disable react/immutability, react/refs -- the entries are a per-instance mutable record of
   the refs given (kept in a memo, not state), and the stored element is handed to a ref that changes
   while rendering, as the callers expect. */
import { useCallback, useMemo, useRef } from "react";
import type { Ref, RefCallback, RefObject } from "react";

/** What useMergedRef keeps for each ref it was given. */
type MergedRefEntry<E> =
  | { type: "RefCallback"; ref: RefCallback<E> }
  | { type: "RefObject"; ref: RefObject<E | null> };

/**
 * Merges refs into one setter. Returns `[setRef, getRef]`: `setRef(el)` stores `el` and passes it to
 * every ref; `getRef()` reads the stored element. When a ref changes between renders (checked while
 * rendering), the old one is cleared and the new one gets the stored element at once. The setter
 * calls ref callbacks itself, so what they return is ignored.
 */
export function useMergedRef<E>(
  ...refs: (Ref<E> | undefined)[]
): [setRef: (el: E | null) => void, getRef: () => E | null] {
  const entries = useMemo<(MergedRefEntry<E> | null | undefined)[]>(() => [], []);
  const elementRef = useRef<E | null>(null);
  const getRef = useCallback(() => elementRef.current, []);
  const clearEntry = useCallback((entry: MergedRefEntry<E> | null | undefined) => {
    if (entry != null) {
      if (entry.type === "RefCallback") {
        entry.ref(null);
      } else {
        entry.ref.current = null;
      }
    }
  }, []);
  const applyStoredElement = useCallback(
    (ref: RefCallback<E> | RefObject<E | null>) => {
      if (typeof ref == "function") {
        ref(getRef());
      } else {
        ref.current = getRef();
      }
    },
    [getRef],
  );
  const setRef = useCallback(
    (el: E | null) => {
      elementRef.current = el;
      for (const entry of entries) {
        if (entry == null) {
          continue;
        } else if (entry.type === "RefObject") {
          entry.ref.current = el;
        } else {
          entry.ref(el);
        }
      }
    },
    [entries],
  );
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    const entry = entries[i];
    if (ref == null) {
      clearEntry(entry);
      entries[i] = null;
    } else {
      if (entry && entry.ref === ref) {
        continue;
      }
      if (typeof ref == "function") {
        if (entry != null) {
          clearEntry(entry);
        }
        entries[i] = { type: "RefCallback", ref };
      } else {
        if (entry != null) {
          clearEntry(entry);
        }
        entries[i] = { type: "RefObject", ref };
      }
      applyStoredElement(ref);
    }
  }
  for (let i = refs.length; i < entries.length; i++) {
    clearEntry(entries[i]);
    entries[i] = null;
  }
  return [setRef, getRef];
}
