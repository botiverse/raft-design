/** @vitest-environment jsdom */
import { StrictMode, createRef } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MessageReactionCount } from "./message-reaction";

let reducedMotion: MediaQueryList;
const animations: { cancel: ReturnType<typeof vi.fn> }[] = [];
const animate = vi.fn(() => {
  const animation = { cancel: vi.fn() };
  animations.push(animation);
  return animation as unknown as Animation;
});

beforeEach(() => {
  animations.length = 0;
  animate.mockClear();
  reducedMotion = Object.assign(new EventTarget(), {
    matches: false,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }) as MediaQueryList;
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => reducedMotion),
  );
  vi.spyOn(HTMLElement.prototype, "animate").mockImplementation(animate);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// jsdom has no Web Animations implementation. Assert the actual playback
// requests and lifecycle here; visual timing and geometry require a browser.
Object.defineProperty(HTMLElement.prototype, "animate", {
  configurable: true,
  writable: true,
  value: () => {},
});

test("skips mount and unchanged values; replays increases and decreases without replacing the node", () => {
  const view = (count: number) => (
    <StrictMode>
      <MessageReactionCount>{count}</MessageReactionCount>
    </StrictMode>
  );
  const { container, rerender, unmount } = render(view(2));
  const node = container.firstChild;
  expect(animate).not.toHaveBeenCalled();
  rerender(view(2));
  expect(animate).not.toHaveBeenCalled();
  rerender(view(3));
  expect(animate).toHaveBeenCalledTimes(1);
  expect(animate).toHaveBeenLastCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ transform: "translateY(-1px) scale(1.16)" }),
    ]),
    { duration: 180, easing: "cubic-bezier(0.2, 0, 0.2, 1)" },
  );
  rerender(view(3));
  expect(animations[0].cancel).not.toHaveBeenCalled();
  rerender(view(2));
  expect(animations[0].cancel).toHaveBeenCalledTimes(1);
  expect(animate).toHaveBeenCalledTimes(2);
  expect(container.firstChild).toBe(node);
  expect(node?.textContent).toBe("2");
  unmount();
  expect(animations[1].cancel).toHaveBeenCalledTimes(1);
});

test("respects reduced motion and cancels playback when the preference changes", () => {
  const { rerender } = render(<MessageReactionCount>{1}</MessageReactionCount>);
  Object.assign(reducedMotion, { matches: true });
  rerender(<MessageReactionCount>{2}</MessageReactionCount>);
  expect(animate).not.toHaveBeenCalled();
  Object.assign(reducedMotion, { matches: false });
  rerender(<MessageReactionCount>{3}</MessageReactionCount>);
  expect(animate).toHaveBeenCalledTimes(1);
  Object.assign(reducedMotion, { matches: true });
  reducedMotion.dispatchEvent(new Event("change"));
  expect(animations[0].cancel).toHaveBeenCalledTimes(1);
});

test("preserves native props, refs, render substitution and arbitrary children", () => {
  const ref = createRef<HTMLElement>();
  const { container, rerender } = render(
    <MessageReactionCount
      ref={ref}
      render={<strong />}
      className="custom-count"
      aria-label="Reactions"
    >
      {2}
    </MessageReactionCount>,
  );
  const node = container.firstElementChild;
  expect(ref.current).toBe(node);
  expect(node?.tagName).toBe("STRONG");
  expect(node?.getAttribute("aria-label")).toBe("Reactions");
  expect(node?.className).toContain("custom-count");
  expect(node?.getAttribute("data-slot")).toBe("message-reaction-count");
  rerender(
    <MessageReactionCount>
      <b>99+</b>
    </MessageReactionCount>,
  );
  rerender(
    <MessageReactionCount>
      <b>100+</b>
    </MessageReactionCount>,
  );
  rerender(<MessageReactionCount>{101}</MessageReactionCount>);
  expect(animate).not.toHaveBeenCalled();
});
