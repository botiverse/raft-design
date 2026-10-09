/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";

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

function renderAddon(
  theme: "brutal" | "elegant",
  variant: "default" | "container",
  kind: "root" | "text",
) {
  render(
    <ThemeProvider theme={theme}>
      <InputGroup>
        {kind === "root" ? (
          <InputGroupAddon variant={variant} align="inline-end" data-testid="addon">
            %
          </InputGroupAddon>
        ) : (
          <InputGroupAddon.Text variant={variant} align="inline-end" data-testid="addon">
            %
          </InputGroupAddon.Text>
        )}
        <InputGroupInput />
      </InputGroup>
    </ThemeProvider>,
  );
  return screen.getByTestId("addon").className.split(/\s+/);
}

/**
 * The focus/disabled colors of the addon/text flow through the `--ig-addon-fg` /
 * `--ig-text-fg` variables. The container variant used to add a second,
 * unprefixed color class (`text-foreground-placeholder`) next to the variable
 * read; the class merge kept the placeholder and dropped the read, so focus and
 * disabled stopped re-coloring (found in review). The container variant now
 * only supplies a default for the variable — exactly one color class remains.
 */
test("elegant container addon keeps exactly one, state-driven color class", () => {
  const tokens = renderAddon("elegant", "container", "root");
  const colorReads = tokens.filter((token) => token.startsWith("text-(--ig-"));
  expect(colorReads.length).toBe(1);
  expect(colorReads[0].startsWith("text-(--ig-addon-fg")).toBe(true);
  expect(tokens).not.toContain("text-foreground-placeholder");
});

test("elegant container text keeps its state-driven color class", () => {
  const tokens = renderAddon("elegant", "container", "text");
  const colorReads = tokens.filter((token) => token.startsWith("text-(--ig-"));
  expect(colorReads.length).toBe(1);
  expect(colorReads[0].startsWith("text-(--ig-text-fg")).toBe(true);
  expect(tokens).not.toContain("text-foreground-placeholder");
});

test("elegant default addon reads the variable with its fallback default", () => {
  const tokens = renderAddon("elegant", "default", "root");
  expect(tokens.some((token) => token.startsWith("text-(--ig-addon-fg"))).toBe(true);
  expect(tokens).not.toContain("text-foreground-placeholder");
});

test("brutal container addon keeps its static brutal color", () => {
  const tokens = renderAddon("brutal", "container", "root");
  expect(tokens).toContain("text-foreground-strong/70");
});
