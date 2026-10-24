import "./search-trigger.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { SearchMessageResultBody, SearchMessageResultMatch } from "./search-message";

// The search hit (search.md › Content, stdrc 2026-10-24): a `you` fill behind
// the words, no edge, the text's own weight, and a fill that covers the
// descenders. An edge made it read as one more badge and cut the "y".

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

it("a hit is a fill with no edge, in the text's own weight, covering the descenders", () => {
  render(
    <ThemeProvider syncDom={false}>
      <SearchMessageResultBody data-testid="body">
        Short one: <SearchMessageResultMatch data-testid="hit">remy</SearchMessageResultMatch> said
        the spacing looks off.
      </SearchMessageResultBody>
    </ThemeProvider>,
  );
  const hit = screen.getByTestId("hit");
  const body = screen.getByTestId("body");
  const style = getComputedStyle(hit);

  expect(style.boxShadow, "no ring or inset ring").toBe("none");
  expect(style.fontWeight, "the text's own weight").toBe(getComputedStyle(body).fontWeight);
  expect(style.backgroundColor, "a fill").not.toBe("rgba(0, 0, 0, 0)");

  // 1px of fill above and below the glyphs' box, so a "y" sits inside it.
  expect(parseFloat(style.paddingTop), "fill above the ascenders").toBeGreaterThanOrEqual(1);
  expect(parseFloat(style.paddingBottom), "fill below the descenders").toBeGreaterThanOrEqual(1);
});
