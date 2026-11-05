import "./inbox-item.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";
import {
  InboxItem,
  InboxItemActions,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemHoverTarget,
  InboxItemLeading,
  InboxItemLine,
  InboxItemListGroup,
  InboxItemListHeading,
  InboxItemMarks,
  InboxItemMetadata,
  InboxItemStatus,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTrigger,
} from "./inbox-item";

// The Activity row parts the Raft web app's Activity list needs: hover-revealed actions
// (hidden at rest with a mouse, shown on hover / focus / active, at rest on a
// touch screen), a leading avatar with the divider after it, the compact
// one-line row, and badges that take the pointer for their tooltips. Measured
// in a real browser; jsdom has no media queries, hover or layout.

const it = test.skipIf(typeof window === "undefined");

const LONG =
  "Bugen handed off the release checklist for the launch week review and wants your OK before Friday";

// Touch is emulated through CDP. Turning touch emulation off again leaves
// Chromium with `pointer: none` / `hover: none`, not the mouse it started with,
// so the touch test runs last, and afterAll hands the mouse back: in a run that
// shares one browser, the next file would otherwise have no hover at all.
let touch = false;
let touchUsed = false;
async function setCoarsePointer(enabled: boolean) {
  if (enabled === touch) return;
  touch = enabled;
  touchUsed ||= enabled;
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled, maxTouchPoints: 1 });
}

let noTransitions: HTMLStyleElement | undefined;

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(480, 800);
  noTransitions = document.createElement("style");
  noTransitions.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.append(noTransitions);
});

afterEach(async () => {
  cleanup();
  if (typeof window === "undefined") return;
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  await setCoarsePointer(false);
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  noTransitions?.remove();
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
  if (touchUsed) {
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [
        { name: "pointer", value: "fine" },
        { name: "hover", value: "hover" },
      ],
    });
  }
  expect(matchMedia("(pointer: fine) and (hover: hover)").matches).toBe(true);
});

function RevealRow({ active, density }: { active?: boolean; density?: "compact" }) {
  return (
    <div className="w-[440px]">
      <InboxItem data-testid="row" active={active} density={density} data-unread>
        <InboxItemTrigger aria-label="Open Martin needs your OK" />
        <InboxItemContent>
          <InboxItemHeading>
            <InboxItemTitle>Martin needs your OK</InboxItemTitle>
          </InboxItemHeading>
          <InboxItemBody>Can you check the rollout plan?</InboxItemBody>
        </InboxItemContent>
        <InboxItemTrailing data-testid="trailing">
          <InboxItemTimestamp data-testid="time">2m</InboxItemTimestamp>
          <InboxItemActions reveal="hover" data-testid="actions">
            <Button variant="outline" size="icon-md" aria-label="Mark as done">
              D
            </Button>
          </InboxItemActions>
          {density ? (
            <InboxItemMarks data-testid="marks">
              <span>3</span>
            </InboxItemMarks>
          ) : null}
        </InboxItemTrailing>
      </InboxItem>
    </div>
  );
}

const opacity = (el: Element) => getComputedStyle(el).opacity;
const pointerEvents = (el: Element) => getComputedStyle(el).pointerEvents;

it("hides hover-revealed actions at rest with a mouse and keeps them reachable by keyboard", async () => {
  expect(matchMedia("(pointer: fine) and (hover: hover)").matches).toBe(true);
  render(<RevealRow />);
  const actions = screen.getByTestId("actions");
  expect(opacity(actions)).toBe("0");
  expect(pointerEvents(actions)).toBe("none");
  expect(opacity(screen.getByTestId("time"))).toBe("1");
  expect(getComputedStyle(screen.getByTestId("trailing"), "::after").opacity).toBe("1");
  const done = screen.getByRole("button", { name: "Mark as done" });
  done.focus();
  expect(document.activeElement).toBe(done);
  expect(opacity(actions)).toBe("1");
  expect(pointerEvents(actions)).toBe("auto");
  expect(opacity(screen.getByTestId("time"))).toBe("0");
});

it("shows hover-revealed actions on hover and the timestamp steps aside", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(<RevealRow />);
  await userEvent.hover(screen.getByTestId("row"));
  const actions = screen.getByTestId("actions");
  expect(opacity(actions)).toBe("1");
  expect(pointerEvents(actions)).toBe("auto");
  expect(opacity(screen.getByTestId("time"))).toBe("0");
  // The attention dot steps aside with the timestamp.
  expect(getComputedStyle(screen.getByTestId("trailing"), "::after").opacity).toBe("0");
  // The actions take the timestamp's place instead of widening the column.
  const time = screen.getByTestId("time").getBoundingClientRect();
  const box = actions.getBoundingClientRect();
  expect(Math.round(box.right)).toBe(Math.round(time.right));
});

