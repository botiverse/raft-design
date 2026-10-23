import "./button.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

// Stacked full width (`data-stacked`: a dialog footer whose buttons don't fit
// on one line, a bottom sheet's actions), a frameless button reads as a line
// of text: a ghost text button there takes the ink border of `default`, at
// rest, on hover and on focus (stdrc, 2026-10-22). Out of a stack it stays
// frameless; disabled it keeps the disabled fill; an icon button keeps no box.
// Real cascade only: jsdom computes no styles.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const FULLY_TRANSPARENT = new Set([
  "rgba(0, 0, 0, 0)",
  "oklab(0 0 0 / 0)",
  "oklch(0 0 0 / 0)",
  "oklch(1 0 0 / 0)",
]);

function look(element: Element) {
  const style = getComputedStyle(element);
  const clear = (value: string) => (FULLY_TRANSPARENT.has(value) ? "transparent" : value);
  return {
    background: clear(style.backgroundColor),
    overlay: style.backgroundImage,
    border: clear(style.borderTopColor),
    color: style.color,
    shadow: style.boxShadow,
  };
}

/** Polls until `read` returns something other than `before` (rules arrive late in dev). */
async function changed<T>(read: () => T, before: T) {
  let now = read();
  for (let i = 0; i < 60 && JSON.stringify(now) === JSON.stringify(before); i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    now = read();
  }
  return now;
}

function renderStack(mode: "light" | "dark") {
  render(
    <ThemeProvider mode={mode}>
      <div className="bg-layer-card p-4">
        <div data-stacked="" className="flex flex-col gap-2">
          <Button variant="default" size="lg">
            Reference
          </Button>
          <Button variant="ghost" size="lg">
            Cancel
          </Button>
          <Button variant="ghost" size="lg" disabled>
            Disabled
          </Button>
          <Button variant="ghost" size="icon-lg" aria-label="Icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14" />
            </svg>
          </Button>
        </div>
        <Button variant="ghost" size="lg">
          Row Cancel
        </Button>
        <Button variant="ghost" size="lg" disabled>
          Row Disabled
        </Button>
      </div>
    </ThemeProvider>,
  );
  const get = (name: string) => screen.getByRole("button", { name });
  return {
    reference: get("Reference"),
    cancel: get("Cancel"),
    disabled: get("Disabled"),
    icon: get("Icon"),
    rowCancel: get("Row Cancel"),
    rowDisabled: get("Row Disabled"),
  };
}

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: a stacked ghost button looks like default at rest; out of a stack it stays frameless`, () => {
    const { reference, cancel, rowCancel } = renderStack(mode);

    expect(look(cancel)).toEqual(look(reference));
    expect(look(cancel).border).not.toBe("transparent");
    expect(look(rowCancel).border).toBe("transparent");
    expect(look(rowCancel).background).toBe("transparent");
  });

  it(`${mode}: a stacked ghost button hovers like default, not like ghost`, async () => {
    const { reference, cancel } = renderStack(mode);
    const { userEvent } = await import("vite-plus/test/browser/context");

    const resting = look(reference);
    await userEvent.hover(reference);
    const hovered = await changed(() => look(reference), resting);
    expect(hovered.overlay).not.toBe(resting.overlay);

    await userEvent.hover(cancel);
    expect(await changed(() => look(cancel), resting)).toEqual(hovered);
  });

  it(`${mode}: a stacked ghost button keeps default's frame under the focus ring`, async () => {
    const { reference, cancel } = renderStack(mode);
    const { userEvent } = await import("vite-plus/test/browser/context");

    reference.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(cancel);
    const focused = await changed(() => look(cancel), look(reference));
    expect(focused.shadow).not.toBe("none");
    expect(focused.border).toBe(look(reference).border);
    expect(focused.background).toBe(look(reference).background);
  });

  it(`${mode}: disabled or icon-only, a stacked ghost button is unchanged`, () => {
    const { disabled, rowDisabled, icon } = renderStack(mode);

    expect(look(disabled)).toEqual(look(rowDisabled));
    expect(look(icon).border).toBe("transparent");
    expect(look(icon).background).toBe("transparent");
  });
}
