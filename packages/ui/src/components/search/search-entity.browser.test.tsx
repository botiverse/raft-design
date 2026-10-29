import "./search-trigger.test.css";
/**
 * SearchEntityResult is a list cell (search.md, Results; design/patterns/
 * lists.md): no hairline between results, its states on an ::before shape
 * inset 8px from the list's sides, its content 12px inside the shape. Real
 * paint: only a browser computes ::before.
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

function shape(el: HTMLElement) {
  const before = getComputedStyle(el, "::before");
  return {
    borderTop: before.borderTopWidth,
    borderBottom: before.borderBottomWidth,
    left: Number.parseFloat(before.left),
    right: Number.parseFloat(before.right),
  };
}

it("results draw no hairline; the shape is inset 8px and the content 12px inside it", () => {
  render(
    <ThemeProvider>
      <SearchResultsList className="w-96">
        <Result name="design" />
        <Result name="dev" />
      </SearchResultsList>
    </ThemeProvider>,
  );
  for (const name of ["design", "dev"]) {
    const row = screen.getByTestId(name);
    const cell = shape(row);
    expect(cell.borderTop, name).toBe("0px");
    expect(cell.borderBottom, name).toBe("0px");
    expect(cell.left, name).toBe(8);
    expect(cell.right, name).toBe(8);
    expect(getComputedStyle(row).borderTopWidth, name).toBe("0px");
    expect(getComputedStyle(row).borderBottomWidth, name).toBe("0px");
    expect(Number.parseFloat(getComputedStyle(row).paddingLeft), name).toBe(20);
  }
});