it("shows hover-revealed actions on row focus and on the active row", async () => {
  const { rerender } = render(<RevealRow />);
  screen.getByRole("button", { name: "Open Martin needs your OK" }).focus();
  expect(opacity(screen.getByTestId("actions"))).toBe("1");
  (document.activeElement as HTMLElement).blur();
  expect(opacity(screen.getByTestId("actions"))).toBe("0");
  rerender(<RevealRow active />);
  expect(opacity(screen.getByTestId("actions"))).toBe("1");
});

it("leaves actions without reveal visible at rest", async () => {
  render(
    <InboxItem>
      <InboxItemTrigger aria-label="Open" />
      <InboxItemContent>
        <InboxItemTitle>Title</InboxItemTitle>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemActions data-testid="actions">
          <Button variant="outline" size="icon-md" aria-label="Mark as done">
            D
          </Button>
        </InboxItemActions>
      </InboxItemTrailing>
    </InboxItem>,
  );
  expect(opacity(screen.getByTestId("actions"))).toBe("1");
  expect(getComputedStyle(screen.getByTestId("actions")).position).toBe("static");
});

function ListRow() {
  return (
    <div className="flex w-[440px] flex-col gap-0.5">
      {[1, 2].map((n) => (
        <InboxItem key={n} density="compact" data-testid={`row-${n}`}>
          <InboxItemTrigger aria-label={`Open ${n}`} />
          <InboxItemLeading data-testid={`leading-${n}`}>
            <span className="block size-9 rounded-full bg-ink-10" />
          </InboxItemLeading>
          <InboxItemContent data-testid={`content-${n}`}>
            <InboxItemHeading>
              <InboxItemTitle data-testid={`title-${n}`}>{LONG}</InboxItemTitle>
            </InboxItemHeading>
            <InboxItemBody data-testid={`body-${n}`}>{LONG}</InboxItemBody>
          </InboxItemContent>
          <InboxItemTrailing>
            <InboxItemTimestamp>2m</InboxItemTimestamp>
            <InboxItemMarks>3</InboxItemMarks>
          </InboxItemTrailing>
        </InboxItem>
      ))}
    </div>
  );
}

it("draws no divider; the leading visual and text keep their places inside the inset shape", async () => {
  render(<ListRow />);
  const row = screen.getByTestId("row-2");
  const rowLeft = row.getBoundingClientRect().left;
  const shape = getComputedStyle(row, "::before");
  expect(shape.borderTopWidth).toBe("0px");
  expect([shape.top, shape.right, shape.bottom, shape.left]).toEqual(["0px", "8px", "0px", "8px"]);
  // The list spaces the rows 2px apart; the shape is as tall as the row.
  expect(
    row.getBoundingClientRect().top - screen.getByTestId("row-1").getBoundingClientRect().bottom,
  ).toBe(2);
  const leading = screen.getByTestId("leading-2").getBoundingClientRect();
  // The content is padded from the shape: 8px inset + 12px inside it.
  expect(leading.left - rowLeft).toBe(20);
  expect(leading.width).toBe(36);
  expect(screen.getByTestId("content-2").getBoundingClientRect().left - rowLeft).toBe(68);
});

it("sets a compact row on one line each for the title and the excerpt", async () => {
  render(<ListRow />);
  const title = screen.getByTestId("title-1");
  expect(title.getBoundingClientRect().height).toBe(20);
  expect(getComputedStyle(title).paddingLeft).toBe("0px");
  expect(screen.getByTestId("body-1").getBoundingClientRect().height).toBe(20);
  expect(screen.getByTestId("row-1").getBoundingClientRect().height).toBe(64);
});

let opened = 0;
function handleOpen() {
  opened++;
}

it("lets a badge in the content take the pointer for its tooltip, and a click on it opens the item", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  opened = 0;
  render(
    <InboxItem>
      <InboxItemTrigger aria-label="Open" onClick={handleOpen} />
      <InboxItemContent>
        <InboxItemTitle>Title</InboxItemTitle>
        <InboxItemMetadata>
          <Tooltip>
            <TooltipTrigger
              render={<InboxItemHoverTarget render={<Badge variant="primary" />} />}
              data-testid="badge"
            >
              Mention
            </TooltipTrigger>
            <TooltipContent>Someone mentioned you</TooltipContent>
          </Tooltip>
          <Badge data-testid="plain">Plain</Badge>
        </InboxItemMetadata>
      </InboxItemContent>
    </InboxItem>,
  );
  const badge = screen.getByTestId("badge");
  const at = (el: Element) => {
    const r = el.getBoundingClientRect();
    return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  };
  expect(badge.contains(at(badge))).toBe(true);
  // A badge without it still lets the pointer through to the trigger.
  expect(at(screen.getByTestId("plain"))?.getAttribute("data-slot")).toBe("inbox-item-open");
  await userEvent.hover(badge);
  expect(await screen.findByText("Someone mentioned you")).toBeTruthy();
  await userEvent.click(badge);
  expect(opened).toBe(1);
});

