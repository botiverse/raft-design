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
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
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

  test("aria path: interactive effects are neutralized by resets, not by gating", () => {
    // Review round 2: gating hovers with not-aria-disabled: broke consumer
    // overrides (dedup + cascade). The recipe now keeps hover:/active: on
    // their original stacks and adds aria-disabled: resets that fire only on
    // the aria path. This pins both halves.
    render(
      <ThemeProvider theme="elegant">
        <Button disabled focusableWhenDisabled variant="primary">
          Save
        </Button>
      </ThemeProvider>,
    );
    const cls = screen.getByRole("button", { name: "Save" }).className;
    // No gating prefix survived — consumer hover: overrides dedupe as before.
    expect(cls).not.toContain("not-aria-disabled:");
    // Resets for this variant and for the generic motion classes are present
    // (class-string check; computed non-reaction is covered by the browser test).
    expect(cls).toContain("aria-disabled:hover:bg-primary-400");
    expect(cls).toContain("aria-disabled:hover:translate-none");
    expect(cls).toContain("aria-disabled:active:scale-none");
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
