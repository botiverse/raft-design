import "./comment.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarGroup } from "../avatar";
import { CommentCard } from "./comment-card";
import {
  CommentEntry,
  CommentEntryAuthor,
  CommentEntryBody,
  CommentEntryHeader,
  CommentEntryTime,
} from "./comment-entry";
import { CommentMargin, CommentMarginItem } from "./comment-margin";
import { CommentMarker } from "./comment-marker";
import { useCommentMarginFits } from "./use-comment-margin-fits";

// The margin measures its cards in a real browser and resolves collisions:
// a card sits level with its anchor when there is room, stacks under the card
// before it when there isn't, and the active card is pinned to its anchor
// while the others make room. Measured from the rendered boxes, not from the
// layout function, so a margin that stopped measuring or placing would fail.

const it = test.skipIf(typeof window === "undefined");

let coarse = false;

afterEach(async () => {
  cleanup();
  if (typeof window === "undefined" || !coarse) return;
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  coarse = false;
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

const HEIGHT = 80;

type Item = { id: string; top: number };

const APART: Item[] = [
  { id: "a", top: 0 },
  { id: "b", top: 120 },
  { id: "c", top: 300 },
];
const OVERLAPPING: Item[] = [
  { id: "a", top: 40 },
  { id: "b", top: 60 },
  { id: "c", top: 70 },
];
const CROWDED: Item[] = [
  { id: "a", top: 200 },
  { id: "b", top: 230 },
  { id: "c", top: 250 },
];

function Margin({ items, active, gap }: { items: Item[]; active?: string; gap?: number }) {
  return (
    <ThemeProvider>
      <div style={{ width: 280 }}>
        <CommentMargin data-testid="margin" gap={gap}>
          {items.map((item) => (
            <CommentMarginItem
              key={item.id}
              data-testid={item.id}
              top={item.top}
              active={item.id === active}
            >
              <div style={{ height: HEIGHT }} />
            </CommentMarginItem>
          ))}
        </CommentMargin>
      </div>
    </ThemeProvider>
  );
}

const offset = (id: string) =>
  screen.getByTestId(id).getBoundingClientRect().top -
  screen.getByTestId("margin").getBoundingClientRect().top;

async function settled() {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  // Let the 150ms move finish.
  await new Promise((resolve) => setTimeout(resolve, 250));
}

it("cards with room sit level with their anchors, and the margin is as tall as they need", async () => {
  render(<Margin items={APART} />);
  await settled();
  expect(offset("a")).toBeCloseTo(0, 0);
  expect(offset("b")).toBeCloseTo(120, 0);
  expect(offset("c")).toBeCloseTo(300, 0);
  expect(screen.getByTestId("margin").getBoundingClientRect().height).toBeCloseTo(380, 0);
  expect(screen.getByTestId("b").dataset.top).toBe("120");
});

it("overlapping cards stack under the one before them, the gap apart", async () => {
  render(<Margin gap={12} items={OVERLAPPING} />);
  await settled();
  expect(offset("a")).toBeCloseTo(40, 0);
  expect(offset("b")).toBeCloseTo(40 + HEIGHT + 12, 0);
  expect(offset("c")).toBeCloseTo(40 + 2 * (HEIGHT + 12), 0);
  const a = screen.getByTestId("a").getBoundingClientRect();
  const b = screen.getByTestId("b").getBoundingClientRect();
  expect(b.top - a.bottom).toBeCloseTo(12, 0);
});

it("activating a card pins it to its anchor and moves its neighbours out of the way", async () => {
  const { rerender } = render(<Margin items={CROWDED} />);
  await settled();
  expect(offset("b")).toBeCloseTo(200 + HEIGHT + 8, 0);

  rerender(<Margin items={CROWDED} active="b" />);
  await settled();
  expect(offset("b")).toBeCloseTo(230, 0);
  expect(offset("a")).toBeCloseTo(230 - 8 - HEIGHT, 0);
  expect(offset("c")).toBeCloseTo(230 + HEIGHT + 8, 0);
  expect(screen.getByTestId("b").hasAttribute("data-active")).toBe(true);
});

it("a card that grows pushes the cards below it down", async () => {
  function Growing({ tall }: { tall: boolean }) {
    return (
      <ThemeProvider>
        <CommentMargin data-testid="margin">
          <CommentMarginItem data-testid="a" top={0}>
            <div style={{ height: tall ? 200 : 40 }} />
          </CommentMarginItem>
          <CommentMarginItem data-testid="b" top={60}>
            <div style={{ height: 40 }} />
          </CommentMarginItem>
        </CommentMargin>
      </ThemeProvider>
    );
  }
  const { rerender } = render(<Growing tall={false} />);
  await settled();
  expect(offset("b")).toBeCloseTo(60, 0);
  rerender(<Growing tall />);
  await settled();
  expect(offset("b")).toBeCloseTo(208, 0);
});

it("the time follows the author, not the far edge of the card", async () => {
  render(
    <ThemeProvider>
      <div style={{ width: 280 }}>
        <CommentCard>
          <CommentEntry>
            <CommentEntryHeader data-testid="header">
              <Avatar size="xs" type="human" />
              <CommentEntryAuthor data-testid="author">Martin</CommentEntryAuthor>
              <CommentEntryTime data-testid="time" dateTime="2026-10-20T11:02:00Z">
                11:02
              </CommentEntryTime>
            </CommentEntryHeader>
            <CommentEntryBody>An hour feels short.</CommentEntryBody>
          </CommentEntry>
        </CommentCard>
      </div>
    </ThemeProvider>,
  );
  const author = screen.getByTestId("author").getBoundingClientRect();
  const time = screen.getByTestId("time");
  const header = screen.getByTestId("header").getBoundingClientRect();
  const gap = time.getBoundingClientRect().left - author.right;
  expect(gap).toBeGreaterThanOrEqual(4);
  expect(gap).toBeLessThanOrEqual(8);
  expect(header.right - time.getBoundingClientRect().right).toBeGreaterThan(100);
  expect(time.tagName).toBe("TIME");
  expect((time as HTMLTimeElement).dateTime).toBe("2026-10-20T11:02:00Z");
});

it("a marker is a button named by the caller", async () => {
  render(
    <ThemeProvider>
      <CommentMarker aria-label="2 comments" active>
        <AvatarGroup>
          <Avatar size="2xs" type="agent" />
          <Avatar size="2xs" type="human" />
        </AvatarGroup>
        2
      </CommentMarker>
    </ThemeProvider>,
  );
  const marker = screen.getByRole("button", { name: "2 comments" });
  expect(marker.tagName).toBe("BUTTON");
  expect(marker.getAttribute("type")).toBe("button");
  expect(marker.hasAttribute("data-active")).toBe(true);
  expect(marker.getBoundingClientRect().height).toBeCloseTo(24, 0);
});

function Viewer({ width }: { width: number }) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const fits = useCommentMarginFits(element);
  return (
    <div ref={setElement} data-testid="viewer" data-fits={fits} style={{ width }}>
      {fits ? "margin" : "markers"}
    </div>
  );
}

const fits = () => screen.getByTestId("viewer").dataset.fits;

it("the margin fits a desktop viewer from 784px wide, and not one narrower", async () => {
  await viewport(1280);
  const { rerender } = render(<Viewer width={900} />);
  await settled();
  expect(fits()).toBe("true");
  rerender(<Viewer width={783} />);
  await settled();
  expect(fits()).toBe("false");
  rerender(<Viewer width={784} />);
  await settled();
  expect(fits()).toBe("true");
});

it("the margin doesn't fit below the desktop width, however wide the viewer", async () => {
  await viewport(700);
  render(<Viewer width={900} />);
  await settled();
  expect(fits()).toBe("false");
});

it("the margin doesn't fit on a touch screen, however wide the viewer", async () => {
  await viewport(1280);
  const { cdp } = await import("vite-plus/test/browser/context");
  coarse = true;
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  expect(window.matchMedia("(pointer: coarse)").matches).toBe(true);
  render(<Viewer width={900} />);
  await settled();
  expect(fits()).toBe("false");
});
