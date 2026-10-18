/**
 * @vitest-environment jsdom
 *
 * Disabled-button pointer behavior: native-disabled buttons swallow pointer
 * events, so a Tooltip explaining WHY an action is unavailable can never open.
 * Base UI's `focusableWhenDisabled` switches the button to the aria-disabled
 * path (no native `disabled` attribute), which keeps hover — but our styles
 * only mirrored opacity/transform under `:disabled`, so the aria path used to
 * lose its disabled appearance. These assertions pin both the semantics and the
 * appearance parity.
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
      <ThemeProvider>
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
      <ThemeProvider>
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
      <ThemeProvider>
        <Button disabled focusableWhenDisabled onClick={onClick}>
          Save
        </Button>
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  test("appearance parity: aria-disabled mirrors every disabled declaration", () => {
    render(
      <ThemeProvider>
        <Button disabled focusableWhenDisabled>
          Save
        </Button>
      </ThemeProvider>,
    );
    const classes = screen.getByRole("button", { name: "Save" }).className.split(/\s+/);
    // Class-string check only: this pins that the recipe emits the
    // aria-disabled: mirrors (so the aria path keeps the disabled look). It
    // does not prove computed style — jsdom has no layout/stylesheet pass.
    // The disabled look is a grey fill at full opacity, with no motion.
    for (const name of [
      "opacity-100",
      "transform-none",
      "border-line-hairline",
      "bg-fill-muted",
      "text-foreground-disabled",
    ]) {
      expect(classes).toContain(`disabled:${name}`);
    }
    // pointer-events-none is the one deliberate difference: the aria path
    // keeps hover so a Tooltip can open.
    const mirrored = classes
      .filter((name) => name.startsWith("disabled:") && name !== "disabled:pointer-events-none")
      .map((name) => `aria-${name}`);
    expect(mirrored.length).toBeGreaterThan(0);
    for (const name of mirrored) expect(classes).toContain(name);
    expect(classes).toContain("aria-disabled:cursor-not-allowed");
    expect(classes).not.toContain("aria-disabled:pointer-events-none");
  });

  test("aria path: interactive effects are neutralized by resets, not by gating", () => {
    // Review round 2: gating hovers with not-aria-disabled: broke consumer
    // overrides (dedup + cascade). The recipe now keeps hover:/active: on
    // their original stacks and adds aria-disabled: resets that fire only on
    // the aria path. This pins both halves.
    render(
      <ThemeProvider>
        <Button disabled focusableWhenDisabled variant="primary">
          Save
        </Button>
      </ThemeProvider>,
    );
    const classes = screen.getByRole("button", { name: "Save" }).className.split(/\s+/);
    // No gating prefix survived — consumer hover: overrides dedupe as before.
    expect(classes.some((name) => name.includes("not-aria-disabled:"))).toBe(false);
    // The hover/press stack is still there…
    expect(classes.some((name) => name.startsWith("hover:"))).toBe(true);
    // …and the aria path resets it: the fill goes grey, the press overlay (a
    // background image) is dropped, and the generic motion classes stand still
    // (class-string check; computed non-reaction is covered by the browser test).
    expect(classes).toContain("aria-disabled:bg-fill-muted");
    expect(classes).toContain("aria-disabled:bg-none");
    expect(classes).toContain("aria-disabled:hover:translate-none");
    expect(classes).toContain("aria-disabled:active:scale-none");
  });

  test("CONTROL: aria-disabled mirrors are not applied to an enabled button", () => {
    // Without this the parity assertions above could pass on a class string
    // that always contains the mirrors but never activates them.
    render(
      <ThemeProvider>
        <Button>Save</Button>
      </ThemeProvider>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.getAttribute("aria-disabled")).toBeNull();
  });
});
