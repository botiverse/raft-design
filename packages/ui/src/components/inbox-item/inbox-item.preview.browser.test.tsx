// @browsers chromium webkit
import "./inbox-item.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { SidebarItemCount } from "../sidebar/sidebar-item";
import { InboxItemSkeleton } from "./inbox-item-skeleton";
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

function Row({
  text,
  status,
  place = "#wg-mobile-sync ·",
  dark,
}: {
  text: string;
  status?: boolean;
  place?: string;
  dark?: boolean;
}) {
  return (
    <div className={dark ? "dark w-[390px] bg-layer-canvas" : "w-[390px]"}>
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
              <SidebarItemCount data-testid="count">12</SidebarItemCount>
            </InboxItemMarks>
            <InboxItemBody data-testid="body">
              <InboxItemLocation data-testid="location">{place}</InboxItemLocation>
              <InboxItemSender>Lagoon: </InboxItemSender>
              <span data-testid="message">{text}</span>
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
  // Clamped to two 20px lines, inside the 2px of room kept for the marks' ring.
  const top = preview.top + 2;
  expect(preview.height).toBe(44);
  // The marks sit on the first line, at its end.
  expect(marks.top).toBeCloseTo(top, 0);
  expect(marks.height).toBe(20);
  expect(marks.right).toBeCloseTo(preview.right - 2, 0);
  const lines = textRects("body");
  const first = lines.filter((r) => r.top < top + 20);
  const second = lines.filter((r) => r.top >= top + 20 && r.top < preview.bottom);
  expect(first.length).toBeGreaterThan(0);
  expect(second.length).toBeGreaterThan(0);
  // The first line stops before the marks; the second runs on under them.
  expect(Math.max(...first.map((r) => r.right))).toBeLessThanOrEqual(marks.left);
  expect(Math.max(...second.map((r) => r.right))).toBeGreaterThan(marks.left);
});

it("makes a short excerpt one line, so the row is only as tall as its text", () => {
  render(<Row text={SHORT} />);
  const preview = rect("preview");
  expect(preview.height).toBe(24);
  expect(rect("marks").top).toBeCloseTo(preview.top + 2, 0);
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
  expect(rect("marks").top).toBeCloseTo(rect("preview").top + 2, 0);
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

for (const [lines, text] of [
  ["two-line", LONG],
  ["one-line", SHORT],
] as const)
  it(`keeps the marks' outer ring inside the clamp of a ${lines} preview, in dark`, () => {
    render(<Row text={text} dark />);
    const box = rect("preview");
    const count = rect("count");
    expect(box.right - count.right).toBeGreaterThanOrEqual(1.5);
    expect(count.top - box.top).toBeGreaterThanOrEqual(1.5);
    expect(box.bottom - count.bottom).toBeGreaterThanOrEqual(1.5);
  });

it("shows no ink of a clamped third line in the room below the second", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  render(<Row text={LONG.repeat(3)} dark />);
  const preview = screen.getByTestId("preview");
  const box = preview.getBoundingClientRect();
  const shot = await page.screenshot({ element: preview, base64: true, save: false });
  const image = new Image();
  image.src = `data:image/png;base64,${shot}`;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);
  const scale = image.height / box.height;
  // The last 2px: the padding under the second line, where the third line's
  // box starts. It must be the canvas alone, one colour.
  const strip = context.getImageData(
    0,
    Math.floor(image.height - 2 * scale),
    image.width,
    Math.floor(2 * scale),
  ).data;
  const colours = new Set<string>();
  for (let i = 0; i < strip.length; i += 4)
    colours.add(`${strip[i]},${strip[i + 1]},${strip[i + 2]}`);
  expect([...colours]).toHaveLength(1);
});

it("keeps the marks' outer ring inside the clamp, in dark", () => {
  render(<Row text={LONG} dark />);
  const preview = screen.getByTestId("preview");
  const box = preview.getBoundingClientRect();
  const count = rect("count");
  // The ring is a 1.5px shadow outside the count; the clamp clips at the
  // preview's padding box, which has to hold it.
  expect(getComputedStyle(screen.getByTestId("count")).boxShadow).toContain("1.5px");
  expect(box.right - count.right).toBeGreaterThanOrEqual(1.5);
  expect(count.top - box.top).toBeGreaterThanOrEqual(1.5);
  // The text lines stay where they were: the padding is taken back by the margin.
  expect(rect("content").right - box.right).toBe(-2);
  expect(rect("title").bottom).toBeCloseTo(box.top + 2, 0);
});

it("turns an unread message foreground, with the place still in hint", () => {
  render(<Row text={LONG} />);
  const probe = document.createElement("span");
  probe.className = "text-foreground";
  document.body.append(probe);
  const foreground = getComputedStyle(probe).color;
  probe.remove();
  expect(getComputedStyle(screen.getByTestId("message")).color).toBe(foreground);
  expect(getComputedStyle(screen.getByTestId("location")).color).not.toBe(foreground);
});

it("keeps a long place to one line, cut at its end, so the message still starts on the first", () => {
  render(<Row text={LONG} place={`#${"very-long-channel-name-".repeat(6)} ·`} />);
  const preview = rect("preview");
  const place = rect("location");
  expect(place.height).toBe(20);
  expect(place.top).toBeCloseTo(preview.top + 2, 0);
  expect(place.right - preview.left).toBeLessThanOrEqual(preview.width * 0.6 + 1);
  const message = textRects("message");
  expect(Math.min(...message.map((r) => r.top))).toBeLessThan(preview.top + 2 + 20);
  expect(preview.height).toBe(44);
});

it("gives the preview's skeleton the two-line row's height", () => {
  render(
    <div className="w-[390px]">
      <InboxItemSkeleton data-testid="skeleton" density="compact" leading preview />
    </div>,
  );
  expect(rect("skeleton").height).toBe(76);
});
