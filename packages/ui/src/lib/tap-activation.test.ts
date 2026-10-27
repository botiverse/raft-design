/**
 * @vitest-environment jsdom
 */
/**
 * Tap activation (design/patterns/navigation.md#switching-on-finger-lift): a
 * touch that lands and lifts in place on a control, quickly, activates it on
 * `touchend` once, and suppresses the click that would follow. Anything else
 * (a move, a lift outside, a long press, a touchend the browser won't let go
 * of, a disabled control, a mouse) leaves the click path as it was.
 */
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { attachTapActivation, TAP_MAX_MS, TAP_SLOP_PX } from "./tap-activation";

let button: HTMLButtonElement;
let onClick: ReturnType<typeof vi.fn<(event: Event) => void>>;
let detach: () => void;
let clock = 0;

beforeEach(() => {
  clock = 1000;
  vi.spyOn(performance, "now").mockImplementation(() => clock);
  document.body.innerHTML = `<button type="button">Tasks</button>`;
  button = document.querySelector("button")!;
  // The control's box: 100 x 40 at (0, 0).
  button.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 100, bottom: 40, width: 100, height: 40, x: 0, y: 0 }) as DOMRect;
  onClick = vi.fn<(event: Event) => void>();
  button.addEventListener("click", onClick);
  detach = attachTapActivation(button);
});

afterEach(() => {
  detach();
  vi.restoreAllMocks();
});

type Point = { x: number; y: number };

function touchEvent(
  type: string,
  {
    touches,
    changed,
    cancelable = true,
  }: { touches: Point[]; changed: Point[]; cancelable?: boolean },
) {
  const event = new Event(type, { bubbles: true, cancelable });
  const list = (points: Point[]) =>
    points.map((point, index) => ({ identifier: index, clientX: point.x, clientY: point.y }));
  Object.defineProperty(event, "touches", { value: list(touches) });
  Object.defineProperty(event, "changedTouches", { value: list(changed) });
  return event;
}

function start(at: Point) {
  button.dispatchEvent(touchEvent("touchstart", { touches: [at], changed: [at] }));
}
function move(to: Point) {
  button.dispatchEvent(touchEvent("touchmove", { touches: [to], changed: [to] }));
}
function end(at: Point, cancelable = true) {
  const event = touchEvent("touchend", { touches: [], changed: [at], cancelable });
  button.dispatchEvent(event);
  return event;
}

