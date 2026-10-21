import { useRef } from "react";
import type { RefObject } from "react";

/** A ref whose `current` is the value of the latest render. */
export function useLatestRef<V>(value: V): RefObject<V> {
  const ref = useRef(value);
  // oxlint-disable-next-line react/refs -- the latest value, read later from callbacks
  ref.current = value;
  return ref;
}
