import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  ComposerSuggestionAside,
  ComposerSuggestionContent,
  ComposerSuggestionMeta,
  ComposerSuggestionOption,
  ComposerSuggestionTitle,
} from "./composer-suggestion-list";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const LONG_NAME = "Vivianna Constantine-Ashford";
const LONG_DESCRIPTION =
  "Decision analyst and implementation partner for Cindy — turns growth, activation, segmentation, and lifecycle strategy into shipped execution";

function renderRow(width: number) {
  return render(
    <ThemeProvider theme="elegant">
      <div style={{ width }}>
        <ComposerSuggestionOption data-testid="option">
          <ComposerSuggestionContent>
            <ComposerSuggestionTitle data-testid="title">{LONG_NAME}</ComposerSuggestionTitle>
            <ComposerSuggestionMeta data-testid="description" className="min-w-0 truncate">
              {LONG_DESCRIPTION}
            </ComposerSuggestionMeta>
            <ComposerSuggestionAside>
              <ComposerSuggestionMeta variant="code">@vivianna</ComposerSuggestionMeta>
            </ComposerSuggestionAside>
          </ComposerSuggestionContent>
        </ComposerSuggestionOption>
      </div>
    </ThemeProvider>,
  );
}

it("title shows the full name while the description absorbs the truncation", () => {
  renderRow(360);

  const title = screen.getByTestId("title");
  const description = screen.getByTestId("description");

  expect(title.textContent).toBe(LONG_NAME);
  expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth + 1);
  expect(description.scrollWidth).toBeGreaterThan(description.clientWidth);
});

it("title still shows the full name in a narrow container by wrapping", () => {
  renderRow(220);

  const title = screen.getByTestId("title");

  expect(title.textContent).toBe(LONG_NAME);
  expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth + 1);
  expect(title.getBoundingClientRect().height).toBeGreaterThan(0);
});