/** The click a browser sends after a touch it wasn't told to cancel. */
function browserClick() {
  button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

test("a tap activates on touchend, once, and cancels the touchend", () => {
  start({ x: 50, y: 20 });
  clock += 80;
  const event = end({ x: 52, y: 21 });
  expect(event.defaultPrevented).toBe(true);
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(button);
  // A click that still arrives for the same touch is not a second activation.
  browserClick();
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("a second tap after the first activates again", () => {
  start({ x: 50, y: 20 });
  end({ x: 50, y: 20 });
  clock += 100;
  start({ x: 50, y: 20 });
  end({ x: 50, y: 20 });
  expect(onClick).toHaveBeenCalledTimes(2);
});

test(`a touch that moved more than ${TAP_SLOP_PX}px does not activate`, () => {
  start({ x: 50, y: 20 });
  move({ x: 50, y: 20 + TAP_SLOP_PX + 1 });
  move({ x: 50, y: 20 });
  const event = end({ x: 50, y: 20 });
  expect(event.defaultPrevented).toBe(false);
  expect(onClick).not.toHaveBeenCalled();
});

test("a touch that lifted far from where it landed does not activate", () => {
  start({ x: 20, y: 20 });
  end({ x: 20 + TAP_SLOP_PX + 1, y: 20 });
  expect(onClick).not.toHaveBeenCalled();
});

test("a touch that lifted outside the control does not activate", () => {
  start({ x: 95, y: 20 });
  const event = end({ x: 104, y: 20 });
  expect(event.defaultPrevented).toBe(false);
  expect(onClick).not.toHaveBeenCalled();
});

test(`a touch held for ${TAP_MAX_MS}ms or more does not activate`, () => {
  start({ x: 50, y: 20 });
  clock += TAP_MAX_MS;
  const event = end({ x: 50, y: 20 });
  expect(event.defaultPrevented).toBe(false);
  expect(onClick).not.toHaveBeenCalled();
});

test("a touchend the browser won't cancel is left to the click", () => {
  start({ x: 50, y: 20 });
  end({ x: 50, y: 20 }, false);
  expect(onClick).not.toHaveBeenCalled();
  browserClick();
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("a disabled control does nothing", () => {
  for (const disable of [
    () => (button.disabled = true),
    () => button.setAttribute("aria-disabled", "true"),
    () => button.setAttribute("data-disabled", ""),
  ]) {
    button.disabled = false;
    button.removeAttribute("aria-disabled");
    button.removeAttribute("data-disabled");
    disable();
    start({ x: 50, y: 20 });
    const event = end({ x: 50, y: 20 });
    expect(event.defaultPrevented).toBe(false);
  }
  expect(onClick).not.toHaveBeenCalled();
});

test("a second finger cancels the tap", () => {
  button.dispatchEvent(
    touchEvent("touchstart", {
      touches: [
        { x: 10, y: 10 },
        { x: 50, y: 20 },
      ],
      changed: [{ x: 50, y: 20 }],
    }),
  );
  end({ x: 50, y: 20 });
  expect(onClick).not.toHaveBeenCalled();
});

test("a mouse click goes through untouched", () => {
  browserClick();
  browserClick();
  expect(onClick).toHaveBeenCalledTimes(2);
});

test("a click after the echo window activates as usual", () => {
  start({ x: 50, y: 20 });
  end({ x: 50, y: 20 });
  clock += 1000;
  browserClick();
  expect(onClick).toHaveBeenCalledTimes(2);
});

test("a key press or mouse press right after a tap is a new activation", () => {
  for (const press of [
    () => button.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })),
    () => button.dispatchEvent(Object.assign(new Event("pointerdown"), { pointerType: "mouse" })),
  ]) {
    onClick.mockClear();
    clock += 1000;
    start({ x: 50, y: 20 });
    end({ x: 50, y: 20 });
    press();
    browserClick();
    expect(onClick).toHaveBeenCalledTimes(2);
  }
});

test("focus moves after the click, so a select-on-focus control sees the click first", () => {
  const order: string[] = [];
  onClick.mockImplementation(() =>
    order.push(document.activeElement === button ? "click:focused" : "click"),
  );
  button.addEventListener("focus", () => order.push("focus"));
  start({ x: 50, y: 20 });
  end({ x: 50, y: 20 });
  expect(order).toEqual(["click", "focus"]);
});

test("focus the click moved elsewhere stays there", () => {
  const field = document.createElement("input");
  document.body.append(field);
  onClick.mockImplementation(() => field.focus());
  start({ x: 50, y: 20 });
  end({ x: 50, y: 20 });
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(field);
});

test("a text field that already has focus keeps it, so the keyboard stays open", () => {
  const field = document.createElement("input");
  document.body.append(field);
  field.focus();
  // The click leaves focus alone; before the fix the tap then focused the control.
  start({ x: 50, y: 20 });
  end({ x: 50, y: 20 });
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(field);
});

test("focus on the page or another control still moves to the tapped control", () => {
  const other = document.createElement("button");
  document.body.append(other);
  other.focus();
  start({ x: 50, y: 20 });
  end({ x: 50, y: 20 });
  expect(document.activeElement).toBe(button);
});

test("detaching removes the behavior", () => {
  detach();
  start({ x: 50, y: 20 });
  const event = end({ x: 50, y: 20 });
  expect(event.defaultPrevented).toBe(false);
  expect(onClick).not.toHaveBeenCalled();
});
