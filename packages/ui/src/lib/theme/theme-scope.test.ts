import { describe, expect, it } from "vite-plus/test";
import { resolveThemeScopeProps } from "./theme-scope";

describe("resolveThemeScopeProps", () => {
  it.each([
    { mode: "light" as const, expectedClassName: "custom light" },
    { mode: "dark" as const, expectedClassName: "custom dark" },
    { mode: "system" as const, expectedClassName: "custom" },
  ])("merges a string className in elegant $mode mode", ({ mode, expectedClassName }) => {
    const props = resolveThemeScopeProps(
      { className: "custom", id: "portal" },
      { theme: "elegant", mode },
    );

    expect(props).toEqual({
      className: expectedClassName,
      "data-theme": "elegant",
      id: "portal",
    });
  });

  it("preserves callback className semantics while adding an explicit mode", () => {
    const props = resolveThemeScopeProps(
      { className: (state: { open: boolean }) => (state.open ? "open" : undefined) },
      { theme: "elegant", mode: "dark" },
    );

    expect(typeof props.className).toBe("function");
    if (typeof props.className === "function") {
      expect(props.className({ open: true })).toBe("open dark");
      expect(props.className({ open: false })).toBe("dark");
    }
  });

  it("does not force a mode class for system or brutal themes", () => {
    const callback = (state: { open: boolean }) => (state.open ? "open" : undefined);
    const systemProps = resolveThemeScopeProps(
      { className: callback },
      { theme: "elegant", mode: "system" },
    );
    const brutalProps = resolveThemeScopeProps(
      { className: "custom" },
      { theme: "brutal", mode: "dark" },
    );

    expect(systemProps.className).toBe(callback);
    expect(systemProps["data-theme"]).toBe("elegant");
    expect(brutalProps.className).toBe("custom");
    expect(brutalProps["data-theme"]).toBe("brutal");
  });
});
