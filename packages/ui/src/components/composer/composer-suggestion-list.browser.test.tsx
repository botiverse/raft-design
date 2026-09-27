import "./composer-suggestion-list.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Badge } from "../badge/badge";
import {
  ComposerSuggestionAside,
  ComposerSuggestionContent,
  ComposerSuggestionMeta,
  ComposerSuggestionTitle,
} from "./composer-suggestion-list";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const LONG_DESCRIPTION =
  "Production-minded software engineer: architecture, debugging, performance and incident response";

function renderRow(theme: "brutal" | "elegant", width: number, name: string) {
  render(
    <ThemeProvider theme={theme}>
      <div style={{ width: `${width}px`, display: "flex" }}>
        <ComposerSuggestionContent data-testid="content">
          <ComposerSuggestionTitle data-testid="title">{name}</ComposerSuggestionTitle>
          <Badge appearance="soft" variant="muted" className="shrink-0" data-testid="badge">
            Agent
          </Badge>
          <ComposerSuggestionMeta data-testid="meta">{LONG_DESCRIPTION}</ComposerSuggestionMeta>
          <ComposerSuggestionAside data-testid="aside">
            <ComposerSuggestionMeta variant="code">@handle</ComposerSuggestionMeta>
          </ComposerSuggestionAside>
        </ComposerSuggestionContent>
      </div>
    </ThemeProvider>,
  );
}

function inside(child: Element, parent: Element) {
  const c = child.getBoundingClientRect();
  const p = parent.getBoundingClientRect();
  return c.left >= p.left - 0.5 && c.right <= p.right + 0.5;
}

for (const theme of ["brutal", "elegant"] as const) {
  for (const width of [480, 300]) {
    for (const name of ["Peng", "Alexandra Montgomery-Fitzgerald"]) {
      it(`${theme} ${width}px: "${name}" shows in full while the description truncates`, () => {
        renderRow(theme, width, name);
        const content = screen.getByTestId("content");
        const title = screen.getByTestId("title");
        const meta = screen.getByTestId("meta");

        expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth + 1);
        expect(inside(title, content)).toBe(true);
        expect(inside(screen.getByTestId("badge"), content)).toBe(true);
        expect(inside(screen.getByTestId("aside"), content)).toBe(true);
        expect(meta.scrollWidth).toBeGreaterThan(meta.clientWidth);
        expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth + 1);
      });
    }
  }
}
