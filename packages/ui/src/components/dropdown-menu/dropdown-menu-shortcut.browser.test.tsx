import "./dropdown-menu.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { ContextMenuShortcut } from "../context-menu/context-menu";
import { Kbd } from "../kbd/kbd";
import { DropdownMenuShortcut } from "./dropdown-menu";

// A menu draws its shortcut with no cap (kbd.md, "Menus"). Kbd draws its cap
// line with Tailwind's inset-ring, which ring-0 does not reset, so a menu
// shortcut that only said ring-0 kept a 1px inset box (found in slock #12637's
// Help menu, raft-ui 0.60.0). Computed box-shadow, in light and dark: jsdom
// has no styles.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

/** The widest spread among an element's box-shadow layers, 0 for none. */
function widestSpread(el: Element) {
  const shadow = getComputedStyle(el).boxShadow;
  if (shadow === "none") return 0;
  // Each layer is "<color> <x> <y> <blur> <spread> [inset]"; colors may
  // contain commas, so read the four lengths before each optional "inset".
  const spreads = [...shadow.matchAll(/(-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px/g)].map(
    (match) => Math.abs(parseFloat(match[4]!)),
  );
  return Math.max(0, ...spreads);
}

/** Tailwind injects rules on demand: wait until the control's cap line lands. */
async function capLineLanded(el: Element) {
  for (let i = 0; i < 60 && widestSpread(el) === 0; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: menu shortcuts draw no cap line, a plain Kbd still does`, async () => {
    render(
      <ThemeProvider mode={mode}>
        <div className="flex gap-4 bg-layer-page p-4">
          <Kbd data-testid="control">K</Kbd>
          <DropdownMenuShortcut data-testid="dropdown">⌘/</DropdownMenuShortcut>
          <ContextMenuShortcut data-testid="context">⌘C</ContextMenuShortcut>
        </div>
      </ThemeProvider>,
    );

    const control = screen.getByTestId("control");
    await capLineLanded(control);
    expect(widestSpread(control), "plain Kbd keeps its 1px cap line").toBe(1);

    for (const id of ["dropdown", "context"]) {
      const el = screen.getByTestId(id);
      expect(widestSpread(el), `${id} shortcut box-shadow: ${getComputedStyle(el).boxShadow}`).toBe(
        0,
      );
      expect(getComputedStyle(el).backgroundColor, id).toBe("rgba(0, 0, 0, 0)");
    }
  });
}
