/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ExternalLink } from "lucide-react";
import { OpenInNewWindowIcon } from "./index";

// OpenInNewWindowIcon is two stacked windows with a ↗ in the front one (icons.md, Action
// icons). It has to stay legible at 16px, where a unit of the 24 grid is 0.67px: the back
// window stops short of the front one, and the arrow keeps clear of the front's outline.

afterEach(cleanup);

const drawn = () => render(<OpenInNewWindowIcon />).container.querySelector("svg")!;

/** The points of a path drawn with straight lines only (M, m, L, l, H, h, V, v). */
function points(d: string) {
  const out: [number, number][] = [];
  let x = 0;
  let y = 0;
  for (const [, cmd, args] of d.matchAll(/([MmLlHhVv])([^MmLlHhVv]*)/g)) {
    const n = args
      .trim()
      .split(/[\s,]+|(?=-)/)
      .filter(Boolean)
      .map(Number);
    const rel = cmd === cmd.toLowerCase();
    switch (cmd.toUpperCase()) {
      case "H":
        for (const v of n) out.push([(x = rel ? x + v : v), y]);
        break;
      case "V":
        for (const v of n) out.push([x, (y = rel ? y + v : v)]);
        break;
      default:
        for (let i = 0; i < n.length; i += 2) {
          x = rel ? x + n[i] : n[i];
          y = rel ? y + n[i + 1] : n[i + 1];
          out.push([x, y]);
        }
    }
  }
  return out;
}

test("is drawn on Lucide's grid: 24 viewBox, lines of 2, round ends and joins", () => {
  const svg = drawn();
  expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
  expect(svg.getAttribute("stroke-width")).toBe("2");
  expect(svg.getAttribute("stroke-linecap")).toBe("round");
  expect(svg.getAttribute("stroke-linejoin")).toBe("round");
  expect(svg.getAttribute("aria-hidden")).toBe("true");
});

test("is not Lucide's external-link, which leaves for the browser", () => {
  const d = (svg: Element) => Array.from(svg.querySelectorAll("path"), (p) => p.getAttribute("d"));
  const ours = d(drawn());
  const lucide = d(render(<ExternalLink />).container.querySelector("svg")!);
  expect(ours.filter((path) => lucide.includes(path))).toEqual([]);
});

test("the back window stops 4 short of the front one, and the arrow keeps at least 1 clear of it", () => {
  const svg = drawn();
  const front = svg.querySelector("rect")!;
  const left = Number(front.getAttribute("x"));
  const top = Number(front.getAttribute("y"));
  const right = left + Number(front.getAttribute("width"));
  const bottom = top + Number(front.getAttribute("height"));

  const [back, titleBar, shaft, head] = Array.from(svg.querySelectorAll("path"), (p) =>
    p.getAttribute("d")!,
  );
  // The back window starts at its title bar and ends at its bottom-right corner, both a
  // stroke's width and a gap of 2 clear of the front window.
  expect(back).toMatch(/^M8 6V4/);
  expect(back).toMatch(/a2 2 0 0 1-2 2$/);
  expect(titleBar).toBe("M8 6h14");
  expect(top - 6).toBe(4);
  expect(20 - right).toBe(4);

  // Each line is 1 wide either side of its path: 1 clear of the front's outline means
  // 1 + 1 + 1 between their paths.
  for (const [x, y] of [...points(shaft), ...points(head)]) {
    expect(x - left).toBeGreaterThanOrEqual(3);
    expect(right - x).toBeGreaterThanOrEqual(3);
    expect(y - top).toBeGreaterThanOrEqual(3);
    expect(bottom - y).toBeGreaterThanOrEqual(3);
  }
});
