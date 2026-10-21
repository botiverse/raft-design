import { useLayoutEffect, useRef } from "react";
import type { DependencyList } from "react";

type Cleanup = (() => void) | void | undefined;

/**
 * `useLayoutEffect(() => fn(previousDeps), deps)`: the layout-effect form of useMemoWithPrevious;
 * `fn` may return a cleanup.
 */
export function useLayoutEffectWithPrevious<D extends DependencyList>(
  fn: (previous: D | undefined) => Cleanup,
  deps: D,
): void {
  const previousRef = useRef<D | undefined>(undefined);
  useLayoutEffect(() => {
    const cleanup = fn(previousRef.current);
    previousRef.current = deps;
    return cleanup;
    // oxlint-disable-next-line react/exhaustive-deps -- the caller's deps, passed through
  }, deps);
}
