import "./message-item.avatar-align.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarFallback } from "../avatar";
import { MessageItem } from "./message-item-root";
import { MessageItemAvatarSlot } from "./message-item-gutter";
import { MessageItemContent } from "./message-item-content";
import {
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemSenderGroup,
  MessageItemTime,
} from "./message-item-header";
import { MessageItemDelegatedBy, MessageItemDelegatedByName } from "./message-item-delegated";

// On a 390px phone (touch: no toolbar reserve) the name line never overlaps:
// the owner's name truncates first, the label's words stay whole even when
// they alone are wider than the label's 45% cap ("sent by a deleted
// assistant"), and the time stays whole and clear of the label. Measured in a
// real browser, with touch emulated through CDP.

const it = test.skipIf(typeof window === "undefined");

afterEach(async () => {
  cleanup();
  if (typeof window === "undefined") return;
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

async function phone() {
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 844);
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
}

// The message list's 16px padding on each side of a 390px screen.
const LIST_WIDTH = 390 - 32;

function Row({ label, role }: { label: ReactNode; role?: string }) {
  return (
    <ThemeProvider>
      <div style={{ width: LIST_WIDTH }}>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="human">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader data-testid="header">
              <MessageItemSenderGroup>
                <MessageItemSender data-testid="owner">
                  Alexandra Konstantinopoulou
                </MessageItemSender>
                {role ? <MessageItemMeta>{role}</MessageItemMeta> : null}
              </MessageItemSenderGroup>
              <MessageItemDelegatedBy data-testid="label">{label}</MessageItemDelegatedBy>
              <MessageItemTime data-testid="time">10:42</MessageItemTime>
            </MessageItemHeader>
          </MessageItemContent>
        </MessageItem>
      </div>
    </ThemeProvider>
  );
}

function expectNoOverlap() {
  const header = screen.getByTestId("header");
  const style = getComputedStyle(header);
  const contentRight = header.getBoundingClientRect().right - parseFloat(style.paddingRight);
  const owner = screen.getByTestId("owner");
  const label = screen.getByTestId("label");
  const time = screen.getByTestId("time");
  const labelRect = label.getBoundingClientRect();
  const timeRect = time.getBoundingClientRect();

  // The label's words are laid out inside its box: nothing spills past it.
  // (The name is clipped by its own box, so only the words are measured.)
  for (const node of label.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      expect(r.left, node.textContent!).toBeGreaterThanOrEqual(labelRect.left - 0.5);
      expect(r.right, node.textContent!).toBeLessThanOrEqual(labelRect.right + 0.5);
    }
  }
  expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1);
  // Owner, label and time in order, none over the next.
  expect(owner.getBoundingClientRect().right).toBeLessThanOrEqual(labelRect.left + 0.5);
  expect(labelRect.right).toBeLessThanOrEqual(timeRect.left + 0.5);
  // The time is whole and on the line.
  expect(time.scrollWidth).toBeLessThanOrEqual(time.clientWidth + 1);
  expect(timeRect.right).toBeLessThanOrEqual(contentRight + 0.5);
  // The owner's name is what gave way.
  expect(owner.scrollWidth).toBeGreaterThan(owner.clientWidth + 1);
}

it("a deleted assistant's plain words never run under the time at 390px", async () => {
  await phone();
  render(<Row role="Design lead" label="sent by a deleted assistant" />);
  const label = screen.getByTestId("label");
  // The words alone are wider than the 45% cap, and the box grows to hold them.
  const header = screen.getByTestId("header");
  expect(label.getBoundingClientRect().width).toBeGreaterThan(header.clientWidth * 0.45);
  expectNoOverlap();
});

it("the same in Chinese", async () => {
  await phone();
  render(<Row label="由已删除的助手代发" />);
  expectNoOverlap();
});

it("a long assistant name truncates inside the label and leaves the time clear at 390px", async () => {
  await phone();
  render(
    <Row
      role="Design lead"
      label={
        <>
          sent by{" "}
          <MessageItemDelegatedByName data-testid="name">
            Friday Release Coordinator
          </MessageItemDelegatedByName>
        </>
      }
    />,
  );
  expectNoOverlap();
  const name = screen.getByTestId("name");
  expect(name.scrollWidth).toBeGreaterThan(name.clientWidth + 1);
});

it("a role squeezed to nothing leaves no dead gap after the owner's name", async () => {
  await phone();
  render(<Row role="Product & Brand · APAC" label="sent by a deleted assistant" />);
  const owner = screen.getByTestId("owner").getBoundingClientRect();
  const label = screen.getByTestId("label").getBoundingClientRect();
  const gap = parseFloat(getComputedStyle(screen.getByTestId("header")).columnGap);
  expect(label.left - owner.right).toBeLessThanOrEqual(gap + 0.5);
});
