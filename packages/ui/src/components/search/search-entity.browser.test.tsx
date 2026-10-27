import "./search-trigger.test.css";
/**
 * SearchEntityResult draws the ListRow hairline above itself, from where the
 * text starts, when it follows another result in the list (search.md,
 * Results). A wrapper around each result makes every one the first of its
 * parent, and the hairlines are gone: the reason to put a result's data
 * attributes on SearchEntityResult itself. Real paint: only a browser
 * computes ::before.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/search/search-entity.browser.test.tsx`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { SearchResultsList } from "./search";
import {
  SearchEntityResult,
  SearchEntityResultContent,
  SearchEntityResultIcon,
  SearchEntityResultLeading,
  SearchEntityResultTitle,
} from "./search-entity";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function Result({ name }: { name: string }) {
  return (
    <SearchEntityResult data-testid={name}>
      <SearchEntityResultLeading>
        <SearchEntityResultIcon>#</SearchEntityResultIcon>
      </SearchEntityResultLeading>
      <SearchEntityResultContent>
        <SearchEntityResultTitle data-testid={`${name}-title`}>{name}</SearchEntityResultTitle>
      </SearchEntityResultContent>
    </SearchEntityResult>
  );
}

function hairline(el: HTMLElement) {
  const before = getComputedStyle(el, "::before");
  return { width: before.borderTopWidth, style: before.borderTopStyle, left: before.left };
}

it("a result after another draws the hairline from where the text starts; the first draws none", () => {
  render(
    <ThemeProvider>
      <SearchResultsList className="w-96">
        <Result name="design" />
        <Result name="dev" />
      </SearchResultsList>
    </ThemeProvider>,
  );
  expect(hairline(screen.getByTestId("design")).width).toBe("0px");
  const line = hairline(screen.getByTestId("dev"));
  expect(line.width).toBe("1px");
  expect(line.style).toBe("solid");
  const row = screen.getByTestId("dev").getBoundingClientRect();
  const title = screen.getByTestId("dev-title").getBoundingClientRect();
  expect(row.left + Number.parseFloat(line.left)).toBeCloseTo(title.left, 0);
});

it("a wrapper around each result hides the hairlines", () => {
  render(
    <ThemeProvider>
      <SearchResultsList className="w-96">
        <div>
          <Result name="design" />
        </div>
        <div>
          <Result name="dev" />
        </div>
      </SearchResultsList>
    </ThemeProvider>,
  );
  expect(hairline(screen.getByTestId("dev")).width).toBe("0px");
});