// The compact row without a trailing column: the time in the heading, the marks
// on the excerpt's line, a ghost Done centred on the row.
function FullWidthRow({ older, active }: { older?: boolean; active?: boolean }) {
  return (
    <div className="w-[440px]">
      <InboxItem density="compact" data-testid="row" active={active}>
        <InboxItemTrigger aria-label="Open" onClick={handleOpen} />
        <InboxItemLeading>
          <span className="block size-9 rounded-full bg-ink-10" />
        </InboxItemLeading>
        <InboxItemContent data-testid="content">
          <InboxItemHeading data-testid="heading">
            <InboxItemTitle data-testid="title">{LONG}</InboxItemTitle>
            <Tooltip>
              <TooltipTrigger
                render={
                  <InboxItemTimestamp reveal={older ? "hover" : undefined} data-testid="time" />
                }
              >
                2m
              </TooltipTrigger>
              <TooltipContent>The whole time</TooltipContent>
            </Tooltip>
          </InboxItemHeading>
          <InboxItemLine data-testid="line">
            <InboxItemBody data-testid="body">{LONG}</InboxItemBody>
            <InboxItemMarks data-testid="marks">
              <span>3</span>
            </InboxItemMarks>
          </InboxItemLine>
          <InboxItemActions reveal="hover" data-testid="actions">
            <Button variant="ghost" size="icon-md" aria-label="Mark as done" data-testid="done">
              D
            </Button>
          </InboxItemActions>
        </InboxItemContent>
      </InboxItem>
    </div>
  );
}

const rect = (id: string) => screen.getByTestId(id).getBoundingClientRect();
const display = (id: string) => getComputedStyle(screen.getByTestId(id)).display;

it("runs both lines of a compact row with no trailing column to the row's inner padding", async () => {
  render(<FullWidthRow />);
  const rowRight = rect("row").right;
  // 8px to the shape + 12px inside it; no empty column or its gap in between.
  expect(rowRight - rect("content").right).toBe(20);
  expect(rowRight - rect("time").right).toBeCloseTo(20, 1);
  expect(rowRight - rect("marks").right).toBeCloseTo(20, 1);
  // On the title's baseline, with the line held at its height. How far the time's
  // box then sits from the line's top depends on the two fonts' metrics, so its
  // place can't be exact: its middle is held to the line instead.
  expect(getComputedStyle(screen.getByTestId("heading")).alignItems).toBe("baseline");
  expect(rect("heading").height).toBe(20);
  const timeMiddle = (rect("time").top + rect("time").bottom) / 2;
  expect(timeMiddle).toBeGreaterThan(rect("heading").top);
  expect(timeMiddle).toBeLessThan(rect("heading").bottom);
  expect(rect("marks").top).toBeGreaterThanOrEqual(rect("line").top);
  expect(rect("marks").bottom).toBeLessThanOrEqual(rect("line").bottom);
  expect(rect("heading").bottom).toBeLessThanOrEqual(rect("line").top);
  expect(rect("title").right).toBeLessThanOrEqual(rect("time").left);
  expect(rect("body").right).toBeLessThanOrEqual(rect("marks").left);
});

it("lets an empty InboxItemMarks give the excerpt the whole line", async () => {
  render(
    <div className="w-[440px]">
      <InboxItem density="compact">
        <InboxItemContent>
          <InboxItemLine data-testid="line">
            <InboxItemBody data-testid="body">{LONG}</InboxItemBody>
            <InboxItemMarks data-testid="marks" />
          </InboxItemLine>
        </InboxItemContent>
      </InboxItem>
    </div>,
  );
  expect(display("marks")).toBe("none");
  expect(rect("body").right).toBe(rect("line").right);
});

