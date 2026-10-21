import { useLayoutEffect, useMemo, useRef } from "react";
import type { DependencyList } from "react";

/**
 * `useMemo(() => fn(previousDeps), deps)`: runs `fn` while rendering whenever `deps` change, with the
 * deps of the last committed render (`undefined` before the first commit).
 *
 * The previous deps are recorded at commit, not inside the memo: React may call a memo's function
 * more than once for one render (StrictMode does on purpose) or throw a render away, and either
 * would otherwise pass this render's own deps as `previous`.
 */
export function useMemoWithPrevious<D extends DependencyList>(
  fn: (previous: D | undefined) => void,
  deps: D,
): void {
  const previousRef = useRef<D | undefined>(undefined);
  const previous = previousRef.current;
  useMemo(() => {
    fn(previous);
    // oxlint-disable-next-line react/exhaustive-deps -- the caller's deps, passed through
  }, deps);
  useLayoutEffect(() => {
    previousRef.current = deps;
  });
}
