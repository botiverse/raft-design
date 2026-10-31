/**
 * @vitest-environment jsdom
 *
 * Pins the MessageItemSavedIndicator prop contract: by default it is the
 * passive state marker (a flat muted chip with no shadow; controls cast none),
 * and `iconOnly` explicitly selects the square icon-button treatment that used
 * to be driven by the `data-icon-only` attribute.
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
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

function renderIndicator(props: { iconOnly?: boolean } = {}) {
  const { container } = render(
    <ThemeProvider>
      <MessageItemSavedIndicator {...props}>
        <svg />
        <span>Saved</span>
      </MessageItemSavedIndicator>
    </ThemeProvider>,
  );
  return container.firstElementChild as HTMLElement;
}

describe("MessageItemSavedIndicator default", () => {
  test("renders the flat state-marker chip with no shadow", () => {
    const node = renderIndicator();
    const classes = node.className.split(/\s+/);
    // The reactions' height and the footer badges' type: one row, one weight.
    expect(classes).toContain("h-6");
    expect(classes).toContain("text-footnote");
    expect(classes).toContain("font-bold");
    expect(classes).toContain("rounded-chip");
    expect(classes).toContain("bg-fill-muted");
    expect(classes.filter((name) => name.startsWith("shadow-"))).toEqual([]);
    expect(node.hasAttribute("data-icon-only")).toBe(false);
  });
});

describe("MessageItemSavedIndicator iconOnly prop", () => {
  test("icon-only takes the square icon-button treatment", () => {
    const node = renderIndicator({ iconOnly: true });
    expect(node.hasAttribute("data-icon-only")).toBe(true);
    const classes = node.className.split(/\s+/);
    for (const name of [
      "size-8",
      "justify-center",
      "p-0",
      "rounded-control",
      "bg-transparent",
      "[&_svg]:size-[18px]",
    ]) {
      expect(classes).toContain(name);
    }
    // The chip shell is replaced, not merely accompanied.
    for (const name of ["h-6", "rounded-chip", "bg-fill-muted", "[&_svg]:size-3.5"]) {
      expect(classes).not.toContain(name);
    }
  });

  test("CONTROL: the default shell is not the icon-button one", () => {
    const classes = renderIndicator().className.split(/\s+/);
    expect(classes).not.toContain("size-8");
    expect(classes).not.toContain("bg-transparent");
  });
});
