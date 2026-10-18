import "./dropdown-menu.test.css";
/**
 * Browser-mode verification for #301: DropdownMenuTrigger must not repaint the
 * hover colour of the Button the caller renders — verified as REAL PIXELS in
 * light and dark, not as class names.
 *
 * Run: `vp test --browser.enabled=true src/components/dropdown-menu/dropdown-menu-trigger.hover.browser.test.tsx`
 *
 * Pattern (and the two traps) taken from button.disabled-hover.browser.test.tsx:
 * Tailwind rules are injected on demand and asynchronously, so a computed
 * style read straight after a CDP hover can race the rule — poll until stable,
 * and keep a positive control that must visibly react, otherwise "colours
 * match" could just mean "no hover rule landed yet for either element".
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import { DropdownMenu, DropdownMenuTrigger } from "./dropdown-menu";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const MODES = ["light", "dark"] as const;

const VARIANTS = ["primary", "outline", "ghost"] as const;

/** Compare the whole hover-reactive surface (colour, pressed overlay, border,
 *  motion, shadow), not only backgroundColor, so the positive control fires
 *  whichever of them a variant's hover changes — filled variants keep their
 *  colour and add a pressed overlay (a background image). */
function snap(el: Element) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
    bgImage: cs.backgroundImage,
    borderColor: cs.borderColor,
    translate: cs.translate,
    boxShadow: cs.boxShadow,
  };
}

/**
 * Wait for the hover to actually TAKE, then for the value to stop moving.
 *
 * Polling only for "stable" is not enough: two consecutive reads can both land
 * before the hover applies — "stable" at the RESTING value — so require a
 * change from resting first, then stability.
 *
 * Measured in this environment: `transition-duration` is 0.1s with no delay,
 * and the settled primary hover serialized as
 * `color(srgb-linear 0.920409 0.606841 0.0485822)` — that notation is the
 * FINAL value (identical from 100ms through 1600ms), not an interpolated
 * frame. Resting is `oklch(0.883 0.162 91.89)`. A reading that sits just off
 * resting is therefore a hover that never took, not a transition caught
 * mid-flight.
 */
async function hoverSettled(el: Element, resting: ReturnType<typeof snap>) {
  const restingKey = JSON.stringify(resting);
  for (let i = 0; i < 60; i += 1) {
    if (JSON.stringify(snap(el)) !== restingKey) break;
    await new Promise((r) => setTimeout(r, 50));
  }
  // Comfortably past the measured 0.1s transition before sampling for
  // stability, so the first two equal reads are the settled value.
  await new Promise((r) => setTimeout(r, 300));
  let prev = "";
  let next = JSON.stringify(snap(el));
  for (let i = 0; i < 50 && next !== prev; i += 1) {
    prev = next;
    await new Promise((r) => setTimeout(r, 100));
    next = JSON.stringify(snap(el));
  }
  return snap(el);
}

for (const mode of MODES) {
  const label = mode;
  it(`${label}: a trigger-wrapped Button hovers in the SAME colour as the same Button alone`, async () => {
    render(
      <ThemeProvider mode={mode}>
        <div
          data-testid="stage"
          className="bg-layer-page text-foreground"
          style={{ display: "inline-flex", flexWrap: "wrap", gap: 12, padding: 16 }}
        >
          {VARIANTS.map((variant) => (
            <Button key={`plain-${variant}`} variant={variant} data-testid={`plain-${variant}`}>
              {`plain ${variant}`}
            </Button>
          ))}
          {VARIANTS.map((variant) => (
            <DropdownMenu key={`trigger-${variant}`}>
              <DropdownMenuTrigger
                render={<Button variant={variant} data-testid={`trigger-${variant}`} />}
              >
                {`trigger ${variant}`}
              </DropdownMenuTrigger>
            </DropdownMenu>
          ))}
        </div>
      </ThemeProvider>,
    );

    const { page } = await import("vite-plus/test/browser/context");

    // Warm-up, not decoration: the first hover on a freshly rendered page was
    // observed to be measured before it took effect, which read as "the plain
    // Button sits at its resting colour" and failed the comparison on correct
    // code. An earlier revision hid this behind a screenshot step that happened
    // to hover first; removing that step exposed it. Hover once and discard.
    await page.getByTestId("plain-primary").hover();
    await new Promise((r) => setTimeout(r, 300));
    // ...then move the pointer OFF it again, or the first iteration reads a
    // hovered element as its "resting" baseline and the control can never fire.
    await page.getByTestId("stage").hover();
    await new Promise((r) => setTimeout(r, 300));

    for (const variant of VARIANTS) {
      const plain = page.getByTestId(`plain-${variant}`);
      const trigger = page.getByTestId(`trigger-${variant}`);
      const plainEl = plain.query() as unknown as Element;
      const triggerEl = trigger.query() as unknown as Element;

      const plainResting = snap(plainEl);
      await plain.hover();
      const plainHover = await hoverSettled(plainEl, plainResting);

      const triggerResting = snap(triggerEl);
      await trigger.hover();
      const triggerHover = await hoverSettled(triggerEl, triggerResting);

      // Positive control: without a real hover change, an equality assertion
      // below would pass on two resting colours and prove nothing.
      expect(
        plainHover,
        `${label}/${variant}: the plain Button must actually react on hover (proves rules landed)`,
      ).not.toEqual(plainResting);

      // #301 removed a trigger-level `hover:bg-*` that out-merged the
      // Button's own hover; the trigger slot carries no hover styling, so the
      // wrapped Button must hover exactly like the bare one.
      expect(
        triggerHover.bg,
        `${label}/${variant}: trigger hover bg ${triggerHover.bg} must equal plain hover bg ${plainHover.bg}`,
      ).toBe(plainHover.bg);
      expect(triggerHover.bgImage, `${label}/${variant}: trigger hover overlay`).toBe(
        plainHover.bgImage,
      );
    }
  });
}
