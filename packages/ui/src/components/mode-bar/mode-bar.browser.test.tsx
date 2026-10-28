import "./mode-bar.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { PanelNotice, PanelNoticeContent } from "../panel/panel-notice";
import {
  ModeBar,
  ModeBarAction,
  ModeBarContent,
  ModeBarDescription,
  ModeBarTitle,
} from "./mode-bar";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function Bar({ width, hint }: { width: number; hint: string }) {
  return (
    <div style={{ width: `${width}px` }}>
      <ModeBar data-testid="bar">
        <ModeBarContent data-testid="content">
          <ModeBarTitle data-testid="title">Commenting · 1 draft.</ModeBarTitle>
          <ModeBarDescription>{hint}</ModeBarDescription>
        </ModeBarContent>
        <ModeBarAction data-testid="done">Done</ModeBarAction>
      </ModeBar>
    </div>
  );
}

it("one line is as tall as a one-line PanelNotice, less its seam", () => {
  render(
    <ThemeProvider>
      <Bar width={640} hint="Select text to comment on it." />
      <div style={{ width: "640px" }}>
        <PanelNotice data-testid="notice">
          <PanelNoticeContent>Settings didn't save.</PanelNoticeContent>
        </PanelNotice>
      </div>
    </ThemeProvider>,
  );
  const bar = screen.getByTestId("bar").getBoundingClientRect();
  const noticeElement = screen.getByTestId("notice");
  const seam = Number.parseFloat(getComputedStyle(noticeElement).borderBottomWidth);
  expect(bar.height).toBeGreaterThanOrEqual(40);
  // The notice's seam is its own edge; the dark fill is the mode bar's.
  expect(bar.height).toBe(noticeElement.getBoundingClientRect().height - seam);
});

it("when the words wrap, Done stays at the end of the first line", () => {
  render(
    <ThemeProvider>
      <Bar width={300} hint="Select text or tap a block to comment on it." />
    </ThemeProvider>,
  );
  const bar = screen.getByTestId("bar");
  const content = screen.getByTestId("content");
  const done = screen.getByTestId("done").getBoundingClientRect();
  const lineHeight = Number.parseFloat(getComputedStyle(content).lineHeight);
  const contentRect = content.getBoundingClientRect();
  expect(contentRect.height).toBeGreaterThan(lineHeight * 1.5);
  const firstLineMiddle = contentRect.top + lineHeight / 2;
  expect(Math.abs(done.top + done.height / 2 - firstLineMiddle)).toBeLessThanOrEqual(1);
  const paddingEnd = Number.parseFloat(getComputedStyle(bar).paddingRight);
  expect(Math.abs(bar.getBoundingClientRect().right - paddingEnd - done.right)).toBeLessThanOrEqual(
    0.5,
  );
});

it("mirrors in a right-to-left language", () => {
  render(
    <ThemeProvider>
      <div dir="rtl">
        <Bar width={640} hint="Select text to comment on it." />
      </div>
    </ThemeProvider>,
  );
  const done = screen.getByTestId("done").getBoundingClientRect();
  const content = screen.getByTestId("content").getBoundingClientRect();
  expect(done.right).toBeLessThanOrEqual(content.left);
});

it("is the HUD: dark fill, bold title, muted description", () => {
  render(
    <ThemeProvider>
      <Bar width={640} hint="Select text to comment on it." />
    </ThemeProvider>,
  );
  const bar = getComputedStyle(screen.getByTestId("bar"));
  const title = screen.getByTestId("title");
  const description = title.nextElementSibling as HTMLElement;
  const probe = document.createElement("div");
  probe.className = "bg-layer-hud";
  document.body.append(probe);
  expect(bar.backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
  probe.remove();
  expect(getComputedStyle(title).fontWeight).toBe("700");
  expect(getComputedStyle(description).color).not.toBe(getComputedStyle(title).color);
});

it("reads the words as a live region and keeps Done a real button outside it", () => {
  render(
    <ThemeProvider>
      <Bar width={640} hint="Select text to comment on it." />
    </ThemeProvider>,
  );
  const status = screen.getByRole("status");
  expect(status.textContent).toBe("Commenting · 1 draft. Select text to comment on it.");
  const done = screen.getByRole("button", { name: "Done" });
  expect(done.getAttribute("type")).toBe("button");
  expect(status.contains(done)).toBe(false);
});
