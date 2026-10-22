import "./lead-marks.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { Info, TriangleAlert } from "lucide-react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import { Badge } from "./components/badge";
import { Banner, BannerDescription, BannerTitle } from "./components/banner";
import { PanelActivity, PanelNotice, PanelNoticeContent } from "./components/panel";
import { MessageActionCardNotice } from "./components/message-action-card";
import { Status } from "./components/status";
import { toast, ToastProvider } from "./components/toast";

// A mark that leads a line of text, an icon or a status pixel, sits in a box
// one line of that text tall and is centred in it, so it stays on the first
// line when the text wraps (design/foundations/alignment.md#a-mark-that-leads-text).
// An icon's size follows the text, 1.15em on an even pixel; a status pixel
// keeps its one size, 9px with a 1.5px ink edge, whatever the text or the
// size the caller passed (status.md#sizes); 8px separate either from a
// notice's text. Measured
// with a mouse (32px controls, the desktop type scale) and on a touch screen
// (44px controls, the phone scale). Real layout only: jsdom has no boxes.

const it = test.skipIf(typeof window === "undefined");

const LONG = "This channel is shared with Acme, and everyone there can read what you post";
const CJK = "这个频道已与 Acme 共享，对方的成员和智能体都能看到你在这里发的消息";

// Text size → icon size, the iconography scale for a leading icon. A status
// light is 9px beside any text.
const ICON: Record<number, number> = { 12: 14, 13: 14, 14: 16 };
const DOT = 9;
const GAP = 8;

const DEVICES = [
  { name: "desktop", width: 1280, touch: false },
  { name: "phone", width: 390, touch: true },
] as const;

async function context() {
  return import("vite-plus/test/browser/context");
}

async function device(width: number, touch: boolean) {
  const { cdp, page } = await context();
  await page.viewport(width, 900);
  // Turning touch emulation off leaves no fine pointer, so the desktop cases
  // run first and never turn it on.
  if (touch) {
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  }
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: touch ? "coarse" : "fine" }],
  });
  await expect.poll(() => matchMedia("(pointer: fine)").matches).toBe(!touch);
  await document.fonts.ready;
}

afterEach(() => {
  toast.dismiss();
  cleanup();
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await context();
  await page.viewport(1280, 720);
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await cdp().send("Emulation.setEmulatedMedia", { features: [] });
});

function middle(rect: DOMRect) {
  return rect.top + rect.height / 2;
}

/** The middle of a block's first line box. */
function firstLine(text: HTMLElement) {
  const style = getComputedStyle(text);
  const top =
    text.getBoundingClientRect().top +
    parseFloat(style.paddingTop) +
    parseFloat(style.borderTopWidth);
  return {
    middle: top + parseFloat(style.lineHeight) / 2,
    lineHeight: parseFloat(style.lineHeight),
  };
}

function lines(text: HTMLElement) {
  return Math.round(
    text.getBoundingClientRect().height / parseFloat(getComputedStyle(text).lineHeight),
  );
}

function expectLeads(
  mark: Element,
  text: HTMLElement,
  { kind, gap = GAP, wraps }: { kind: "icon" | "dot"; gap?: number; wraps: boolean },
) {
  const fontSize = parseFloat(getComputedStyle(text).fontSize);
  const size = kind === "icon" ? ICON[fontSize] : DOT;
  const m = mark.getBoundingClientRect();
  if (wraps) expect(lines(text)).toBeGreaterThanOrEqual(2);
  else expect(lines(text)).toBe(1);
  expect(Math.abs(middle(m) - firstLine(text).middle)).toBeLessThanOrEqual(0.5);
  expect([m.width, m.height]).toEqual([size, size]);
  expect(text.getBoundingClientRect().left - m.right).toBeCloseTo(gap, 1);
}

function Frame({ width, children }: { width: number; children: ReactNode }) {
  return (
    <ThemeProvider>
      <div style={{ width }}>{children}</div>
    </ThemeProvider>
  );
}

const TEXTS = [
  { name: "one line", text: "Shared with Acme.", width: 360, wraps: false },
  { name: "wrapped", text: LONG, width: 240, wraps: true },
  { name: "wrapped Chinese", text: CJK, width: 240, wraps: true },
] as const;

