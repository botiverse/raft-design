import "./icons.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { UnfollowArtifactIcon } from "./action-icons";

// At 16px Unfollow Artifact's minus is drawn heavier, so it reads as a mark and
// not as one more line of the page's text; at 20 and 24 it keeps the plain
// minus (design: icons.md#action-icons). Measured in a real browser: the swap
// is a container query on the svg.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function marks(size: number) {
  const { container } = render(<UnfollowArtifactIcon width={size} height={size} />);
  const svg = container.querySelector("svg")!;
  const shown = (mark: string) =>
    getComputedStyle(svg.querySelector(`[data-icon-mark="${mark}"]`)!).display !== "none";
  return {
    small: shown("small"),
    plain: shown("default"),
    width: svg.getBoundingClientRect().width,
  };
}

it("draws the heavier minus at 16px", () => {
  expect(marks(16)).toEqual({ small: true, plain: false, width: 16 });
});

it("keeps the plain minus at 20px and 24px", () => {
  expect(marks(20)).toEqual({ small: false, plain: true, width: 20 });
  cleanup();
  expect(marks(24)).toEqual({ small: false, plain: true, width: 24 });
});

it("sized by a class, as in a menu, it still swaps at 16px", () => {
  const { container } = render(<UnfollowArtifactIcon className="size-4" />);
  const svg = container.querySelector("svg")!;
  expect(svg.getBoundingClientRect().width).toBe(16);
  expect(getComputedStyle(svg.querySelector('[data-icon-mark="small"]')!).display).not.toBe("none");
});
