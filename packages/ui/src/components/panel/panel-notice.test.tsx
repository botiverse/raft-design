/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { PanelNotice, PanelNoticeActions, PanelNoticeContent } from "./panel-notice";

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

function renderNotice(status?: "warning" | "destructive") {
  render(
    <ThemeProvider>
      <PanelNotice data-testid="notice" status={status}>
        <PanelNoticeContent>Failed to authenticate</PanelNoticeContent>
        <PanelNoticeActions data-testid="actions">
          <button type="button">Copy</button>
        </PanelNoticeActions>
      </PanelNotice>
    </ThemeProvider>,
  );
  return {
    notice: screen.getByTestId("notice").className.split(/\s+/),
    actions: screen.getByTestId("actions").className.split(/\s+/),
  };
}

test("a raft panel notice is closed by the region seam, never the in-region divider", () => {
  // The head above it draws line-seam; a lighter line under the strip made
  // the two edges of one band read differently.
  const { notice } = renderNotice();
  expect(notice).toContain("border-b");
  expect(notice).toContain("border-line-seam");
  expect(notice).not.toContain("border-line-hairline");
});

test("a raft panel notice takes the panel's edges and a warning tint by default", () => {
  const { notice } = renderNotice();
  expect(notice).toContain("px-5");
  expect(notice).toContain("max-md:px-4");
  expect(notice).toContain("bg-warning-soft");
});

test("a destructive panel notice takes the danger tint", () => {
  expect(renderNotice("destructive").notice).toContain("bg-danger-soft");
});

test("trailing actions overhang the padding so a 32px button does not grow the strip", () => {
  const { actions } = renderNotice();
  expect(actions).toContain("-my-1.5");
});
