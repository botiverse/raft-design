import "./styles.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { UnfollowArtifactIcon } from "./action-icons";

// At 16px Unfollow Artifact's minus is drawn heavier, so it reads as a mark and
// not as one more piece of the page's outline; at 20 and 24 it keeps the plain
// minus (design: icons.md#action-icons). Measured in a real browser: the swap
// is a container query on the svg, in ricons' own styles.css. This file loads
// that stylesheet alone, neither raft-ui's nor Tailwind; the last test turns
// it off and the icon keeps the plain minus at every size.

const it = test.skipIf(typeof window === "undefined");

/** The stylesheet styles.css became: the one holding the [data-icon-sizes] rule. */
function riconsSheet() {
  const sheet = Array.from(document.styleSheets).find((candidate) =>
    Array.from(candidate.cssRules).some((rule) => rule.cssText.includes("[data-icon-sizes]")),
  );
  expect(sheet).toBeDefined();
  return sheet!;
}

afterEach(() => {
  cleanup();
  riconsSheet().disabled = false;
});

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

const MENU_ICON_CSS = ".menu-icon{width:1rem;height:1rem}";

it("sized by a class, as in a menu, it still swaps at 16px", () => {
  const { container } = render(
    <>
      <style>{MENU_ICON_CSS}</style>
      <UnfollowArtifactIcon className="menu-icon" />
    </>,
  );
  const svg = container.querySelector("svg")!;
  expect(svg.getBoundingClientRect().width).toBe(16);
  expect(getComputedStyle(svg.querySelector('[data-icon-mark="small"]')!).display).not.toBe("none");
});

it("the swap comes from styles.css: without it, the plain minus at 16px too", () => {
  riconsSheet().disabled = true;
  expect(marks(16)).toEqual({ small: false, plain: true, width: 16 });
});
