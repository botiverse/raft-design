// The composer's input (ScrollAreaTextarea) in real layout, with the package's styles: it grows
// with its text up to `max-h-32`, then scrolls, and the overlay scrollbar follows every line typed
// past the cap, with no size change for anything to observe.
//
// Revert to fail: scroll-area-textarea.tsx, `measure();` in `handleInput` (past the cap the
// textarea's size no longer changes, so the thumb keeps the length of the first overflowing line).
import "./composer-suggestion-list.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Composer, ComposerInput } from "./composer";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

/** One frame, then a task: the scrollbars' own frame callback has run. */
const frameThenTask = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));

/** Types `text` as one input: the value, then the input event React and the scrollbar listen to. */
function type(textarea: HTMLTextAreaElement, text: string) {
  textarea.value = text;
  textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText" }));
}

it("grows to max-h-32, then scrolls with a scrollbar whose length follows each line typed past it", async () => {
  render(
    <ThemeProvider>
      <div style={{ width: 480 }}>
        <Composer>
          <ComposerInput aria-label="Message" trigger="none" />
        </Composer>
      </div>
    </ThemeProvider>,
  );
  const textarea = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Message" });
  const frame = textarea.parentElement!;
  const gutter = () =>
    frame.querySelector<HTMLElement>(
      ":scope > .r-scroll-area__gutters > .r-scroll-area__gutter--vertical",
    );
  await frameThenTask();
  const oneLine = textarea.offsetHeight;
  expect(gutter()).toBeNull();

  let crossed = false;
  for (let lines = 2; lines <= 24; lines += 1) {
    type(textarea, Array.from({ length: lines }, (_, index) => `line ${index + 1}`).join("\n"));
    await frameThenTask();
    // The frame is as tall as the textarea, never taller than the cap.
    expect(frame.getBoundingClientRect().height).toBeCloseTo(textarea.offsetHeight, 0);
    expect(textarea.offsetHeight).toBeLessThanOrEqual(128);
    if (textarea.scrollHeight - textarea.clientHeight <= 1) {
      // Still growing: nothing to scroll, no scrollbar.
      expect(gutter()).toBeNull();
      continue;
    }
    crossed = true;
    expect(textarea.offsetHeight).toBe(128);
    const rail = gutter()!;
    const thumb = rail.querySelector<HTMLElement>(":scope > .r-scroll-area__thumb")!;
    const expected = Math.max(
      24,
      (textarea.clientHeight / textarea.scrollHeight) * rail.clientHeight,
    );
    expect(Math.abs(thumb.getBoundingClientRect().height - expected)).toBeLessThanOrEqual(1);
    // It runs to the frame's bottom: the composer keeps no room for a resize grip.
    expect(frame.getBoundingClientRect().bottom - rail.getBoundingClientRect().bottom).toBeCloseTo(
      0,
      0,
    );
  }
  expect(crossed).toBe(true);
  expect(textarea.offsetHeight).toBeGreaterThan(oneLine);

  // Scrolled to the end, the thumb is at the end of its gutter.
  textarea.scrollTop = textarea.scrollHeight;
  await frameThenTask();
  const rail = gutter()!.getBoundingClientRect();
  const thumb = gutter()!.querySelector(".r-scroll-area__thumb")!.getBoundingClientRect();
  expect(rail.bottom - thumb.bottom).toBeLessThanOrEqual(1);

  // Back to one line: the scrollbar goes, and the input shrinks again.
  type(textarea, "line 1");
  await frameThenTask();
  await frameThenTask();
  expect(gutter()).toBeNull();
  expect(textarea.offsetHeight).toBe(oneLine);
});