for (const { name: deviceName, width: deviceWidth, touch } of DEVICES) {
  for (const size of ["md", "sm"] as const) {
    for (const { name, text, width, wraps } of TEXTS) {
      it(`${deviceName}: a ${size} Banner's icon leads its first line (${name})`, async () => {
        await device(deviceWidth, touch);
        render(
          <Frame width={width}>
            <Banner status="warning" size={size}>
              <TriangleAlert data-testid="mark" />
              <BannerDescription data-testid="text">{text}</BannerDescription>
            </Banner>
          </Frame>,
        );
        expectLeads(screen.getByTestId("mark"), screen.getByTestId("text"), {
          kind: "icon",
          wraps,
        });
      });

      it(`${deviceName}: a ${size} Banner's status pixel leads its first line (${name})`, async () => {
        await device(deviceWidth, touch);
        render(
          <Frame width={width}>
            <Banner status="warning" size={size}>
              <Status data-testid="mark" variant="warning" size="sm" />
              <BannerDescription data-testid="text">{text}</BannerDescription>
            </Banner>
          </Frame>,
        );
        expectLeads(screen.getByTestId("mark"), screen.getByTestId("text"), { kind: "dot", wraps });
      });
    }

    it(`${deviceName}: a ${size} Banner's icon leads the title, not the description`, async () => {
      await device(deviceWidth, touch);
      render(
        <Frame width={240}>
          <Banner status="info" size={size}>
            <Info data-testid="mark" />
            <BannerTitle data-testid="text">
              This channel is shared with Acme and its agents
            </BannerTitle>
            <BannerDescription>
              People and agents from Acme will see what you post.
            </BannerDescription>
          </Banner>
        </Frame>,
      );
      expectLeads(screen.getByTestId("mark"), screen.getByTestId("text"), {
        kind: "icon",
        wraps: true,
      });
    });
  }

  for (const { name, text, width, wraps } of TEXTS) {
    it(`${deviceName}: a PanelNotice's status pixel leads its first line (${name})`, async () => {
      await device(deviceWidth, touch);
      render(
        <Frame width={width + 40}>
          <PanelNotice>
            <Status data-testid="mark" variant="warning" />
            <PanelNoticeContent data-testid="text">{text}</PanelNoticeContent>
          </PanelNotice>
        </Frame>,
      );
      expectLeads(screen.getByTestId("mark"), screen.getByTestId("text"), { kind: "dot", wraps });
    });

    it(`${deviceName}: a PanelNotice's icon leads its first line (${name})`, async () => {
      await device(deviceWidth, touch);
      render(
        <Frame width={width + 40}>
          <PanelNotice>
            <TriangleAlert data-testid="mark" />
            <PanelNoticeContent data-testid="text">{text}</PanelNoticeContent>
          </PanelNotice>
        </Frame>,
      );
      expectLeads(screen.getByTestId("mark"), screen.getByTestId("text"), { kind: "icon", wraps });
    });
  }

  for (const { name, text, width, wraps } of TEXTS) {
    it(`${deviceName}: a MessageActionCardNotice's icon leads its first line (${name})`, async () => {
      await device(deviceWidth, touch);
      render(
        <Frame width={width}>
          <MessageActionCardNotice data-testid="notice">{text}</MessageActionCardNotice>
        </Frame>,
      );
      const notice = screen.getByTestId("notice");
      expectLeads(notice.querySelector("svg")!, notice.querySelector("span")!, {
        kind: "icon",
        wraps,
      });
    });
  }

  for (const description of [undefined, LONG]) {
    const shape = description ? "with a wrapped description" : "title only";
    it(`${deviceName}: a Toast's status pixel leads the title (${shape})`, async () => {
      await device(deviceWidth, touch);
      render(
        <ThemeProvider>
          <ToastProvider timeout={0} />
        </ThemeProvider>,
      );
      toast.info("Copied the link to #25.", { description });
      const title = await screen.findByText("Copied the link to #25.");
      const content = title.closest<HTMLElement>('[data-slot="toast-content"]')!;
      const mark = content.querySelector('[data-slot="toast-icon"] > [data-slot="status"]')!;
      // Measure after the enter transition: it scales the toast from 0.98.
      const root = content.closest<HTMLElement>('[data-slot="toast"]') ?? content;
      await waitFor(() => expect(root.getBoundingClientRect().width).toBe(root.offsetWidth));
      if (description) {
        expect(lines(screen.getByText(description))).toBeGreaterThanOrEqual(2);
      }
      expectLeads(mark, title, { kind: "dot", wraps: false });
    });
  }

  it(`${deviceName}: a Badge's and a PanelActivity's status pixel is 9px, centred on the caption's line`, async () => {
    await device(deviceWidth, touch);
    render(
      <ThemeProvider>
        <Badge appearance="soft" variant="primary" data-testid="badge">
          <Status data-testid="badge-dot" presence="busy" />
          Working…
        </Badge>
        <PanelActivity data-testid="activity">
          <Status data-testid="activity-dot" size="md" presence="busy" />
          Working…
        </PanelActivity>
      </ThemeProvider>,
    );
    for (const [chipId, dotId] of [
      ["badge", "badge-dot"],
      ["activity", "activity-dot"],
    ]) {
      const chip = screen.getByTestId(chipId);
      const dot = screen.getByTestId(dotId).getBoundingClientRect();
      // A chip is one line: its text node's box is the line's.
      const range = document.createRange();
      range.selectNodeContents(chip.lastChild!);
      const word = range.getBoundingClientRect();
      expect(Math.abs(middle(dot) - middle(word))).toBeLessThanOrEqual(0.5);
      expect([dot.width, dot.height]).toEqual([DOT, DOT]);
    }
  });
}
