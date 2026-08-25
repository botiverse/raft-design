/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Input } from "../input/input";
import { Textarea } from "./textarea";

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

function renderFields(theme: "brutal" | "elegant") {
  render(
    <ThemeProvider theme={theme}>
      <Input data-testid="input" />
      <Textarea data-testid="textarea" />
    </ThemeProvider>,
  );
}

test.each(["brutal", "elegant"] as const)(
  "%s Textarea shares Input's declared field metric axis",
  (theme) => {
    renderFields(theme);

    for (const testid of ["input", "textarea"]) {
      const className = screen.getByTestId(testid).className;
      expect(className).toContain("text-field");
      expect(className).toContain("font-field");
    }
  },
);

test("elegant Textarea drops its old hard-coded size declaration", () => {
  renderFields("elegant");

  const className = screen.getByTestId("textarea").className;
  expect(className).not.toContain("text-sm");
});
