/**
 * @vitest-environment jsdom
 */
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

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

function renderRow() {
  return render(
    <ThemeProvider theme="elegant">
      <ComposerSuggestionOption data-testid="option">
        <ComposerSuggestionContent>
          <ComposerSuggestionTitle data-testid="title">Vivianna</ComposerSuggestionTitle>
          <ComposerSuggestionMeta data-testid="description">Analyst</ComposerSuggestionMeta>
          <ComposerSuggestionAside data-testid="aside">
            <ComposerSuggestionMeta variant="code">@vivianna</ComposerSuggestionMeta>
          </ComposerSuggestionAside>
        </ComposerSuggestionContent>
      </ComposerSuggestionOption>
    </ThemeProvider>,
  );
}

test("title never truncates: full names keep space priority over the description", () => {
  renderRow();
  const titleClass = screen.getByTestId("title").className;
  expect(titleClass).toContain("shrink-0");
  expect(titleClass).not.toContain("truncate");
});

test("content does not reintroduce a min-w-0 squeeze on the title slot", () => {
  renderRow();
  const contentClass = screen
    .getByTestId("option")
    .querySelector("[data-slot=composer-suggestion-content]")?.className;
  expect(contentClass).toBeDefined();
  expect(contentClass).not.toContain("composer-suggestion-title");
});

test("text meta keeps truncating so the description absorbs the squeeze", () => {
  renderRow();
  const descriptionClass = screen.getByTestId("description").className;
  expect(descriptionClass).toContain("truncate");
});
