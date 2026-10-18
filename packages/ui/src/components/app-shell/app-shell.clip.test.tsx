/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { AppShellRoot } from "./app-shell";

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

test("the app shell clips instead of hiding, so focus can never scroll the app sideways", () => {
  // overflow: hidden is still a scroll container: focusing anything that pokes
  // past it scrolls the whole shell. overflow: clip cannot scroll at all.
  render(
    <ThemeProvider>
      <AppShellRoot data-testid="shell" />
    </ThemeProvider>,
  );
  const classes = screen.getByTestId("shell").className.split(/\s+/);
  expect(classes).toContain("md:overflow-clip");
  expect(classes).not.toContain("md:overflow-hidden");
});
