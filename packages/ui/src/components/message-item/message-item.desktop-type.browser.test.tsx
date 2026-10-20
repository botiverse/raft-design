import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "./message-item-root";
import { MessageItemContinuationTime, MessageItemGutter } from "./message-item-gutter";
import { MessageItemBody, MessageItemContent } from "./message-item-content";

// Message text is `text-body`: Feishu's mobile 16/24 on a phone and its PC
// 14/22 from 768px, where the desktop layout begins. The size switches in the
// token layer, so the component itself carries no breakpoint. Measured in a
// real browser, at a phone width and at a desktop width.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

function Row() {
  return (
    <ThemeProvider>
      <MessageItem>
        <MessageItemGutter>
          <MessageItemContinuationTime data-testid="time">10:24</MessageItemContinuationTime>
        </MessageItemGutter>
        <MessageItemContent>
          <MessageItemBody data-testid="body">
            部署完成了，#launch-week 可以开始测试。
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </ThemeProvider>
  );
}

function bodyType() {
  const style = getComputedStyle(screen.getByTestId("body"));
  return { fontSize: style.fontSize, lineHeight: style.lineHeight };
}

/** The continuation time's centre against the centre of the body's first line. */
function timeOffset() {
  const body = screen.getByTestId("body").getBoundingClientRect();
  const time = screen.getByTestId("time").getBoundingClientRect();
  const line = Number.parseFloat(getComputedStyle(screen.getByTestId("body")).lineHeight);
  return time.top + time.height / 2 - (body.top + line / 2);
}

it("on a phone, message text is 16/24", async () => {
  await viewport(390);
  render(<Row />);
  expect(bodyType()).toEqual({ fontSize: "16px", lineHeight: "24px" });
});

it("on a desktop, message text is 14/22", async () => {
  await viewport(1280);
  render(<Row />);
  expect(bodyType()).toEqual({ fontSize: "14px", lineHeight: "22px" });
});

it("the continuation time stays centred on the first line at both sizes", async () => {
  for (const width of [390, 1280]) {
    await viewport(width);
    render(<Row />);
    expect(Math.abs(timeOffset()), `at ${width}px`).toBeLessThanOrEqual(0.5);
    cleanup();
  }
});
