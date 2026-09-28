/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Composer, ComposerInput } from "./composer";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

function renderInput(theme: "brutal" | "elegant", className?: string) {
  render(
    <ThemeProvider theme={theme}>
      <Composer>
        <ComposerInput aria-label="Message #design" className={className} />
      </Composer>
    </ThemeProvider>,
  );
  const input = screen.getByRole("textbox", { name: "Message #design" });
  return { input, classes: input.className.split(/\s+/) };
}

/**
 * ComposerInput is documented as an auto-growing textarea, and the recipe has
 * always carried `max-h-32` — but nothing grew it: a `rows={1}` textarea keeps
 * its one-row height, so the cap never engaged and consumers had to add
 * `field-sizing-content` themselves. Content sizing is what makes the cap mean
 * something; past it the draft scrolls instead of pushing the toolbar away.
 * Geometry needs a real layout engine; this pins the emitted contract.
 */
for (const theme of ["brutal", "elegant"] as const) {
  test(`${theme}: grows with its content up to max-h-32, then scrolls`, () => {
    const { input, classes } = renderInput(theme);
    expect(classes).toContain("field-sizing-content");
    expect(classes).toContain("max-h-32");
    expect(classes).toContain("overflow-y-auto");
    expect(classes, "growth is content-driven, not a drag handle").toContain("resize-none");
    expect(input.getAttribute("rows"), "the resting height stays one row").toBe("1");
  });
}

test("consumers that already opt in merge cleanly and can still retune the cap", () => {
  const { classes } = renderInput("elegant", "field-sizing-content max-h-60");
  expect(classes.filter((name) => name === "field-sizing-content")).toHaveLength(1);
  expect(classes).toContain("max-h-60");
  expect(classes).not.toContain("max-h-32");
});
