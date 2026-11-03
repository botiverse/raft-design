/**
 * @vitest-environment jsdom
 *
 * useMergedRef: the merged refs behave as if each were passed straight to the element. A ref is
 * attached and detached only at commit (an abandoned transition calls none of them), a callback's
 * returned cleanup runs on detach instead of the callback getting null, and an object ref gets
 * null on detach.
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Suspense, startTransition, useLayoutEffect, useState } from "react";
import type { Ref } from "react";
import { useMergedRef } from "./use-merged-ref";

afterEach(() => {
  cleanup();
});

type Callback = (el: HTMLElement | null) => void | (() => void);
const callbackRef = () => vi.fn<Callback>();
const objectRef = () => ({ current: null as HTMLElement | null });

function Box({ a, b, c }: { a?: Ref<HTMLElement>; b?: Ref<HTMLElement>; c?: Ref<HTMLElement> }) {
  const [setRef] = useMergedRef(a, b, c);
  return <div data-testid="box" ref={setRef} />;
}

test("attaches every ref at mount and detaches them on unmount", () => {
  const callback = callbackRef();
  const object = objectRef();
  const view = render(<Box a={callback} b={object} />);
  const box = view.getByTestId("box");
  expect(callback.mock.calls).toEqual([[box]]);
  expect(object.current).toBe(box);
  view.unmount();
  expect(callback.mock.calls).toEqual([[box], [null]]);
  expect(object.current).toBe(null);
});

test("a changed ref is swapped at commit, and the others are left alone", () => {
  const kept = callbackRef();
  const before = callbackRef();
  const after = callbackRef();
  const objectBefore = objectRef();
  const objectAfter = objectRef();
  const view = render(<Box a={kept} b={before} c={objectBefore} />);
  const box = view.getByTestId("box");
  view.rerender(<Box a={kept} b={after} c={objectAfter} />);
  expect(kept.mock.calls).toEqual([[box]]);
  expect(before.mock.calls).toEqual([[box], [null]]);
  expect(after.mock.calls).toEqual([[box]]);
  expect(objectBefore.current).toBe(null);
  expect(objectAfter.current).toBe(box);
  view.rerender(<Box a={kept} />);
  expect(after.mock.calls).toEqual([[box], [null]]);
  expect(objectAfter.current).toBe(null);
  expect(kept.mock.calls).toEqual([[box]]);
});

test("setRef and getRef keep their identity, and getRef reads the element", () => {
  const seen: [(el: HTMLElement | null) => void, () => HTMLElement | null][] = [];
  function Probe({ ref }: { ref: Ref<HTMLElement> }) {
    const [setRef, getRef] = useMergedRef(ref);
    useLayoutEffect(() => {
      seen.push([setRef, getRef]);
    });
    return <div data-testid="box" ref={setRef} />;
  }
  const view = render(<Probe ref={callbackRef()} />);
  view.rerender(<Probe ref={callbackRef()} />);
  expect(seen).toHaveLength(2);
  const [[firstSet, firstGet], [lastSet, lastGet]] = [seen[0]!, seen[1]!];
  expect(lastSet).toBe(firstSet);
  expect(lastGet).toBe(firstGet);
  expect(lastGet()).toBe(view.getByTestId("box"));
});

const never = new Promise<never>(() => {});

// Thrown rather than passed to `use`, so `act` flushes the suspended render and returns.
function Suspend(): never {
  throw never;
}

function AbandonedTransition({
  committed,
  abandoned,
}: {
  committed: Ref<HTMLElement>;
  abandoned: Ref<HTMLElement>;
}) {
  const [which, setWhich] = useState<"committed" | "abandoned">("committed");
  const abandon = () => startTransition(() => setWhich("abandoned"));
  const restore = () => setWhich("committed");
  return (
    <>
      <button type="button" onClick={abandon}>
        abandon
      </button>
      <button type="button" onClick={restore}>
        restore
      </button>
      <Suspense fallback={null}>
        <Box a={which === "committed" ? committed : abandoned} />
        {which === "abandoned" ? <Suspend /> : null}
      </Suspense>
    </>
  );
}

test("a transition that suspends and is abandoned calls neither the old ref nor the new one", () => {
  const committed = callbackRef();
  const abandoned = callbackRef();
  const view = render(<AbandonedTransition committed={committed} abandoned={abandoned} />);
  const box = view.getByTestId("box");
  expect(committed.mock.calls).toEqual([[box]]);
  // The transition renders Box with the new callback, then suspends: React keeps the committed
  // screen and never commits that render.
  act(() => {
    fireEvent.click(view.getByRole("button", { name: "abandon" }));
  });
  expect(view.getByTestId("box")).toBe(box);
  expect(abandoned).not.toHaveBeenCalled();
  expect(committed.mock.calls).toEqual([[box]]);
  // An urgent update back to the committed ref supersedes the transition.
  act(() => {
    fireEvent.click(view.getByRole("button", { name: "restore" }));
  });
  expect(abandoned).not.toHaveBeenCalled();
  expect(committed.mock.calls).toEqual([[box]]);
});

test("a callback's returned cleanup runs on detach instead of the callback getting null", () => {
  const cleanupBefore = vi.fn();
  const before = vi.fn<Callback>(() => cleanupBefore);
  const cleanupAfter = vi.fn();
  const after = vi.fn<Callback>(() => cleanupAfter);
  const view = render(<Box a={before} />);
  const box = view.getByTestId("box");
  expect(before.mock.calls).toEqual([[box]]);
  view.rerender(<Box a={after} />);
  expect(cleanupBefore).toHaveBeenCalledTimes(1);
  expect(before.mock.calls).toEqual([[box]]);
  expect(after.mock.calls).toEqual([[box]]);
  expect(cleanupAfter).not.toHaveBeenCalled();
  view.unmount();
  expect(cleanupAfter).toHaveBeenCalledTimes(1);
  expect(after.mock.calls).toEqual([[box]]);
});

test("a cleanup-returning callback gets a fresh cleanup when the element is replaced", () => {
  const cleanups: HTMLElement[] = [];
  const callback = vi.fn<Callback>((el) => {
    if (el === null) throw new Error("the cleanup runs instead");
    return () => {
      cleanups.push(el);
    };
  });
  function Swap({ which }: { which: "a" | "b" }) {
    const [setRef] = useMergedRef<HTMLElement>(callback);
    return which === "a" ? (
      <div data-testid="a" ref={setRef} />
    ) : (
      <span data-testid="b" ref={setRef} />
    );
  }
  const view = render(<Swap which="a" />);
  const a = view.getByTestId("a");
  view.rerender(<Swap which="b" />);
  const b = view.getByTestId("b");
  expect(callback.mock.calls).toEqual([[a], [b]]);
  expect(cleanups).toEqual([a]);
  view.unmount();
  expect(cleanups).toEqual([a, b]);
});
