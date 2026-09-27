/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  ComposerSuggestionAside,
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

// Every row is one line. Priority: name, then handle, then description. Text
// metadata starts from zero width so it only takes what the name leaves; the
// handle keeps its width up to a third of the row. Geometry: browser test.
for (const theme of ["brutal", "elegant"] as const) {
  test(`${theme}: single-line rows give space to the name, then the handle, then the description`, () => {
    render(
      <ThemeProvider theme={theme}>
        <ComposerSuggestionContent data-testid="content">
          <ComposerSuggestionTitle data-testid="title">Peng</ComposerSuggestionTitle>
          <ComposerSuggestionMeta data-testid="meta">long description</ComposerSuggestionMeta>
          <ComposerSuggestionAside data-testid="aside">
            <ComposerSuggestionMeta data-testid="code" variant="code">
              @peng
            </ComposerSuggestionMeta>
          </ComposerSuggestionAside>
        </ComposerSuggestionContent>
      </ThemeProvider>,
    );
    const classes = (id: string) => screen.getByTestId(id).className.split(/\s+/);

    expect(classes("content")).not.toContain("flex-wrap");
    expect(classes("title")).toEqual(expect.arrayContaining(["min-w-0", "truncate"]));
    expect(classes("meta")).toEqual(
      expect.arrayContaining(["min-w-0", "flex-1", "basis-0", "truncate"]),
    );
    expect(classes("aside")).toEqual(expect.arrayContaining(["max-w-[33%]", "shrink-0"]));
    expect(classes("code")).toEqual(expect.arrayContaining(["min-w-0", "truncate"]));
  });
}
