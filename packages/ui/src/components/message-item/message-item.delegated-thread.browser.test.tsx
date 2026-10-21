import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarFallback } from "../avatar";
import { MessageItem } from "./message-item-root";
import { MessageItemAvatarSlot } from "./message-item-gutter";
import { MessageItemBody, MessageItemContent } from "./message-item-content";
import {
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemSenderGroup,
  MessageItemTime,
} from "./message-item-header";
import { MessageItemDelegatedBy, MessageItemDelegatedByName } from "./message-item-delegated";

// In a thread panel (360px at its narrowest, 400px by default) with a mouse,
// the name line also leaves room for the hover toolbar (--mi-toolbar-reserve).
// There the owner's name keeps at least 3rem, or all of it when shorter; when
// the label's plain words don't fit beside it they wrap onto a second line;
// the time stays whole, on the first line, clear of the toolbar's room.
// Measured in a real browser (pointer: fine, the default).

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function Row({
  width,
  owner,
  role,
  label,
}: {
  width: number;
  owner: string;
  role?: string;
  label: ReactNode;
}) {
  return (
    <ThemeProvider>
      <div style={{ width }}>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="human">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader data-testid="header">
              <MessageItemSenderGroup>
                <MessageItemSender data-testid="owner">{owner}</MessageItemSender>
                {role ? <MessageItemMeta>{role}</MessageItemMeta> : null}
              </MessageItemSenderGroup>
              <MessageItemDelegatedBy data-testid="label">{label}</MessageItemDelegatedBy>
              <MessageItemTime data-testid="time">10:42</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>Moved the design review to Thursday at 4.</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </div>
    </ThemeProvider>
  );
}

function measure() {
  const header = screen.getByTestId("header");
  const style = getComputedStyle(header);
  const contentRight = header.getBoundingClientRect().right - parseFloat(style.paddingRight);
  const owner = screen.getByTestId("owner");
  const label = screen.getByTestId("label");
  const time = screen.getByTestId("time");
  return {
    reserve: parseFloat(style.paddingRight),
    contentRight,
    owner,
    ownerRect: owner.getBoundingClientRect(),
    label,
    labelRect: label.getBoundingClientRect(),
    time,
    timeRect: time.getBoundingClientRect(),
  };
}

function expectReadable(owner: string) {
  const m = measure();
  // The toolbar's room is there (a mouse), and nothing enters it.
  expect(m.reserve).toBeGreaterThan(0);
  expect(m.timeRect.right).toBeLessThanOrEqual(m.contentRight + 0.5);
  expect(m.labelRect.right).toBeLessThanOrEqual(m.contentRight + 0.5);
  // The time is whole and on the owner's line.
  expect(m.time.scrollWidth).toBeLessThanOrEqual(m.time.clientWidth + 1);
  expect(Math.abs(m.timeRect.bottom - m.ownerRect.bottom)).toBeLessThan(4);
  // Owner, label, time in order, none over the next.
  expect(m.ownerRect.right).toBeLessThanOrEqual(m.labelRect.left + 0.5);
  expect(m.labelRect.right).toBeLessThanOrEqual(m.timeRect.left + 0.5);
  // The owner keeps at least 3rem of its name (or all of it).
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const probe = document.createElement("span");
  probe.className = m.owner.className;
  probe.style.cssText = "position:absolute;visibility:hidden;max-width:none;overflow:visible";
  probe.textContent = owner;
  document.body.append(probe);
  const natural = probe.getBoundingClientRect().width;
  probe.remove();
  expect(m.ownerRect.width).toBeGreaterThanOrEqual(Math.min(natural, 3 * rem) - 0.5);
  // The label's words are inside its box; none is cut.
  for (const node of m.label.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      expect(r.left).toBeGreaterThanOrEqual(m.labelRect.left - 0.5);
      expect(r.right).toBeLessThanOrEqual(m.labelRect.right + 0.5);
    }
  }
  return m;
}

// A thread panel's message column: the panel, less the row's 8px padding on
// each side, the 35px avatar and the 12px gap after it.
for (const panel of [360, 400]) {
  for (const [title, words] of [
    ["English", "sent by a deleted assistant"],
    ["Chinese", "由已删除的助理代发"],
  ] as const) {
    it(`${panel}px thread: a deleted assistant (${title}) never hides the owner or the time`, () => {
      render(
        <Row width={panel} owner="Alexandra Konstantinopoulou" role="Design lead" label={words} />,
      );
      const m = expectReadable("Alexandra Konstantinopoulou");
      expect(m.ownerRect.width).toBeGreaterThan(20);
    });
  }

  it(`${panel}px thread: a short owner name is whole, with no gap after it`, () => {
    render(<Row width={panel} owner="Al" label="sent by a deleted assistant" />);
    const m = expectReadable("Al");
    expect(m.owner.scrollWidth).toBeLessThanOrEqual(m.owner.clientWidth + 1);
    const gap = parseFloat(getComputedStyle(screen.getByTestId("header")).columnGap);
    expect(m.labelRect.left - m.ownerRect.right).toBeLessThanOrEqual(gap + 0.5);
  });

  it(`${panel}px thread: a named assistant truncates its name, not its words`, () => {
    render(
      <Row
        width={panel}
        owner="Alexandra Konstantinopoulou"
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
    const m = expectReadable("Alexandra Konstantinopoulou");
    // One line: with a name the words never wrap.
    expect(m.labelRect.height).toBeLessThan(m.ownerRect.height + 1);
  });
}
