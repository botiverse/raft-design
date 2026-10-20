import "./message-item.avatar-align.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { CSSProperties, ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Badge } from "../badge";
import { MessageItem } from "./message-item-root";
import {
  MessageItemAvatarSlot,
  MessageItemContinuationTime,
  MessageItemGutter,
} from "./message-item-gutter";
import { MessageItemBody, MessageItemContent } from "./message-item-content";
import {
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemSenderBadges,
  MessageItemSenderGroup,
  MessageItemTime,
} from "./message-item-header";
import { MessageItemToolbar, MessageItemToolbarButton } from "./message-item-toolbar";

// The time follows the sender and stays put when the hover toolbar shows:
// hover only adds, never removes. With a mouse the header ends where the
// toolbar begins, so nothing under it is covered; on a touch screen there is
// no toolbar and no reserve. When the line is too narrow the role gives way
// first, then the name; the badges stay whole and the time never truncates.
// Measured in a real browser; touch is emulated through CDP, and as in
// panel-action.browser.test.tsx the mouse cases run before it.

const it = test.skipIf(typeof window === "undefined");

let touching = false;

afterEach(async () => {
  cleanup();
  if (typeof window === "undefined" || !touching) return;
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
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

async function touch() {
  const { cdp } = await import("vite-plus/test/browser/context");
  touching = true;
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
}

async function settled(read: () => string): Promise<string> {
  let prev = "";
  let next = read();
  for (let i = 0; i < 40 && next !== prev; i += 1) {
    prev = next;
    await new Promise((r) => setTimeout(r, 50));
    next = read();
  }
  return next;
}

const NAME = "Release Coordinator for the Northstar Partner Workspace";
const ROLE = "claude-opus · Release and compliance · Northstar partner";

const rect = (id: string) => screen.getByTestId(id).getBoundingClientRect();
const truncated = (id: string) => {
  const el = screen.getByTestId(id);
  return el.scrollWidth > el.clientWidth;
};

function Badges() {
  return (
    <MessageItemSenderBadges data-testid="badges">
      <Badge appearance="outline">agent</Badge>
      <Badge appearance="soft" variant="muted">
        External
      </Badge>
    </MessageItemSenderBadges>
  );
}

function Toolbar() {
  return (
    <MessageItemToolbar data-testid="toolbar">
      <MessageItemToolbarButton aria-label="Reply in Thread">
        <svg viewBox="0 0 24 24" />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Add Reaction">
        <svg viewBox="0 0 24 24" />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Save Message">
        <svg viewBox="0 0 24 24" />
      </MessageItemToolbarButton>
    </MessageItemToolbar>
  );
}

function Row({ width, header }: { width: number; header: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="pt-6" style={{ width }}>
        <MessageItem data-testid="row">
          <Toolbar />
          <MessageItemAvatarSlot>
            <span className="block size-[35px]" />
          </MessageItemAvatarSlot>
          <MessageItemContent>
            {header}
            <MessageItemBody>v0.30.1 passed its smoke test on staging.</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </div>
    </ThemeProvider>
  );
}

it("the time stays visible and whole while the toolbar shows, and nothing sits under the toolbar", async () => {
  await viewport(1280);
  render(
    <Row
      width={520}
      header={
        <MessageItemHeader data-testid="header">
          <MessageItemSender data-testid="sender">{NAME}</MessageItemSender>
          <Badges />
          <MessageItemMeta data-testid="meta">{ROLE}</MessageItemMeta>
          <MessageItemTime data-testid="time">14:32</MessageItemTime>
        </MessageItemHeader>
      }
    />,
  );
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  await page.getByTestId("row").hover();
  const toolbar = screen.getByTestId("toolbar");
  expect(await settled(() => getComputedStyle(toolbar).opacity)).toBe("1");

  const time = screen.getByTestId("time");
  expect(getComputedStyle(time).opacity).toBe("1");
  expect(time.textContent).toBe("14:32");
  expect(truncated("time")).toBe(false);
  // Inside the header's box, so its overflow clips none of it.
  const header = rect("header");
  expect(rect("time").left).toBeGreaterThanOrEqual(header.left);
  expect(rect("time").right).toBeLessThanOrEqual(header.right + 0.5);
  // Nothing in the header reaches under the toolbar.
  const toolbarLeft = rect("toolbar").left;
  for (const id of ["sender", "badges", "meta", "time"]) {
    expect(rect(id).right, id).toBeLessThanOrEqual(toolbarLeft);
  }
});

function Group({ width }: { width: number }) {
  return (
    <ThemeProvider>
      <div style={{ width, "--mi-toolbar-reserve": "0px" } as CSSProperties}>
        <MessageItemHeader data-testid="header">
          <MessageItemSenderGroup>
            <MessageItemSender data-testid="sender">{NAME}</MessageItemSender>
            <Badges />
            <MessageItemMeta data-testid="meta">{ROLE}</MessageItemMeta>
          </MessageItemSenderGroup>
          <MessageItemTime data-testid="time">Yesterday 21:08</MessageItemTime>
        </MessageItemHeader>
      </div>
    </ThemeProvider>
  );
}

it("in a sender group the role gives way first, then the name; the badges and the time stay whole", async () => {
  await viewport(1280);
  render(<Group width={1200} />);
  const natural = {
    sender: rect("sender").width,
    badges: rect("badges").width,
    meta: rect("meta").width,
    time: rect("time").width,
  };
  // Everything fits: nothing truncates and the time follows the role.
  expect(truncated("sender")).toBe(false);
  expect(truncated("meta")).toBe(false);
  expect(rect("time").left - rect("meta").right).toBeLessThanOrEqual(12);
  cleanup();

  // Room for the name, the badges and half the role: only the role truncates.
  const gap = 6;
  const halfRole = natural.sender + natural.badges + natural.meta / 2 + natural.time + 3 * gap;
  render(<Group width={Math.round(halfRole)} />);
  expect(truncated("meta")).toBe(true);
  expect(truncated("sender")).toBe(false);
  expect(rect("badges").width).toBeCloseTo(natural.badges, 0);
  expect(truncated("time")).toBe(false);
  expect(rect("time").width).toBeCloseTo(natural.time, 0);
  expect(rect("time").right).toBeLessThanOrEqual(rect("header").right + 0.5);
  cleanup();

  // Not even room for the whole name: the role is gone, the name truncates.
  render(<Group width={Math.round(natural.sender / 2 + natural.badges + natural.time)} />);
  expect(rect("meta").width).toBeLessThan(1);
  expect(truncated("sender")).toBe(true);
  expect(rect("badges").width).toBeCloseTo(natural.badges, 0);
  expect(rect("badges").right).toBeLessThanOrEqual(rect("time").left);
  expect(truncated("time")).toBe(false);
  expect(rect("time").width).toBeCloseTo(natural.time, 0);
  expect(rect("time").right).toBeLessThanOrEqual(rect("header").right + 0.5);
});

it("both times render a <time> with its dateTime", async () => {
  await viewport(1280);
  render(
    <ThemeProvider>
      <MessageItemTime data-testid="time" dateTime="2026-10-20T14:32:00+08:00">
        14:32
      </MessageItemTime>
      <MessageItemGutter>
        <MessageItemContinuationTime data-testid="ct" dateTime="2026-10-20T14:33:00+08:00">
          14:33
        </MessageItemContinuationTime>
      </MessageItemGutter>
    </ThemeProvider>,
  );
  for (const [id, value] of [
    ["time", "2026-10-20T14:32:00+08:00"],
    ["ct", "2026-10-20T14:33:00+08:00"],
  ]) {
    const el = screen.getByTestId(id);
    expect(el.tagName, id).toBe("TIME");
    expect((el as HTMLTimeElement).dateTime, id).toBe(value);
  }
});

function ReserveRow({ reserve }: { reserve?: string }) {
  return (
    <ThemeProvider>
      <div style={reserve ? ({ "--mi-toolbar-reserve": reserve } as CSSProperties) : undefined}>
        <MessageItemHeader data-testid="header">
          <MessageItemSender>Ada</MessageItemSender>
          <MessageItemTime>14:32</MessageItemTime>
        </MessageItemHeader>
      </div>
    </ThemeProvider>
  );
}

const paddingEnd = () => getComputedStyle(screen.getByTestId("header")).paddingRight;

it("with a mouse the header reserves the toolbar's width, and a product can change it", async () => {
  for (const width of [600, 1280]) {
    await viewport(width);
    render(<ReserveRow />);
    expect(paddingEnd(), `at ${width}px`).toBe("104px");
    cleanup();
  }
  render(<ReserveRow reserve="8.25rem" />);
  expect(paddingEnd()).toBe("132px");
});

it("on a touch screen the header reserves nothing: there is no hover toolbar", async () => {
  await viewport(1280);
  await touch();
  render(<ReserveRow />);
  expect(paddingEnd()).toBe("0px");
});
