/**
 * @vitest-environment jsdom
 *
 * Pins the MessageItemSavedIndicator prop contract (slock task #640):
 * `elevation` controls the shadow (default "none" = the passive state-marker
 * form: white surface + border-line-strong + no shadow on brutal), and
 * `iconOnly` explicitly selects the square icon-button treatment that used
 * to be driven by the `data-icon-only` attribute.
 */
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItemSavedIndicator } from "./message-footer";

// jsdom ships no matchMedia; ThemeProvider reads it for system-theme detection.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as never;
}

afterEach(cleanup);

function renderIndicator(
  props: { elevation?: "none" | "xs" | "sm"; iconOnly?: boolean } = {},
  theme: "brutal" | "elegant" = "brutal",
) {
  const { container } = render(
    <ThemeProvider theme={theme}>
      <MessageItemSavedIndicator {...props}>
        <svg />
        <span>Saved</span>
      </MessageItemSavedIndicator>
    </ThemeProvider>,
  );
  return container.firstElementChild as HTMLElement;
}

describe("MessageItemSavedIndicator elevation prop", () => {
  test('default elevation "none" renders the flat brutal state-marker shell', () => {
    const node = renderIndicator();
    expect(node.className).toContain("bg-white");
    expect(node.className).toContain("border-line-strong");
    expect(node.className).not.toContain("shadow-raft-xs");
    expect(node.className).not.toContain("shadow-raft-sm");
    expect(node.className).not.toContain("shadow-raft-md");
    expect(node.hasAttribute("data-icon-only")).toBe(false);
  });

  test('elevation="xs" adds shadow-raft-xs', () => {
    expect(renderIndicator({ elevation: "xs" }).className).toContain("shadow-raft-xs");
  });

  test('elevation="sm" adds shadow-raft-sm', () => {
    const cls = renderIndicator({ elevation: "sm" }).className;
    expect(cls).toContain("shadow-raft-sm");
    expect(cls).not.toContain("shadow-raft-xs");
  });
});

describe("MessageItemSavedIndicator iconOnly prop", () => {
  test("brutal icon-only keeps the square hard-shadow button treatment", () => {
    const node = renderIndicator({ iconOnly: true });
    expect(node.hasAttribute("data-icon-only")).toBe(true);
    const cls = node.className;
    expect(cls).toContain("size-7");
    expect(cls).toContain("justify-center");
    expect(cls).toContain("p-0");
    expect(cls).toContain("border-2");
    expect(cls).toContain("shadow-raft-sm");
    expect(cls).toContain("hover:-translate-y-px");
    expect(cls).toContain("hover:shadow-raft-md");
    expect(cls).toContain("active:translate-px");
    expect(cls).toContain("active:shadow-raft-xs");
    expect(cls).toContain("[&_svg]:size-3.5");
  });

  test("elegant icon-only keeps the rounded-md compact treatment without brutal chrome", () => {
    const node = renderIndicator({ iconOnly: true }, "elegant");
    expect(node.hasAttribute("data-icon-only")).toBe(true);
    const cls = node.className;
    expect(cls).toContain("size-7");
    expect(cls).toContain("rounded-md");
    expect(cls).toContain("[&_svg]:size-4");
    expect(cls).not.toContain("border-2");
    expect(cls).not.toContain("shadow-raft-sm");
  });

  test("CONTROL: elegant default shell is untouched by the brutal retune", () => {
    const cls = renderIndicator({}, "elegant").className;
    expect(cls).toContain("bg-primary-soft");
    expect(cls).not.toContain("bg-white");
    expect(cls).not.toContain("border-line-strong");
  });
});
