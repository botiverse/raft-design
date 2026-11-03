import { useCallback, useLayoutEffect, useRef } from "react";
import type { Ref } from "react";

/** A ref useMergedRef has attached, or will attach once there is an element. */
type AttachedRef<E> = {
  ref: NonNullable<Ref<E>>;
  /** What attaching returned: a callback ref's cleanup (React 19), or null. */
  cleanup: (() => void) | null;
};

function attach<E>(ref: NonNullable<Ref<E>>, el: E): (() => void) | null {
  if (typeof ref == "function") {
    const cleanup = ref(el);
    return typeof cleanup == "function" ? cleanup : null;
  }
  ref.current = el;
  return null;
}

/** Detaches as React does: a returned cleanup runs instead of the callback getting `null`. */
function detach<E>(entry: AttachedRef<E>) {
  const { ref, cleanup } = entry;
  entry.cleanup = null;
  if (cleanup != null) {
    cleanup();
  } else if (typeof ref == "function") {
    ref(null);
  } else {
    ref.current = null;
  }
}

/**
 * Merges refs into one setter, so they behave as if each were passed straight to the element.
 * Returns `[setRef, getRef]`: `setRef(el)` is stable and attaches every ref to `el` (detaching
 * them from the element before); `getRef()` reads the element.
 *
 * Refs are attached at commit, in a layout effect: all of them on mount, and a ref that changes
 * between renders is swapped there (the old one detached, the new one attached to the element).
 * Nothing runs while rendering, so a render that never commits, such as a transition that
 * suspends and is abandoned, calls no ref. Callers' layout effects that read what a ref wrote
 * must come after this hook (they run in order).
 *
 * So on mount a merged ref is set later than a native one, which reaches its ref while React
 * attaches refs, before any layout effect:
 *
 * - Anything that reads a merged ref from the element's own ref callback, or from a side channel
 *   that callback calls synchronously (an `onRefUpdate`-style callback), sees `null` on mount. Read
 *   the element the callback was given instead.
 * - Each hop adds a layout effect: a ref merged by a component, passed to another that merges it
 *   again (ScrollArea's `ref`, merged by `useScrollAreaContainer`), is set in the inner
 *   component's layout effect, before the outer one's. Layout effects of a component between the
 *   two hops, or of a child of the element, run before it is set.
 * - An ancestor's layout effects still see every hop set: they run after the descendants' in the
 *   same commit.
 *
 * As in React 19, a ref callback may return a
 * cleanup, which runs on detach instead of the callback getting `null`; an object ref gets `null`
 * on detach.
 */
export function useMergedRef<E>(
  ...refs: (Ref<E> | undefined)[]
): [setRef: (el: E | null) => void, getRef: () => E | null] {
  const elementRef = useRef<E | null>(null);
  // The refs as of the last commit. Empty until the first layout effect: on mount React passes the
  // element to setRef just before it, and the effect then attaches every ref.
  const attachedRef = useRef<readonly (AttachedRef<E> | null)[]>([]);
  const getRef = useCallback(() => elementRef.current, []);
  const setRef = useCallback((el: E | null) => {
    const previous = elementRef.current;
    if (previous === el) return;
    if (previous !== null) {
      for (const entry of attachedRef.current) if (entry != null) detach(entry);
    }
    elementRef.current = el;
    if (el !== null) {
      for (const entry of attachedRef.current) {
        if (entry != null) entry.cleanup = attach(entry.ref, el);
      }
    }
  }, []);
  useLayoutEffect(() => {
    const attached = attachedRef.current;
    const el = elementRef.current;
    let changed = attached.length !== refs.length;
    const next = refs.map((given, i) => {
      const ref = given ?? null;
      const entry = attached[i] ?? null;
      if (entry?.ref === ref) return entry;
      changed = true;
      if (entry != null && el !== null) detach(entry);
      return ref == null ? null : { ref, cleanup: el === null ? null : attach(ref, el) };
    });
    for (let i = refs.length; i < attached.length; i++) {
      const entry = attached[i];
      if (entry != null && el !== null) detach(entry);
    }
    if (changed) attachedRef.current = next;
  });
  return [setRef, getRef];
}
