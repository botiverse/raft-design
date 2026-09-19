/**
 * @vitest-environment jsdom
 *
 * Disabled-button pointer behavior (task #77): native-disabled buttons swallow
 * pointer events, so a Tooltip explaining WHY an action is unavailable can
 * never open. Base UI's `focusableWhenDisabled` switches the button to the
 * aria-disabled path (no native `disabled` attribute), which keeps hover —
 * but our styles only mirrored opacity/transform under `:disabled`, so the
 * aria path used to lose its disabled appearance. These assertions pin both
 * the semantics and the appearance parity.
 */
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

// jsdom ships no matchMedia; ThemeProvider reads it for system-theme detection.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as never;
}

afterEach(cleanup);

describe("disabled pointer semantics", () => {
  test("default (native disabled): keeps the disabled attribute and pointer block", () => {
    render(
      <ThemeProvider theme="elegant">
        <Button disabled>Save</Button>
      </ThemeProvider>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveProperty("disabled", true);
    expect(button.getAttribute("aria-disabled")).toBeNull();
    expect(button.className).toContain("disabled:pointer-events-none");
  });

  test("focusableWhenDisabled: aria-disabled path has no native disabled attribute", () => {
    render(
      <ThemeProvider theme="elegant">
        <Button disabled focusableWhenDisabled>
          Save
        </Button>
      </ThemeProvider>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    // No native `disabled` — the element keeps pointer events, so a wrapping
    // Tooltip can open on hover.
    expect(button).toHaveProperty("disabled", false);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.tabIndex).toBe(0);
  });

  test("focusableWhenDisabled: activation is still blocked", () => {
    const onClick = vi.fn();
    render(
      <ThemeProvider theme="elegant">
        <Button disabled focusableWhenDisabled onClick={onClick}>
          Save
        </Button>
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  test("appearance parity: aria-disabled mirrors the disabled opacity/transform", () => {
    render(
      <ThemeProvider theme="elegant">
        <Button disabled focusableWhenDisabled>
          Save
        </Button>
      </ThemeProvider>,
    );
    const cls = screen.getByRole("button", { name: "Save" }).className;
    // Class-string check only: this pins that the recipe emits the
    // aria-disabled: mirrors (so the aria path keeps the disabled look). It
    // does not prove computed style — jsdom has no layout/stylesheet pass.
    expect(cls).toContain("aria-disabled:opacity-40");
    expect(cls).toContain("aria-disabled:transform-none");
    expect(cls).toContain("aria-disabled:cursor-not-allowed");
  });

  test("aria path: every hover/active utility is gated with not-aria-disabled:", () => {
    // The blocker from review: ungated hover:/active: fire on the
    // pointer-events-enabled aria path (hover bg/border changes, active scale).
    // Elegant is the theme that carries `active:scale-[…]`; brutal carries the
    // motion hovers — check both so no theme's interactive utility slips by.
    for (const theme of ["elegant", "brutal"] as const) {
      const { unmount } = render(
        <ThemeProvider theme={theme}>
          <Button disabled focusableWhenDisabled variant="accent">
            Save
          </Button>
        </ThemeProvider>,
      );
      const tokens = screen.getByRole("button", { name: "Save" }).className.split(/\s+/);
      const interactive = tokens.filter((t) => /(^|:)(hover|active):/.test(t));
      expect(interactive.length).toBeGreaterThan(0);
      for (const token of interactive) {
        expect(token).toContain("not-aria-disabled:");
      }
      unmount();
    }
  });

  test("CONTROL: aria-disabled mirrors are not applied to an enabled button", () => {
    // Without this the parity assertions above could pass on a class string
    // that always contains the mirrors but never activates them.
    render(
      <ThemeProvider theme="elegant">
        <Button>Save</Button>
      </ThemeProvider>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.getAttribute("aria-disabled")).toBeNull();
  });
});
