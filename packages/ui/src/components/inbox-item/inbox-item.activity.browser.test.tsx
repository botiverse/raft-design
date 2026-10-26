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
  InboxItemMarks,
  InboxItemMetadata,
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
// Chromium with `pointer: none` / `hover: none` for the rest of the file, not
// the mouse it started with, so the touch test runs last.
let touch = false;
async function setCoarsePointer(enabled: boolean) {
  if (enabled === touch) return;
  touch = enabled;
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
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
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
  expect(leading.left - rowLeft).toBe(16);
  expect(leading.width).toBe(36);
  expect(screen.getByTestId("content-2").getBoundingClientRect().left - rowLeft).toBe(64);
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
});
