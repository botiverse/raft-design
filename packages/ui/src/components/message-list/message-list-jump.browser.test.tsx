import "./message-list.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import {
  MessageListJumpControls,
  MessageListJumpPill,
  MessageListJumpPillDismiss,
  MessageListJumpPillGroup,
} from "./message-list-jump";

// A jump pill is a Button at `outline md`: beside one, on a desktop (1280,
// fine pointer) and on a phone (390, touch), its label has the same size,
// line and weight, its icon is 16px and it is as tall. In slock the hand-built
// "Next Unread Thread" pill kept 12/18 type and a 12px icon after Button `md`
// moved to `text-control`. The dismiss button joins the pill on one 1.5px
// edge, and every part keeps a 44px hit area. Measured in a real browser.

const it = test.skipIf(typeof window === "undefined");

// Touch is emulated through CDP, and turning it off again leaves Chromium
// reporting `pointer: none`, not `fine`; so every desktop case runs first,
// with the headless browser's own mouse, and the phone cases after them.
afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  await page.viewport(414, 896);
});

async function desktop() {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
  expect(matchMedia("(pointer: fine)").matches).toBe(true);
}

async function phone() {
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 844);
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  await expect.poll(() => matchMedia("(pointer: coarse)").matches).toBe(true);
}

// lucide's `size={12}` writes width/height attributes, as slock's icons do.
function Arrow({ testId }: { testId: string }) {
  return <svg data-testid={testId} width="12" height="12" viewBox="0 0 24 24" aria-hidden />;
}

function Controls({ mode }: { mode: "light" | "dark" }) {
  return (
    <ThemeProvider mode={mode}>
      <div style={{ position: "relative", width: "100%", height: 300 }}>
        <MessageListJumpControls data-testid="controls">
          <Button variant="outline" size="md">
            <Arrow testId="button-icon" />
            Back to Bottom
          </Button>
          <MessageListJumpPillGroup>
            <MessageListJumpPill>
              <Arrow testId="pill-icon" />
              Next Unread Thread (3)
            </MessageListJumpPill>
            <MessageListJumpPillDismiss aria-label="Dismiss">
              <Arrow testId="dismiss-icon" />
            </MessageListJumpPillDismiss>
          </MessageListJumpPillGroup>
        </MessageListJumpControls>
      </div>
    </ThemeProvider>
  );
}

function parts() {
  return {
    controls: screen.getByTestId("controls"),
    button: screen.getByRole("button", { name: "Back to Bottom" }),
    pill: screen.getByRole("button", { name: "Next Unread Thread (3)" }),
    dismiss: screen.getByRole("button", { name: "Dismiss" }),
  };
}

const rect = (element: Element) => element.getBoundingClientRect();

/**
 * The box of an element's ::after hit area, in viewport coordinates. An
 * absolute ::after is placed from the padding box, inside the border.
 */
function hitBox(element: HTMLElement) {
  const box = rect(element);
  const style = getComputedStyle(element);
  const after = getComputedStyle(element, "::after");
  if (after.position !== "absolute") return box;
  const px = (value: string) => Number.parseFloat(value);
  const left = box.left + px(style.borderLeftWidth) + px(after.left);
  const top = box.top + px(style.borderTopWidth) + px(after.top);
  const right = box.right - px(style.borderRightWidth) - px(after.right);
  const bottom = box.bottom - px(style.borderBottomWidth) - px(after.bottom);
  return new DOMRect(left, top, right - left, bottom - top);
}

function type(element: Element) {
  const style = getComputedStyle(element);
  return {
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    fontFamily: style.fontFamily,
    gap: style.columnGap,
    paddingLeft: style.paddingLeft,
    paddingRight: style.paddingRight,
    borderTop: style.borderTopWidth,
    borderColor: style.borderTopColor,
    background: style.backgroundColor,
    radius: style.borderTopLeftRadius,
  };
}

it("the bottom controls rise above what else floats on the edge", async () => {
  await desktop();
  render(
    <ThemeProvider>
      <div
        data-testid="frame"
        style={
          { position: "relative", height: 300, "--message-list-bottom-inset": "28px" } as never
        }
      >
        <MessageListJumpControls data-testid="controls">
          <MessageListJumpPill>Back to Bottom</MessageListJumpPill>
        </MessageListJumpControls>
        <MessageListJumpControls data-testid="top" side="top">
          <MessageListJumpPill>Earliest Unread Thread</MessageListJumpPill>
        </MessageListJumpControls>
      </div>
    </ThemeProvider>,
  );
  const frame = rect(screen.getByTestId("frame"));
  expect(frame.bottom - rect(screen.getByTestId("controls")).bottom).toBe(40);
  expect(rect(screen.getByTestId("top")).top - frame.top).toBe(12);
  const controls = rect(screen.getByTestId("controls"));
  expect(
    Math.abs(controls.left + controls.width / 2 - (frame.left + frame.width / 2)),
  ).toBeLessThanOrEqual(0.5);
});

