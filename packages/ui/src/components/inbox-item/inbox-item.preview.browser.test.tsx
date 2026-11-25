// @browsers chromium webkit
import "./inbox-item.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import {
  InboxItem,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemLeading,
  InboxItemLocation,
  InboxItemMarks,
  InboxItemPreview,
  InboxItemSender,
  InboxItemStatus,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrigger,
} from "./inbox-item";

// The compact row's two-line preview (InboxItemPreview), measured in a real
// browser, in WebKit as well as Chromium: the marks end the excerpt's first
// line and the second runs the full width. In WebKit a float that is a child
// of the clamped -webkit-box takes a line of its own, so this file is also run
// in WebKit (`// @browsers chromium webkit`, vite.config.ts).

const it = test.skipIf(typeof window === "undefined");

// Chinese breaks between any two characters, so each line fills to within a
// character of its end and where a line stops says how much room it had.
const LONG =
  "这是 App Store Connect 的自动邮件，缺的是相机权限说明。我已经在 Info.plist 里补上，今晚重新打包上传，明天一早再看审核结果。";
const SHORT = "Ship it.";

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 800);
});

afterEach(() => cleanup());

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

function Row({ text, status }: { text: string; status?: boolean }) {
  return (
    <div className="w-[390px]">
      <InboxItem data-testid="row" density="compact" data-unread>
        <InboxItemTrigger aria-label="Open the thread" />
        <InboxItemLeading data-testid="leading">
          <span className="block size-[35px] rounded-lg bg-fill-muted" />
        </InboxItemLeading>
        <InboxItemContent data-testid="content">
          <InboxItemHeading>
            <InboxItemTitle data-testid="title">The app binary is missing metadata</InboxItemTitle>
            <InboxItemTimestamp>9h</InboxItemTimestamp>
          </InboxItemHeading>
          <InboxItemPreview data-testid="preview">
            <InboxItemMarks data-testid="marks">
              {status ? (
                <InboxItemStatus status="in-progress" data-testid="status">
                  In progress
                </InboxItemStatus>
              ) : null}
              <span className="inline-flex h-5 min-w-5 items-center justify-center">12</span>
            </InboxItemMarks>
            <InboxItemBody data-testid="body">
              <InboxItemLocation data-testid="location">#wg-mobile-sync ·</InboxItemLocation>
              <InboxItemSender>Lagoon: </InboxItemSender>
              {text}
            </InboxItemBody>
          </InboxItemPreview>
        </InboxItemContent>
      </InboxItem>
    </div>
  );
}

const rect = (id: string) => screen.getByTestId(id).getBoundingClientRect();

/** The boxes the body's text lays out in, one or more per line. */
function textRects(id: string) {
  const range = document.createRange();
  range.selectNodeContents(screen.getByTestId(id));
  return [...range.getClientRects()].filter((r) => r.width > 0);
}

it("ends the first line of a long excerpt with the marks and runs the second the full width", () => {
  render(<Row text={LONG} />);
  const preview = rect("preview");
  const marks = rect("marks");
  // Clamped to two 20px lines.
  expect(preview.height).toBe(40);
  // The marks sit on the first line, at its end.
  expect(marks.top).toBeCloseTo(preview.top, 0);
  expect(marks.height).toBe(20);
  expect(marks.right).toBeCloseTo(preview.right, 0);
  const lines = textRects("body");
  const first = lines.filter((r) => r.top < preview.top + 20);
  const second = lines.filter((r) => r.top >= preview.top + 20 && r.top < preview.bottom);
  expect(first.length).toBeGreaterThan(0);
  expect(second.length).toBeGreaterThan(0);
  // The first line stops before the marks; the second runs on under them.
  expect(Math.max(...first.map((r) => r.right))).toBeLessThanOrEqual(marks.left);
  expect(Math.max(...second.map((r) => r.right))).toBeGreaterThan(marks.left);
});

it("makes a short excerpt one line, so the row is only as tall as its text", () => {
  render(<Row text={SHORT} />);
  const preview = rect("preview");
  expect(preview.height).toBe(20);
  expect(rect("marks").top).toBeCloseTo(preview.top, 0);
  // 8px above and below: the 20px title and the one 20px line.
  expect(rect("row").height).toBe(56);
});

it("sets the leading visual at the top of the row, beside the title", () => {
  render(<Row text={LONG} />);
  expect(rect("leading").top).toBeCloseTo(rect("title").top, 0);
  expect(rect("leading").top - rect("row").top).toBe(8);
});

it("shows a task's status as its pixel only, named by its word", () => {
  render(<Row text={LONG} status />);
  const status = screen.getByTestId("status");
  expect(status.getAttribute("role")).toBe("img");
  expect(status.getAttribute("aria-label")).toBe("In progress");
  expect(screen.getByTestId("marks").textContent).toBe("12");
  expect(rect("marks").top).toBeCloseTo(rect("preview").top, 0);
});

it("writes where the thread is in hint", () => {
  render(<Row text={LONG} />);
  const probe = document.createElement("span");
  probe.className = "text-foreground-hint";
  document.body.append(probe);
  const hint = getComputedStyle(probe).color;
  probe.remove();
  expect(getComputedStyle(screen.getByTestId("location")).color).toBe(hint);
});
