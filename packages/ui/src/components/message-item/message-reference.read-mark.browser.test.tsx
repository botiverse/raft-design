import "./message-reference.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { inkSpan } from "../../chip-ink.test-catalog";
import { MessageItemContent } from "./message-item-content";
import { MessageReferenceReadMark, MessageReferenceText } from "./message-reference";

// The read receipt on a mention (message-item.md, "Read receipts on a
// mention"): a check last inside the mention. It must not change the
// mention's box or the line it sits on, it centres on the letters' cap height
// like every icon in a reference, and its ink ends as far from the mention's
// edge as the first letter starts (design/foundations/alignment.md#chips).
// Lucide draws the check 3/24 inside its box, other icons 1/24, about a
// letter's side bearing; the mark takes the extra 2/24 back. What is left is
// the difference between the `@`'s side bearing and 1/24 of the icon, under
// 0.5px (0.36px at 14px, 0.42px at 15px); without the correction the check
// end sits 0.6-0.7px further out than the `@`.
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
          <MessageReferenceReadMark>Read</MessageReferenceReadMark>
        </MessageReferenceText>{" "}
        to review it.
      </p>
    </MessageItemContent>
  );
}

// The middle of the cap height, from the baseline (a zero-size probe sits on
// it) and the font's `H`.
function capMiddleOf(el: Element) {
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  el.append(probe);
  const baseline = probe.getBoundingClientRect().top;
  probe.remove();
  const cs = getComputedStyle(el);
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} 1000px ${cs.fontFamily}`;
  const cap = (ctx.measureText("H").actualBoundingBoxAscent * parseFloat(cs.fontSize)) / 1000;
  return baseline - cap / 2;
}

// The drawn check's vertical middle, from its stroked path.
function checkMiddleOf(svg: SVGSVGElement) {
  let top = Infinity;
  let bottom = -Infinity;
  for (const shape of svg.querySelectorAll<SVGGraphicsElement>("path, polyline")) {
    const box = shape.getBBox();
    const m = shape.getScreenCTM()!;
    const half = (parseFloat(getComputedStyle(shape).strokeWidth) / 2) * Math.hypot(m.c, m.d);
    top = Math.min(top, m.d * box.y + m.f - half);
    bottom = Math.max(bottom, m.d * (box.y + box.height) + m.f + half);
  }
  return (top + bottom) / 2;
}

for (const [name, width] of [
  ["desktop", 1280],
  ["phone", 390],
] as const) {
  it(`${name}: the check keeps the mention's box and the line, and centres on the letters`, async () => {
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
    const plain = get("plain-mention").getBoundingClientRect();
    const read = get("read-mention").getBoundingClientRect();
    expect(read.height, "the mention's height").toBe(plain.height);
    expect(get("read").getBoundingClientRect().height, "the line's height").toBe(
      get("plain").getBoundingClientRect().height,
    );

    const svg = get("read-mention").querySelector<SVGSVGElement>("svg.lucide-check")!;
    expect(svg.getBoundingClientRect().width, "a 12px check beside 14px text").toBeCloseTo(
      (12 / 14) * parseFloat(getComputedStyle(get("read-mention")).fontSize),
      1,
    );
    expect(
      Math.abs(checkMiddleOf(svg) - capMiddleOf(get("read-mention"))),
      "the check's middle against the letters' cap-height middle",
    ).toBeLessThanOrEqual(0.5);
  });

  it(`${name}: the check's ink ends as far from the mention's edge as the first letter starts`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(width, 900);
    render(
      <ThemeProvider mode="light">
        <div style={{ width: Math.min(width, 420) }}>
          <Sentences />
        </div>
      </ThemeProvider>,
    );
    const mention = document.querySelector('[data-testid="read-mention"]')!;
    const box = mention.getBoundingClientRect();
    const ink = inkSpan(mention);
    const left = ink.left - box.left;
    const right = box.right - ink.right;
    expect(
      Math.abs(left - right),
      `ink ${left.toFixed(2)}px from the left edge, ${right.toFixed(2)}px from the right`,
    ).toBeLessThanOrEqual(0.5);

    // The gap: the check's box starts 2px after the name's last letter box.
    const svg = mention.querySelector("svg.lucide-check")!.getBoundingClientRect();
    const name = document.createRange();
    name.selectNodeContents(mention.firstChild!);
    expect(svg.left - name.getBoundingClientRect().right, "2px from the name").toBeCloseTo(2, 1);
  });
}
