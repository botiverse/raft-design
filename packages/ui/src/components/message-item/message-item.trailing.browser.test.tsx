import "./message-item.avatar-align.test.css";
/**
 * MessageItemTrailing takes no column (stdrc, 2026-11-05): it sits at the
 * inline end of the body's last line, the text wraps under it only when that
 * line is full, and under a last block that isn't text (a code block, a
 * table, an image) it has a line of its own. Measured in a real browser.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/message-item`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "./message-item-root";
import { MessageItemBody, MessageItemContent, MessageItemTrailing } from "./message-item-content";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const FACES = 60;

function Row({
  children,
  trailing = true,
  dir,
}: {
  children: ReactNode;
  trailing?: boolean;
  dir?: "rtl";
}) {
  return (
    <ThemeProvider>
      <div style={{ width: 420 }} dir={dir}>
        <MessageItem>
          <MessageItemContent>
            <MessageItemBody data-testid="body">
              <div style={{ display: "contents" }}>{children}</div>
              {trailing ? (
                <MessageItemTrailing data-testid="trailing">
                  <span style={{ display: "inline-block", width: FACES, height: 19 }} />
                </MessageItemTrailing>
              ) : null}
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </div>
    </ThemeProvider>
  );
}

const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const box = (id: string) => screen.getByTestId(id).getBoundingClientRect();
function textRects(el: Element) {
  const range = document.createRange();
  range.selectNodeContents(el);
  return [...range.getClientRects()].filter((r) => r.width > 0);
}
const overlaps = (a: DOMRect, b: DOMRect) =>
  a.left < b.right - 0.5 &&
  b.left < a.right - 0.5 &&
  a.top < b.bottom - 0.5 &&
  b.top < a.bottom - 0.5;

it("a short last line keeps the slot on it: the body doesn't grow and nothing overlaps", async () => {
  const { unmount } = render(
    <Row trailing={false}>
      <p>A short line.</p>
    </Row>,
  );
  await frames();
  const without = box("body").height;
  unmount();
  render(
    <Row>
      <p data-testid="p">A short line.</p>
    </Row>,
  );
  await frames();
  expect(box("body").height).toBe(without);
  const t = box("trailing");
  expect(Math.round(t.right)).toBe(Math.round(box("body").right));
  expect(Math.round(t.bottom)).toBe(Math.round(box("body").bottom));
  for (const r of textRects(screen.getByTestId("p"))) expect(overlaps(r, t)).toBe(false);
});

it("a full last line wraps under the slot instead of running under it", async () => {
  const text = "word ".repeat(30);
  render(
    <Row>
      <p data-testid="p">{text}</p>
    </Row>,
  );
  await frames();
  const t = box("trailing");
  for (const r of textRects(screen.getByTestId("p"))) expect(overlaps(r, t)).toBe(false);
});

it("under a code block it has a line of its own, at the end", async () => {
  render(
    <Row>
      <p>Before.</p>
      <pre data-testid="pre" style={{ margin: 0 }}>
        {"const x = 1;\n".repeat(3)}
      </pre>
    </Row>,
  );
  await frames();
  const t = box("trailing");
  expect(t.top).toBeGreaterThanOrEqual(box("pre").bottom - 0.5);
  expect(Math.round(t.right)).toBe(Math.round(box("body").right));
});

it("under a table it has a line of its own", async () => {
  render(
    <Row>
      <div data-testid="table">
        <table>
          <tbody>
            <tr>
              <td>a</td>
              <td>b</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Row>,
  );
  await frames();
  expect(box("trailing").top).toBeGreaterThanOrEqual(box("table").bottom - 0.5);
});

it("in right-to-left text it sits at the line's inline end, the left", async () => {
  render(
    <Row dir="rtl">
      <p data-testid="p">سطر قصير.</p>
    </Row>,
  );
  await frames();
  const t = box("trailing");
  expect(Math.round(t.left)).toBe(Math.round(box("body").left));
  for (const r of textRects(screen.getByTestId("p"))) expect(overlaps(r, t)).toBe(false);
});