for (const [name, setup, label] of [
  ["desktop", desktop, { fontSize: "14px", lineHeight: "22px" }],
  ["phone", phone, { fontSize: "13px", lineHeight: "18px" }],
] as const) {
  for (const mode of ["light", "dark"] as const) {
    it(`${mode}, ${name}: a jump pill has the type, icon and height of Button outline md`, async () => {
      await setup();
      render(<Controls mode={mode} />);
      const { button, pill } = parts();

      const pillType = type(pill);
      const buttonType = type(button);
      // The pill's start corners are the Button's; its end joins the dismiss.
      expect(pillType).toEqual(buttonType);
      expect(pillType).toMatchObject({ ...label, fontWeight: "700" });

      expect(rect(pill).height).toBe(32);
      expect(rect(pill).height).toBe(rect(button).height);
      for (const id of ["pill-icon", "button-icon"]) {
        expect(rect(screen.getByTestId(id)).width, id).toBe(16);
        expect(rect(screen.getByTestId(id)).height, id).toBe(16);
      }
      expect(rect(screen.getByTestId("dismiss-icon")).width).toBe(16);
    });

    it(`${mode}, ${name}: the dismiss button shares one edge with the pill`, async () => {
      await setup();
      render(<Controls mode={mode} />);
      const { pill, dismiss } = parts();
      const p = rect(pill);
      const d = rect(dismiss);
      const pillStyle = getComputedStyle(pill);
      const dismissStyle = getComputedStyle(dismiss);

      expect(d.left).toBe(p.right);
      expect(d.top).toBe(p.top);
      expect(d.height).toBe(p.height);
      expect(d.width).toBe(32);
      // One line between them: the pill's end edge, and none on the dismiss.
      // (Chromium draws the 1.5px border at whole device pixels.)
      const edge = pillStyle.borderTopWidth;
      expect(Number.parseFloat(edge)).toBeGreaterThanOrEqual(1);
      expect(pillStyle.borderRightWidth).toBe(edge);
      expect(dismissStyle.borderLeftWidth).toBe("0px");
      expect(dismissStyle.borderTopWidth).toBe(edge);
      expect(dismissStyle.borderRightWidth).toBe(edge);
      expect(dismissStyle.borderTopColor).toBe(pillStyle.borderTopColor);
      expect(pillStyle.borderTopRightRadius).toBe("0px");
      expect(pillStyle.borderBottomRightRadius).toBe("0px");
      expect(dismissStyle.borderTopLeftRadius).toBe("0px");
      expect(dismissStyle.borderTopRightRadius).toBe(pillStyle.borderTopLeftRadius);
    });

    it(`${mode}, ${name}: every part keeps a 44px hit area, and the pills sit 8px apart and 12px up`, async () => {
      await setup();
      render(<Controls mode={mode} />);
      const { controls, button, pill, dismiss } = parts();

      for (const element of [button, pill, dismiss]) {
        const hit = hitBox(element);
        expect(hit.height, element.textContent ?? "").toBeGreaterThanOrEqual(44);
        expect(hit.width, element.getAttribute("aria-label") ?? "").toBeGreaterThanOrEqual(44);
      }
      // The pseudo-element is what a tap lands on.
      const d = rect(dismiss);
      const p = rect(pill);
      expect(document.elementFromPoint(d.right + 9, d.top + d.height / 2)).toBe(dismiss);
      expect(document.elementFromPoint(d.left + 16, d.bottom + 5)).toBe(dismiss);
      expect(document.elementFromPoint(p.left + 20, p.top - 5)).toBe(pill);
      // The dismiss button's hit area doesn't reach over the pill.
      expect(document.elementFromPoint(p.right - 2, p.top + 16)?.closest("button")).toBe(pill);

      const parent = rect(controls.parentElement!);
      expect(parent.bottom - rect(controls).bottom).toBe(12);
      const b = rect(button);
      if (name === "desktop") {
        expect(p.left - b.right).toBe(8);
        expect(p.top).toBe(b.top);
      } else {
        // Too wide for one row on a phone: the second pill stacks 12px above
        // the first, so their hit areas don't overlap.
        expect(b.top - p.bottom).toBe(12);
        expect(d.right).toBeLessThanOrEqual(parent.right);
        expect(rect(controls).left).toBeGreaterThanOrEqual(parent.left);
      }
    });
  }
}
