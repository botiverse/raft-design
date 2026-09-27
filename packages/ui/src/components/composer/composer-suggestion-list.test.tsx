/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  ComposerSuggestionContent,
  ComposerSuggestionMeta,
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

// The name must never give way to the description: the title never shrinks and
// never truncates; text metadata starts from zero width and truncates; the row
// wraps rather than overflowing. Geometry is covered by the browser test.
for (const theme of ["brutal", "elegant"] as const) {
  test(`${theme}: title keeps the full name and text meta yields the space`, () => {
    render(
      <ThemeProvider theme={theme}>
        <ComposerSuggestionContent data-testid="content">
          <ComposerSuggestionTitle data-testid="title">Peng</ComposerSuggestionTitle>
          <ComposerSuggestionMeta data-testid="meta">long description</ComposerSuggestionMeta>
          <ComposerSuggestionMeta data-testid="code" variant="code">
            @peng
          </ComposerSuggestionMeta>
        </ComposerSuggestionContent>
      </ThemeProvider>,
    );
    const classes = (id: string) => screen.getByTestId(id).className.split(/\s+/);

    expect(classes("content")).toContain("flex-wrap");
    expect(classes("title")).toEqual(expect.arrayContaining(["shrink-0", "max-w-full"]));
    expect(classes("title")).not.toContain("truncate");
    expect(classes("title")).not.toContain("min-w-0");
    expect(classes("meta")).toEqual(
      expect.arrayContaining(["flex-1", "basis-0", "min-w-16", "truncate"]),
    );
    expect(classes("code")).toContain("shrink-0");
  });
}
