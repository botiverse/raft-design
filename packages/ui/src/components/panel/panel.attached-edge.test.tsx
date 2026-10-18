/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Panel } from "./panel";

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

function classesOf(className?: string) {
  render(
    <ThemeProvider theme="raft">
      <Panel data-testid="panel" edge="attached" className={className} />
    </ThemeProvider>,
  );
  return screen.getByTestId("panel").className.split(/\s+/);
}

test("an attached raft panel draws one seam on its attached side, none on a phone", () => {
  const classes = classesOf();
  expect(classes).toContain("border-l");
  expect(classes).toContain("border-line-seam");
  expect(classes).toContain("max-md:border-l-0");
});

test("a host whose neighbour draws the seam drops it at every width with border-l-0", () => {
  // The conversation beside the sidebar: the sidebar's own right seam is the
  // line, so a second one here would read as a 2px divider.
  const classes = classesOf("border-l-0");
  expect(classes).toContain("border-l-0");
  expect(classes).not.toContain("border-l");
  expect(classes.some((name) => /^md:border-l$/.test(name))).toBe(false);
});
