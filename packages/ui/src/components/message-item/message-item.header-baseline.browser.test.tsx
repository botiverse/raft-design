import "./message-reference.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarFallback } from "../avatar";
import { Badge } from "../badge";
import { MessageItem } from "./message-item-root";
import { MessageItemAvatarSlot } from "./message-item-gutter";
import { MessageItemBody, MessageItemContent } from "./message-item-content";
import {
  MessageItemHeader,
  MessageItemInlineStatus,
  MessageItemMeta,
  MessageItemSender,
  MessageItemSenderBadges,
  MessageItemSenderButton,
  MessageItemSenderGroup,
  MessageItemTime,
} from "./message-item-header";
import { MessageItemDelegatedBy, MessageItemDelegatedByName } from "./message-item-delegated";

// The sender line is one line of text in three sizes and two faces: the name
// in bold Space Grotesk, the role, the model and a badge's words in caption
// Space Grotesk, the time in Space Mono. Their letters stand on one baseline
// (alignment.md, "Text of different sizes on one line"), with or without a
// "sent by" label, on one line or wrapped, at a desktop and a phone size.
// Centring the boxes instead lifts the smaller notes off the name's baseline.
// Measured in the design's own fonts, in a real browser.

const it = test.skipIf(typeof window === "undefined");

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const loaded = await Promise.all(
    ['700 16px "Space Grotesk"', '500 12px "Space Grotesk"', '400 12px "Space Mono"'].map((font) =>
      document.fonts.load(font),
    ),
  );
  for (const faces of loaded) expect(faces.length).toBeGreaterThan(0);
});

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

function Row({ width, children }: { width: number; children: ReactNode }) {
  return (
    <ThemeProvider>
      <div style={{ width }}>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="agent">
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader data-testid="header">{children}</MessageItemHeader>
            <MessageItemBody>这个频道还没有 description。</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </div>
    </ThemeProvider>
  );
}

const TIME = (
  <MessageItemTime data-text="time" dateTime="2026-10-21T04:11:00+08:00">
    04:11
  </MessageItemTime>
);

const CASES: Record<string, (width: number) => ReactNode> = {
  "agent with model and role": (width) => (
    <Row width={width}>
      <MessageItemSenderGroup>
        <MessageItemSender data-text="name">Cindy</MessageItemSender>
        <MessageItemMeta data-text="meta">DeepSeek V4.1 Flash · Chief of Staff</MessageItemMeta>
      </MessageItemSenderGroup>
      {TIME}
    </Row>
  ),
  "badges and an inline status": (width) => (
    <Row width={width}>
      <MessageItemSenderGroup>
        <MessageItemSender data-text="name">Release Coordinator</MessageItemSender>
        <MessageItemSenderBadges>
          <Badge appearance="outline" data-text="outline badge">
            agent
          </Badge>
          <Badge appearance="soft" variant="muted" data-text="soft badge">
            Left
          </Badge>
        </MessageItemSenderBadges>
        <MessageItemMeta data-text="meta">Release and compliance</MessageItemMeta>
      </MessageItemSenderGroup>
      {TIME}
      <MessageItemInlineStatus data-text="status">Converting…</MessageItemInlineStatus>
    </Row>
  ),
  "a name that opens a profile": (width) => (
    <Row width={width}>
      <MessageItemSenderGroup>
        <MessageItemSenderButton data-text="name">Martin</MessageItemSenderButton>
        <MessageItemMeta data-text="meta">Product &amp; Brand</MessageItemMeta>
      </MessageItemSenderGroup>
      {TIME}
    </Row>
  ),
  "a Chinese name": (width) => (
    <Row width={width}>
      <MessageItemSenderGroup>
        <MessageItemSender data-text="name">陈晓雨</MessageItemSender>
        <MessageItemMeta data-text="meta">产品与品牌</MessageItemMeta>
      </MessageItemSenderGroup>
      {TIME}
    </Row>
  ),
  "a sent by label": (width) => (
    <Row width={width}>
      <MessageItemSenderGroup>
        <MessageItemSender data-text="name">Cindy</MessageItemSender>
        <MessageItemMeta data-text="meta">Chief of Staff</MessageItemMeta>
      </MessageItemSenderGroup>
      <MessageItemDelegatedBy data-text="label">
        sent by <MessageItemDelegatedByName>Friday</MessageItemDelegatedByName>
      </MessageItemDelegatedBy>
      {TIME}
    </Row>
  ),
  "a wrapped sent by label": () => (
    <Row width={300}>
      <MessageItemSenderGroup>
        <MessageItemSender data-text="name">Alexandra Konstantinopoulou</MessageItemSender>
      </MessageItemSenderGroup>
      <MessageItemDelegatedBy data-text="label">
        sent by a deleted assistant on behalf of its owner
      </MessageItemDelegatedBy>
      {TIME}
    </Row>
  ),
};

/**
 * The y of the baseline under an element's first letters, read by a
 * zero-size probe on their line. The run of text is wrapped in a span with
 * the probe first: inside a flex box (a badge) a bare probe would become a
 * flex item of its own, and the span takes the place of the run's anonymous
 * item at the same size.
 */
function baseline(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.textContent!.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const text = walker.nextNode() as Text;
  const wrap = document.createElement("span");
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  text.replaceWith(wrap);
  wrap.append(probe, text);
  const y = probe.getBoundingClientRect().top;
  wrap.replaceWith(text);
  return y;
}

function baselines() {
  const out: Record<string, number> = {};
  for (const el of screen.getByTestId("header").querySelectorAll<HTMLElement>("[data-text]")) {
    out[el.dataset.text!] = baseline(el);
  }
  return out;
}

for (const width of [1280, 390]) {
  for (const [name, row] of Object.entries(CASES)) {
    it(`${width}px, ${name}: the name, notes and time share the name's baseline`, async () => {
      await viewport(width);
      render(row(width === 1280 ? 720 : 358));
      const ys = baselines();
      const offsets = Object.fromEntries(
        Object.entries(ys).map(([key, y]) => [key, +(y - ys.name).toFixed(2)]),
      );
      for (const [key, offset] of Object.entries(offsets)) {
        expect(
          Math.abs(offset),
          `${key} against the name: ${JSON.stringify(offsets)}`,
        ).toBeLessThanOrEqual(0.5);
      }
    });
  }
}

it("aligning on the baseline keeps the line the name's height", async () => {
  // The notes' boxes are smaller than the name's and hang inside its line, so
  // a line of name, notes and time is as tall as the name's own line.
  for (const [width, line] of [
    [1280, 22],
    [390, 20],
  ]) {
    await viewport(width);
    for (const key of ["agent with model and role", "a Chinese name", "a sent by label"]) {
      render(CASES[key]!(width === 1280 ? 720 : 358));
      expect(screen.getByTestId("header").getBoundingClientRect().height, `${width}px ${key}`).toBe(
        line,
      );
      cleanup();
    }
  }
});
