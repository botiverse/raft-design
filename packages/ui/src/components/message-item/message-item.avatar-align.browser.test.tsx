import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "./message-item-root";
import { MessageItemAvatarSlot, MessageItemGutter } from "./message-item-gutter";
import { MessageItemContent } from "./message-item-content";
import { MessageItemHeader, MessageItemSender } from "./message-item-header";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function Row() {
  return (
    <ThemeProvider>
      <div style={{ width: "560px" }}>
        <MessageItem data-testid="row">
          <MessageItemGutter>
            <MessageItemAvatarSlot data-testid="slot">
              <div data-testid="avatar" style={{ width: 36, height: 36, background: "#eee" }} />
            </MessageItemAvatarSlot>
          </MessageItemGutter>
          <MessageItemContent>
            <MessageItemHeader data-testid="header">
              <MessageItemSender data-testid="sender">Developer</MessageItemSender>
            </MessageItemHeader>
            <div style={{ fontSize: "14px", lineHeight: "20px" }}>
              This message belongs only to the isolated workspace.
            </div>
          </MessageItemContent>
        </MessageItem>
      </div>
    </ThemeProvider>
  );
}

function measure(tag: string) {
  const av = screen.getByTestId("avatar").getBoundingClientRect();
  const slot = screen.getByTestId("slot").getBoundingClientRect();
  const sender = screen.getByTestId("sender").getBoundingClientRect();
  const header = screen.getByTestId("header").getBoundingClientRect();
  const out = {
    tag,
    avatarTop: +av.top.toFixed(1),
    slotTop: +slot.top.toFixed(1),
    senderTop: +sender.top.toFixed(1),
    headerTop: +header.top.toFixed(1),
    avatarMinusSender: +(av.top - sender.top).toFixed(1),
    slotMinusHeader: +(slot.top - header.top).toFixed(1),
  };
  return out;
}

it("message row avatar vs sender alignment", () => {
  render(<Row />);
  const m = measure("row");
  // Artea #proj-frontend:d5776c23: the avatar's top edge sits on the sender
  // name's top edge (not merely near it) — the row reads as one block.
  expect(Math.abs(m.avatarMinusSender)).toBeLessThanOrEqual(1);
});
