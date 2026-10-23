import "./message-reference.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItemContent } from "./message-item-content";
import { MessageReferenceReadMark, MessageReferenceText } from "./message-reference";

// The read receipt on a mention (message-item.md, "Read receipts on a
// mention"): the online light, 8px, with an ink check centred in it, at the
// mention's top right. Its box starts 2px after the name's text, so it never
// covers the last letter (at -6px it did), the mention reserves 10px after its
// text before the word space, and the line keeps its height.
// Real layout only: jsdom has no boxes.

const it = test.skipIf(typeof window === "undefined");

beforeAll(async () => {
  if (typeof window === "undefined") return;
  // `load` resolves to the faces it loaded: none means the test CSS lost them.
  const loaded = await Promise.all(
    ['400 16px "Space Grotesk"', '700 16px "Space Grotesk"'].map((font) =>
      document.fonts.load(font),
    ),
  );
  for (const faces of loaded) expect(faces.length).toBeGreaterThan(0);
});

afterEach(cleanup);

function Sentences() {
  return (
    <MessageItemContent>
      <p data-testid="plain">
        Ask <MessageReferenceText data-testid="plain-mention">@Atlas</MessageReferenceText> to
        review it.
      </p>
      <p data-testid="read">
        Ask{" "}
        <MessageReferenceText data-testid="read-mention">
          @Atlas
          <MessageReferenceReadMark data-testid="mark">Read</MessageReferenceReadMark>
        </MessageReferenceText>
        <span data-testid="after"> to</span> review it.
      </p>
    </MessageItemContent>
  );
}

// The drawn check's box, from its stroked paths.
function checkInkOf(svg: SVGSVGElement) {
  let top = Infinity;
  let bottom = -Infinity;
  let left = Infinity;
  let right = -Infinity;
  for (const shape of svg.querySelectorAll<SVGGraphicsElement>("path, polyline")) {
    const box = shape.getBBox();
    const m = shape.getScreenCTM()!;
    const half = (parseFloat(getComputedStyle(shape).strokeWidth) / 2) * Math.hypot(m.c, m.d);
    top = Math.min(top, m.d * box.y + m.f - half);
    bottom = Math.max(bottom, m.d * (box.y + box.height) + m.f + half);
    left = Math.min(left, m.a * box.x + m.e - half);
    right = Math.max(right, m.a * (box.x + box.width) + m.e + half);
  }
  return { top, bottom, left, right };
}

for (const [name, width] of [
  ["desktop", 1280],
  ["phone", 390],
] as const) {
  it(`${name}: the read light sits at the mention's top right, clear of the name, and keeps the line`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(width, 900);
    render(
      <ThemeProvider mode="light">
        <div style={{ width: Math.min(width, 420) }}>
          <Sentences />
        </div>
      </ThemeProvider>,
    );
    const get = (id: string) => document.querySelector(`[data-testid="${id}"]`)!;
    const mention = get("read-mention");
    const box = mention.getBoundingClientRect();
    const mark = get("mark").getBoundingClientRect();

    expect(get("read").getBoundingClientRect().height, "the line's height").toBe(
      get("plain").getBoundingClientRect().height,
    );

    expect(mark.width, "an 8px light").toBe(8);
    expect(mark.height, "an 8px light").toBe(8);
    const light = get("mark").querySelector("[data-slot=status]")!.getBoundingClientRect();
    expect([light.width, light.height], "the online light fills the slot").toEqual([8, 8]);

    expect(mark.top, "its top on the mention's top").toBeCloseTo(box.top, 1);
    const text = document.createRange();
    text.selectNodeContents(mention.firstChild!);
    const textRight = text.getBoundingClientRect().right;
    expect(mark.left - textRight, "at least 2px after the name's text").toBeGreaterThanOrEqual(
      2 - 0.01,
    );
    // The mention reserves the light's 10px, so the word space comes after it.
    const after = document.createRange();
    after.selectNodeContents(get("after").firstChild!);
    expect(after.getBoundingClientRect().left, "the next word starts after the light").toBeCloseTo(
      mark.right,
      1,
    );

    const svg = get("mark").querySelector<SVGSVGElement>("svg.lucide-check")!;
    const svgBox = svg.getBoundingClientRect();
    expect(svgBox.width, "a 6.5px check").toBeCloseTo(6.5, 1);
    expect(getComputedStyle(svg).color, "the check in the light's ink edge colour").toBe(
      getComputedStyle(get("mark").querySelector("[data-slot=status]")!).borderTopColor,
    );
    const ink = checkInkOf(svg);
    expect(
      Math.abs((svgBox.left + svgBox.right) / 2 - (mark.left + mark.right) / 2),
      "the check's box centred across",
    ).toBeLessThanOrEqual(0.01);
    expect(
      Math.abs((svgBox.top + svgBox.bottom) / 2 - (mark.top + mark.bottom) / 2),
      "the check's box centred down",
    ).toBeLessThanOrEqual(0.01);
    expect(ink.left, "the check's ink inside the light").toBeGreaterThanOrEqual(mark.left);
    expect(ink.right, "the check's ink inside the light").toBeLessThanOrEqual(mark.right);
  });
}
