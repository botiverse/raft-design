import "./text-link.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { TextLink, TextLinkExternalIcon } from "./text-link";

// The ↗ after a link that leaves Raft (text-link.md, "Leaving Raft"): at every
// text size it centres on the letters' cap height, like every mark in a line
// of text (design/foundations/alignment.md#a-mark-that-leads-text), and it
// starts 2px after the text. Real layout only: jsdom has no boxes.

const it = test.skipIf(typeof window === "undefined");

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const faces = await document.fonts.load('500 16px "Space Grotesk"');
  expect(faces.length).toBeGreaterThan(0);
});

afterEach(cleanup);

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

for (const size of ["text-footnote", "text-callout", "text-body"]) {
  it(`${size}: the arrow centres on the cap height and starts 2px after the text`, () => {
    const { getByTestId } = render(
      <p className={`m-0 ${size}`}>
        See{" "}
        <TextLink data-testid="link" render={<a href="https://raft.build/pricing" />}>
          <span data-testid="text">Pricing</span>
          <TextLinkExternalIcon />
        </TextLink>
      </p>,
    );
    const link = getByTestId("link");
    const svg = link.querySelector("svg")!.getBoundingClientRect();
    const text = getByTestId("text").getBoundingClientRect();
    expect(Math.abs(svg.top + svg.height / 2 - capMiddleOf(link))).toBeLessThanOrEqual(0.5);
    expect(svg.left - text.right).toBeCloseTo(2, 0);
    expect(svg.height).toBeCloseTo(parseFloat(getComputedStyle(link).fontSize) * 0.857, 0);
  });
}