it("centres a hover-revealed Done on the row; the time and marks stay and move over by its width", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  render(<FullWidthRow />);
  const restRight = rect("time").right;
  await page.getByTestId("row").hover();
  await expect.poll(() => opacity(screen.getByTestId("actions"))).toBe("1");
  const row = rect("row");
  const done = rect("done");
  expect((done.top + done.bottom) / 2).toBe((row.top + row.bottom) / 2);
  expect(row.right - done.right).toBe(20);
  // 32px button + 8px.
  expect(restRight - rect("time").right).toBeCloseTo(40, 1);
  expect(done.left - rect("time").right).toBeCloseTo(8, 1);
  expect(done.left - rect("marks").right).toBeCloseTo(8, 1);
  expect(opacity(screen.getByTestId("time"))).toBe("1");
  expect(opacity(screen.getByTestId("marks"))).toBe("1");
});

it("hides an older row's time at rest; it shows on hover and on keyboard focus, on the row or a control in it", async () => {
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  render(<FullWidthRow older />);
  expect(display("time")).toBe("none");
  const restTitleRight = rect("title").right;
  expect(rect("row").right - restTitleRight).toBe(20);

  await page.getByTestId("row").hover();
  await expect.poll(() => display("time")).not.toBe("none");
  await userEvent.unhover(document.body);
  await expect.poll(() => display("time")).toBe("none");

  await userEvent.tab();
  expect(document.activeElement?.getAttribute("data-slot")).toBe("inbox-item-open");
  await expect.poll(() => display("time")).not.toBe("none");
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByTestId("done"));
  expect(display("time")).not.toBe("none");
});

it("keeps an older row's time hidden on the active row until the pointer or the keyboard reaches it", async () => {
  render(<FullWidthRow older active />);
  expect(display("time")).toBe("none");
  expect(opacity(screen.getByTestId("actions"))).toBe("1");
});

for (const [width, narrow] of [
  [359, true],
  [360, false],
] as const) {
  it(`shows a status ${narrow ? "by its pixel" : "with its word"} in a row ${width}px wide, whatever the window`, async () => {
    render(
      <div style={{ width }}>
        <InboxItem density="compact" data-testid="row">
          <InboxItemTrigger aria-labelledby="status" />
          <InboxItemContent>
            <InboxItemLine>
              <InboxItemBody>{LONG}</InboxItemBody>
              <InboxItemMarks>
                <InboxItemStatus id="status" status="in-progress" data-testid="word">
                  In progress
                </InboxItemStatus>
              </InboxItemMarks>
            </InboxItemLine>
          </InboxItemContent>
        </InboxItem>
      </div>,
    );
    const pixel = screen
      .getByTestId("row")
      .querySelector("[data-slot=inbox-item-status-pixel]") as HTMLElement;
    expect(rect("row").width).toBe(width);
    expect(display("word") === "none").toBe(narrow);
    expect(getComputedStyle(pixel).display === "none").toBe(!narrow);
    // The word still names the trigger when it isn't on screen.
    expect(screen.getByRole("button", { name: "In progress" })).toBeTruthy();
  });
}

it("keeps a status as its word in a row with a trailing column, however narrow, even in another container", async () => {
  render(
    <div className="@container" style={{ width: 300 }}>
      <InboxItem density="compact" data-testid="row">
        <InboxItemTrigger aria-label="Open" />
        <InboxItemContent>
          <InboxItemBody>{LONG}</InboxItemBody>
        </InboxItemContent>
        <InboxItemTrailing>
          <InboxItemMarks>
            <InboxItemStatus status="in-progress" data-testid="word">
              In progress
            </InboxItemStatus>
          </InboxItemMarks>
        </InboxItemTrailing>
      </InboxItem>
    </div>,
  );
  const pixel = screen
    .getByTestId("row")
    .querySelector("[data-slot=inbox-item-status-pixel]") as HTMLElement;
  expect(display("word")).not.toBe("none");
  expect(getComputedStyle(pixel).display).toBe("none");
});

function ListGroupRow({ id, title }: { id: string; title: string }) {
  return (
    <InboxItem density="compact" data-testid={id}>
      <InboxItemContent data-testid={`${id}-content`}>
        <InboxItemHeading>
          <InboxItemTitle>{title}</InboxItemTitle>
        </InboxItemHeading>
      </InboxItemContent>
    </InboxItem>
  );
}

