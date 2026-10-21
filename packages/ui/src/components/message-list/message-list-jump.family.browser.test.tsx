import "./message-list.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import { MessageItem } from "../message-item/message-item-root";
import { MessageItemToolbar, MessageItemToolbarButton } from "../message-item/message-item-toolbar";
import {
  MessageTextSelectionToolbar,
  MessageTextSelectionToolbarButton,
} from "../message-item/message-text-selection-toolbar";
import { MessageListJumpPill } from "./message-list-jump";

// The controls that float in a conversation, side by side with an ordinary
// Save button (Button `md`, as in a settings row): a jump pill is a single
// action, so it is that Button exactly; the hover toolbar and the toolbar for
// selected text are groups of actions on content, so they share the Button's
// outer height, label type and 16px icon but keep 28px buttons inside a 2px
// frame (design/foundations/spacing.md#hit-targets). Measured on a desktop
// (1280, mouse) and a phone (390, touch), light and dark.

const it = test.skipIf(typeof window === "undefined");

// Turning touch emulation off leaves Chromium at `pointer: none`, so the
// desktop cases run first.
afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  await page.viewport(414, 896);
});

function Icon({ testId }: { testId: string }) {
  return <svg data-testid={testId} width="12" height="12" viewBox="0 0 24 24" aria-hidden />;
}

function Family({ mode }: { mode: "light" | "dark" }) {
  return (
    <ThemeProvider mode={mode}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
        <div>
          <Button variant="outline" size="md" data-testid="save">
            <Icon testId="save-icon" />
            Save
          </Button>
        </div>
        <div>
          <MessageListJumpPill data-testid="pill">
            <Icon testId="pill-icon" />
            Back to Bottom
          </MessageListJumpPill>
        </div>
        <div style={{ position: "relative", paddingTop: 24 }}>
          <MessageTextSelectionToolbar aria-label="Selected text" data-testid="selection">
            <MessageTextSelectionToolbarButton data-testid="selection-button">
              <Icon testId="selection-icon" />
              Quote
            </MessageTextSelectionToolbarButton>
          </MessageTextSelectionToolbar>
        </div>
        <div style={{ paddingTop: 24 }}>
          <MessageItem>
            <MessageItemToolbar data-testid="hover">
              <MessageItemToolbarButton aria-label="Add Reaction" data-testid="hover-button">
                <Icon testId="hover-icon" />
              </MessageItemToolbarButton>
            </MessageItemToolbar>
          </MessageItem>
        </div>
      </div>
    </ThemeProvider>
  );
}

const height = (id: string) => screen.getByTestId(id).getBoundingClientRect().height;
const width = (id: string) => screen.getByTestId(id).getBoundingClientRect().width;

function label(id: string) {
  const style = getComputedStyle(screen.getByTestId(id));
  return `${style.fontSize}/${style.lineHeight} ${style.fontWeight}`;
}

function measure() {
  const row = (outer: string, item: string, icon: string) => {
    const o = getComputedStyle(screen.getByTestId(outer));
    const i = getComputedStyle(screen.getByTestId(item));
    return {
      type: label(item),
      outer: height(outer),
      item: height(item),
      padding: `${i.paddingLeft} ${i.paddingRight}`,
      gap: i.columnGap,
      edge: o.borderTopWidth === "0px" ? "inset ring" : `border ${o.borderTopWidth}`,
      // A soft shadow is one with a blur; the inset ring has none.
      shadow: [...o.boxShadow.matchAll(/-?[\d.]+px -?[\d.]+px ([\d.]+)px/g)].some(
        (part) => Number(part[1]) > 0,
      ),
      radius: `${o.borderTopLeftRadius}/${i.borderTopLeftRadius}`,
      icon: `${width(icon)}`,
    };
  };
  return {
    save: row("save", "save", "save-icon"),
    pill: row("pill", "pill", "pill-icon"),
    selection: row("selection", "selection-button", "selection-icon"),
    hover: row("hover", "hover-button", "hover-icon"),
  };
}

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

for (const [name, setup, type] of [
  ["desktop", desktop, "14px/22px 700"],
  ["phone", phone, "13px/18px 700"],
] as const) {
  for (const mode of ["light", "dark"] as const) {
    it(`${mode}, ${name}: the floating controls of a conversation are one family`, async () => {
      await setup();
      render(<Family mode={mode} />);
      const m = measure();

      // A jump pill is the Save button: one action, one Button size.
      expect(m.pill).toEqual(m.save);
      // Every label in the family is `text-control` at 700.
      expect(m.pill.type).toBe(type);
      expect(m.selection.type).toBe(type);
      // Every outer edge is 32px, and every icon 16px.
      for (const control of Object.values(m)) {
        expect(control.outer).toBe(32);
        expect(control.icon).toBe("16");
      }
      // The toolbars hold 28px buttons in a 2px frame, and float as popups
      // with the soft shadow; a pill is a control, marked by its ink edge.
      expect(m.selection.item).toBe(28);
      expect(m.hover.item).toBe(28);
      expect(m.selection.shadow).toBe(true);
      expect(m.hover.shadow).toBe(true);
      expect(m.pill.shadow).toBe(false);
    });
  }
}
