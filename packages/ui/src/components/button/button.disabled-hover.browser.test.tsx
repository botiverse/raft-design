import "./button.test.css";
/**
 * Browser-mode verification for task #77 (reviewer-requested): on the
 * aria-disabled path a hovered/pressed button must NOT react — background,
 * border, scale and translate stay at their resting values, per theme.
 *
 * Run: `vp test --browser.enabled=true src/components/button/button.disabled-hover.browser.test.tsx`
 * (chromium via playwright; real CDP hover so :hover actually applies).
 *
 * NOTE: `@vitest/browser/context` throws when imported in the node pool, so
 * `page` is imported lazily inside the test (the file itself must stay
 * importable in the regular pool, where it skips).
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const THEMES: ReadonlyArray<{
  family: "brutal" | "elegant";
  mode?: "dark";
  label: string;
}> = [
  { family: "brutal", label: "brutal" },
  { family: "elegant", label: "elegant" },
  { family: "elegant", mode: "dark", label: "elegant-dark" },
];
const VARIANTS = ["primary", "ghost", "danger"] as const;

function snap(el: Element) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
    borderColor: cs.borderColor,
    scale: cs.scale,
    translate: cs.translate,
    boxShadow: cs.boxShadow,
  };
}

for (const { family, mode, label } of THEMES) {
  it(`${label}: hovered aria-disabled buttons do not react (bg/border/scale/translate/shadow unchanged)`, async () => {
    render(
      <ThemeProvider theme={family} {...(mode ? { mode } : {})}>
        <div
          data-testid="stage"
          className="bg-layer-page text-foreground"
          style={{ display: "inline-flex", gap: 12, padding: 16 }}
        >
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} disabled focusableWhenDisabled>
              {variant}
            </Button>
          ))}
        </div>
      </ThemeProvider>,
    );

    const { page } = await import("@vitest/browser/context");
    for (const variant of VARIANTS) {
      const button = page.getByRole("button", { name: variant, exact: true });
      const el = button.query() as unknown as Element;
      const resting = snap(el);
      await button.hover();
      const hovered = snap(el);
      expect(hovered, `${label}/${variant} must not change on hover`).toEqual(resting);
    }

    // One screenshot per theme with the danger button hovered (reviewer ask).
    await page.getByRole("button", { name: "danger", exact: true }).hover();
    await page
      .getByTestId("stage")
      .screenshot({ path: `task-77-aria-disabled-hover-${label}.png` });
  });
}
