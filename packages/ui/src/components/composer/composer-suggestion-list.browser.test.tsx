import "./composer-suggestion-list.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  ComposerSuggestionAside,
  ComposerSuggestionContent,
  ComposerSuggestionIcon,
  ComposerSuggestionMeta,
  ComposerSuggestionTitle,
} from "./composer-suggestion-list";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const LONG_DESCRIPTION =
  "Production-minded software engineer: architecture, debugging, performance and incident response";

const ROWS = [
  { name: "Peng", handle: "peng" },
  { name: "Alexandra Montgomery-Fitzgerald", handle: "alexandra" },
  {
    name: "Maximilian Alexander Konstantin von Hohenzollern-Sigmaringen the Third",
    handle: "maximilian-alexander-konstantin-von-hohenzollern-sigmaringen",
  },
  { name: "Kai", handle: "kai-the-extremely-long-handle-for-release-automation-and-ci-triage" },
];

function renderList(theme: "brutal" | "elegant", width: number) {
  render(
    <ThemeProvider theme={theme}>
      <div style={{ width: `${width}px` }}>
        {ROWS.map((row) => (
          <div key={row.handle} style={{ display: "flex" }} data-testid="row">
            <ComposerSuggestionContent>
              <ComposerSuggestionTitle>{row.name}</ComposerSuggestionTitle>
              <ComposerSuggestionIcon variant="inline">
                <svg role="img" aria-label="Agent" viewBox="0 0 24 24" />
              </ComposerSuggestionIcon>
              <ComposerSuggestionMeta>{LONG_DESCRIPTION}</ComposerSuggestionMeta>
              <ComposerSuggestionAside>
                <ComposerSuggestionMeta variant="code">@{row.handle}</ComposerSuggestionMeta>
              </ComposerSuggestionAside>
            </ComposerSuggestionContent>
          </div>
        ))}
      </div>
    </ThemeProvider>,
  );
}

const slot = (row: Element, name: string) =>
  row.querySelector(`[data-slot="composer-suggestion-${name}"]`) as HTMLElement;

for (const theme of ["brutal", "elegant"] as const) {
  for (const width of [560, 336, 288]) {
    it(`${theme} ${width}px: one line per row, nothing leaves the row, name before handle before description`, () => {
      renderList(theme, width);
      const rows = screen.getAllByTestId("row");
      const heights = new Set(rows.map((row) => Math.round(row.getBoundingClientRect().height)));
      expect(heights.size).toBe(1);

      for (const row of rows) {
        const r = row.getBoundingClientRect();
        const content = slot(row, "content");
        const title = slot(row, "title");
        const aside = slot(row, "aside");
        const kind = slot(row, "icon");
        const description = [
          ...row.querySelectorAll('[data-slot="composer-suggestion-meta"]'),
        ].find((m) => !m.closest('[data-slot="composer-suggestion-aside"]')) as HTMLElement;

        // The human/agent glyph keeps its full size however long the rest is.
        expect(Math.round(kind.getBoundingClientRect().width)).toBe(14);
        for (const part of [title, kind, aside, description]) {
          const p = part.getBoundingClientRect();
          expect(p.left).toBeGreaterThanOrEqual(r.left - 0.5);
          expect(p.right).toBeLessThanOrEqual(r.right + 0.5);
        }
        expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth + 1);
        // The description gives way before the name is truncated.
        if (title.scrollWidth > title.clientWidth + 1) {
          expect(description.getBoundingClientRect().width).toBeLessThanOrEqual(1);
        }
        // The handle never takes more than a third of the row.
        expect(aside.getBoundingClientRect().width).toBeLessThanOrEqual(
          content.getBoundingClientRect().width / 3 + 1,
        );
      }
    });
  }
}
