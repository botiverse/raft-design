import "./message-item.avatar-align.test.css";
/**
 * MessageItemTrailing takes no column (stdrc, 2026-11-05): it sits at the
 * inline end of the body's last line, the text wraps under it only when that
 * line is full, and under a last block that isn't text (a code block, a table)
 * it has a line of its own. Blocks go straight in the body, as the docs
 * compose them, and once through a wrapper that only holds blocks (an app's
 * markdown root). Measured in a real browser (Kirby's review cases).
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/message-item`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { CodeBlock, CodeBlockBody, CodeBlockPre } from "../code-block/code-block";
import {
  MarkdownBlockquote,
  MarkdownHeading,
  MarkdownList,
  MarkdownListItem,
  MarkdownParagraph,
  MarkdownTable,
  MarkdownTableScroll,
  MarkdownTableRow,
  MarkdownCell,
} from "../markdown/markdown-parts";
import { MessageItem } from "./message-item-root";
import { MessageItemBody, MessageItemContent, MessageItemTrailing } from "./message-item-content";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const FACES = 60;
/** An inline style that beats any stylesheet margin: the reserved line must not depend on the block's margin. */
const NO_MARGIN = { margin: 0 };

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
              {children}
              {trailing ? (
                <MessageItemTrailing data-testid="trailing">
                  <span
                    data-testid="faces"
                    style={{ display: "inline-block", width: FACES, height: 19 }}
                  >
                    faces
                  </span>
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
function lineRects(el: Element) {
  const range = document.createRange();
  range.selectNodeContents(el);
  return [...range.getClientRects()].filter((r) => r.width > 0);
}
const overlaps = (a: DOMRect, b: DOMRect) =>
  a.left < b.right - 0.5 &&
  b.left < a.right - 0.5 &&
  a.top < b.bottom - 0.5 &&
  b.top < a.bottom - 0.5;

/** The slot on the text's last line: centred on it within a pixel, no overlap, and the body no taller than without it. */
async function onLastLine(content: () => ReactNode, textId: string) {
  const { unmount } = render(<Row trailing={false}>{content()}</Row>);
  await frames();
  const without = box("body").height;
  unmount();
  render(<Row>{content()}</Row>);
  await frames();
  const lines = lineRects(screen.getByTestId(textId));
  const last = lines[lines.length - 1]!;
  const t = box("trailing");
  expect(Math.abs((t.top + t.bottom) / 2 - (last.top + last.bottom) / 2)).toBeLessThanOrEqual(1);
  for (const r of lines) expect(overlaps(r, box("faces"))).toBe(false);
  expect(box("body").height).toBe(without);
}

it("a short paragraph keeps the slot on its line, with no growth", async () => {
  await onLastLine(
    () => <MarkdownParagraph data-testid="text">A short line.</MarkdownParagraph>,
    "text",
  );
});

it("a list as the first and last block: on its last item's line, no blank line, no growth", async () => {
  await onLastLine(
    () => (
      <MarkdownList>
        <MarkdownListItem>one</MarkdownListItem>
        <MarkdownListItem data-testid="text">two</MarkdownListItem>
      </MarkdownList>
    ),
    "text",
  );
});

it("a quote and a heading at the end keep it on their last line", async () => {
  await onLastLine(
    () => (
      <>
        <MarkdownParagraph>Before.</MarkdownParagraph>
        <MarkdownBlockquote>
          <MarkdownParagraph data-testid="text">Quoted last.</MarkdownParagraph>
        </MarkdownBlockquote>
      </>
    ),
    "text",
  );
  cleanup();
  await onLastLine(
    () => (
      <MarkdownHeading level={2} data-testid="text">
        A heading
      </MarkdownHeading>
    ),
    "text",
  );
});

it("through a wrapper that only holds blocks (an app's markdown root)", async () => {
  await onLastLine(
    () => (
      <div style={{ display: "contents" }}>
        <MarkdownParagraph>First.</MarkdownParagraph>
        <MarkdownParagraph data-testid="text">Last.</MarkdownParagraph>
      </div>
    ),
    "text",
  );
});

it("a full last line wraps under the slot instead of running under it", async () => {
  render(
    <Row>
      <MarkdownParagraph data-testid="text">{"word ".repeat(30)}</MarkdownParagraph>
    </Row>,
  );
  await frames();
  for (const r of lineRects(screen.getByTestId("text")))
    expect(overlaps(r, box("faces"))).toBe(false);
});

it("under a code block, even one whose own margin is zero, it has a line of its own at the end", async () => {
  render(
    <Row>
      <MarkdownParagraph>Before.</MarkdownParagraph>
      <CodeBlock data-testid="code" style={NO_MARGIN}>
        <CodeBlockBody>
          <CodeBlockPre>{"const x = 1;\n".repeat(3)}</CodeBlockPre>
        </CodeBlockBody>
      </CodeBlock>
    </Row>,
  );
  await frames();
  const t = box("trailing");
  expect(t.top).toBeGreaterThanOrEqual(box("code").bottom - 0.5);
  expect(Math.round(t.right)).toBe(Math.round(box("body").right));
});

it("under a table it has a line of its own", async () => {
  render(
    <Row>
      <MarkdownTableScroll data-testid="table">
        <MarkdownTable>
          <tbody>
            <MarkdownTableRow>
              <MarkdownCell>a</MarkdownCell>
              <MarkdownCell>b</MarkdownCell>
            </MarkdownTableRow>
          </tbody>
        </MarkdownTable>
      </MarkdownTableScroll>
    </Row>,
  );
  await frames();
  expect(box("trailing").top).toBeGreaterThanOrEqual(box("table").bottom - 0.5);
});

it("is never selected or copied with the message's text", async () => {
  render(
    <Row>
      <MarkdownParagraph>a</MarkdownParagraph>
    </Row>,
  );
  await frames();
  expect(getComputedStyle(screen.getByTestId("trailing")).userSelect).toBe("none");
  expect(getComputedStyle(screen.getByTestId("faces")).userSelect).toBe("none");
  const selection = window.getSelection()!;
  selection.selectAllChildren(screen.getByTestId("body"));
  expect(selection.toString()).not.toContain("faces");
  selection.removeAllRanges();
});

it("in right-to-left text it sits at the line's inline end, the left", async () => {
  render(
    <Row dir="rtl">
      <MarkdownParagraph data-testid="text">سطر قصير.</MarkdownParagraph>
    </Row>,
  );
  await frames();
  const t = box("trailing");
  expect(Math.round(t.left)).toBe(Math.round(box("body").left));
  for (const r of lineRects(screen.getByTestId("text"))) expect(overlaps(r, t)).toBe(false);
});

// Writing the room in the observer's callback resized the observed body there
// and then, which the browser reports on window as "ResizeObserver loop
// completed with undelivered notifications" (Kirby: 8 for 30-69-word
// paragraphs with a 60px slot). The writes wait for the next frame.
it("no ResizeObserver loop error, for paragraphs of 30 to 69 words", async () => {
  const errors: string[] = [];
  const onError = (event: ErrorEvent) => {
    if (/ResizeObserver loop/.test(event.message)) errors.push(event.message);
  };
  window.addEventListener("error", onError);
  try {
    for (let words = 30; words < 70; words += 3) {
      render(
        <Row>
          <MarkdownParagraph style={NO_MARGIN}>{Array.from({ length: words }, (_, i) => `word${i}`).join(" ")}</MarkdownParagraph>
        </Row>,
      );
      await frames();
      await frames();
      cleanup();
    }
  } finally {
    window.removeEventListener("error", onError);
  }
  expect(errors).toEqual([]);
});