it("starts a list heading on the rows' content line, 8px over its group's first row and further from the row above", async () => {
  render(
    <div className="flex w-[440px] flex-col gap-0.5 py-2">
      <InboxItemListGroup data-testid="first-group">
        <InboxItemListHeading>Today</InboxItemListHeading>
        <ListGroupRow id="row-a" title="A" />
      </InboxItemListGroup>
      <InboxItemListGroup data-testid="next-group">
        <InboxItemListHeading data-testid="next">Yesterday</InboxItemListHeading>
        <ListGroupRow id="row-b" title="B" />
      </InboxItemListGroup>
    </div>,
  );
  const next = screen.getByTestId("next");
  expect(next.tagName).toBe("H3");
  const style = getComputedStyle(next);
  expect(style.paddingLeft).toBe("20px");
  expect(style.fontWeight).toBe("700");
  expect(rect("row-a-content").left - rect("row-a").left).toBe(20);
  // 4px under the words, its 2px margin, the group's 2px gap.
  expect(rect("row-b").top - rect("next").bottom).toBe(4);
  expect(rect("row-b").top - (rect("next").bottom - Number.parseFloat(style.paddingBottom))).toBe(
    8,
  );
  // The list's 2px gap and the group's 6px margin, then 4px above the words.
  expect(rect("next").top - rect("row-a").bottom).toBe(8);
  expect(getComputedStyle(screen.getByTestId("first-group")).marginTop).toBe("0px");
  expect(getComputedStyle(screen.getByTestId("next-group")).marginTop).toBe("6px");
});

it("lets the next group's sticky heading push the last one out of the scroller", async () => {
  const sticky = "sticky top-0 z-20 bg-layer-canvas";
  render(
    <div data-testid="scroller" className="h-40 w-[440px] overflow-y-auto">
      <InboxItemListGroup>
        <InboxItemListHeading className={sticky} data-testid="today">
          Today
        </InboxItemListHeading>
        <ListGroupRow id="row-a" title="A" />
        <ListGroupRow id="row-b" title="B" />
        <ListGroupRow id="row-c" title="C" />
      </InboxItemListGroup>
      <InboxItemListGroup>
        <InboxItemListHeading className={sticky} data-testid="yesterday">
          Yesterday
        </InboxItemListHeading>
        <ListGroupRow id="row-d" title="D" />
        <ListGroupRow id="row-e" title="E" />
        <ListGroupRow id="row-f" title="F" />
      </InboxItemListGroup>
      <div className="h-96" />
    </div>,
  );
  const scroller = screen.getByTestId("scroller");
  const top = scroller.getBoundingClientRect().top;
  scroller.scrollTop = rect("row-b").top - top;
  await expect.poll(() => rect("today").top).toBe(top);
  // Scrolled until the next heading reaches the top: it has taken the top alone.
  scroller.scrollTop += rect("yesterday").top - top;
  await expect.poll(() => rect("yesterday").top).toBe(top);
  expect(rect("today").bottom).toBeLessThanOrEqual(top);
});

it("lets the time take the pointer for its tooltip, and a click on it opens the item", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  opened = 0;
  render(<FullWidthRow />);
  const time = screen.getByTestId("time");
  expect(pointerEvents(time)).toBe("auto");
  const box = time.getBoundingClientRect();
  expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)).toBe(time);
  // The row first, as a pointer arrives: hovering it moves the time over, so a
  // pointer aimed at where the time rests would end up on Done.
  await userEvent.hover(screen.getByTestId("row"));
  await userEvent.hover(time);
  await expect.poll(() => screen.queryByText("The whole time"), { timeout: 3000 }).not.toBeNull();
  await userEvent.click(time);
  expect(opened).toBe(1);
});

it("shows hover-revealed actions at rest on a touch screen, with room made for them", async () => {
  await setCoarsePointer(true);
  expect(matchMedia("(pointer: coarse)").matches).toBe(true);
  const { unmount } = render(<RevealRow />);
  const dot = getComputedStyle(screen.getByTestId("trailing"), "::after");
  expect(dot.display).toBe("block");
  expect(dot.marginRight).toBe("44px");
  unmount();
  render(<RevealRow density="compact" />);
  const actions = screen.getByTestId("actions");
  expect(opacity(actions)).toBe("1");
  expect(pointerEvents(actions)).toBe("auto");
  for (const id of ["time", "marks"]) {
    const el = screen.getByTestId(id);
    expect(opacity(el)).toBe("1");
    expect(el.getBoundingClientRect().right).toBeLessThanOrEqual(
      actions.getBoundingClientRect().left,
    );
  }
  cleanup();

  // In the same test: a row with no trailing column makes room too, and an older
  // time stays hidden. Touch stays on, as turning it off and on again is untried.
  render(<FullWidthRow older />);
  expect(opacity(screen.getByTestId("actions"))).toBe("1");
  expect(getComputedStyle(screen.getByTestId("content")).paddingRight).toBe("44px");
  expect(rect("done").left - rect("marks").right).toBeCloseTo(12, 1);
  expect(display("time")).toBe("none");
});
