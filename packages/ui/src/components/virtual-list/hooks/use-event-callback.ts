import { useCallback, useRef } from "react";

/** A stable function that calls the `fn` of the latest render. */
export function useEventCallback<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const fnRef = useRef(fn);
  // oxlint-disable-next-line react/refs -- assigned while rendering, so callbacks called during render see this render's fn
  fnRef.current = fn;
  return useCallback((...args: A) => fnRef.current(...args), []);
}
