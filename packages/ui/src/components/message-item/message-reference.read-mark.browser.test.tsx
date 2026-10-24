import "./message-reference.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItemContent } from "./message-item-content";
import { MessageReferenceReadMark, MessageReferenceText } from "./message-reference";

// The read receipt on a mention (message-item.md, "Read receipts on a
// mention"): a bare lime check, 10px, no light and no box, at the mention's
// top right. Its box starts 2px after the name's text, so it never covers the
// last letter, the mention reserves 10px after its text before the word space,
// and the line keeps its height. Light mode draws it in palette-lime-700, dark
// mode in the online lime.
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

// The colour a custom property resolves to inside `scope`.
function colourOf(scope: Element, property: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${property})`;
  scope.appendChild(probe);
  const colour = getComputedStyle(probe).color;
  probe.remove();
  return colour;
}

for (const [name, width, mode, expected] of [
  ["desktop, light", 1280, "light", "--palette-lime-700"],
  ["phone, light", 390, "light", "--palette-lime-700"],
  ["desktop, dark", 1280, "dark", "--presence-online"],
] as const) {
  it(`${name}: the read check sits at the mention's top right, clear of the name, and keeps the line`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(width, 900);
    render(
      <ThemeProvider mode={mode}>
        <div data-testid="scope" className={mode} style={{ width: Math.min(width, 420) }}>
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

    expect(get("mark").querySelector("[data-slot=status]") === null, "no status light").toBe(true);
    expect(mark.width, "a 10px check").toBe(10);
    expect(mark.height, "a 10px check").toBe(10);

    expect(mark.top, "its top on the mention's top").toBeCloseTo(box.top, 1);
    const text = document.createRange();
    text.selectNodeContents(mention.firstChild!);
    const textRight = text.getBoundingClientRect().right;
    expect(mark.left - textRight, "2px after the name's text").toBeCloseTo(2, 1);
    // The mention reserves 10px, as for the indicator: the check's box ends 2px
    // into the word space, where the glyph has only its own empty padding.
    const after = document.createRange();
    after.selectNodeContents(get("after").firstChild!);
    expect(
      after.getBoundingClientRect().left,
      "the word space starts 10px after the name",
    ).toBeCloseTo(mark.right - 2, 1);

    const svg = get("mark").querySelector<SVGSVGElement>("svg.lucide-check")!;
    const svgBox = svg.getBoundingClientRect();
    expect([svgBox.width, svgBox.height], "the check fills the 10px box").toEqual([10, 10]);
    expect(svg.getAttribute("stroke-width"), "stroke 2.5").toBe("2.5");
    expect(getComputedStyle(svg).color, `the check in ${expected}`).toBe(
      colourOf(get("scope"), expected),
    );
    const ink = checkInkOf(svg);
    expect(ink.left, "the check's ink inside its box").toBeGreaterThanOrEqual(mark.left);
    expect(ink.right, "the check's ink inside its box").toBeLessThanOrEqual(mark.right);
    expect(ink.top, "the check's ink inside its box").toBeGreaterThanOrEqual(mark.top);
    expect(ink.bottom, "the check's ink inside its box").toBeLessThanOrEqual(mark.bottom);
  });
}
