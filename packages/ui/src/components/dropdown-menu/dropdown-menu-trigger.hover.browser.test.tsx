import "./dropdown-menu.test.css";
/**
 * Browser-mode verification for rui#301 (reviewer-requested by @Artea):
 * the elegant DropdownMenuTrigger must not repaint the hover colour of the
 * Button the caller renders — verified as REAL PIXELS in all three theme
 * combinations, not as class names.
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

const THEMES: ReadonlyArray<{ family: "brutal" | "elegant"; mode?: "dark"; label: string }> = [
  { family: "brutal", label: "brutal" },
  { family: "elegant", label: "elegant" },
  { family: "elegant", mode: "dark", label: "elegant-dark" },
];

const VARIANTS = ["primary", "outline", "ghost"] as const;

/** Brutal's primary hover does not change colour at all — it moves and drops a
 *  shadow. Comparing only backgroundColor would make brutal's positive control
 *  unsatisfiable and its equality assertion vacuous, so compare the whole
 *  hover-reactive surface. */
function snap(el: Element) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
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
 * and the settled elegant primary hover serializes as
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

for (const { family, mode, label } of THEMES) {
  it(`${label}: a trigger-wrapped Button hovers in the SAME colour as the same Button alone`, async () => {
    render(
      <ThemeProvider theme={family} {...(mode ? { mode } : {})}>
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

      // Equality is asserted for ELEGANT only, because that is where the
      // contract exists. #301 removed `hover:bg-ink-2` from the elegant
      // trigger slot; brutal's trigger slot carries its own hover styling and
      // legitimately differs from a bare Button (measured: brutal/ghost
      // trigger is opaque where the plain Button's hover is ~0.89 alpha, and
      // brutal suppresses the Button's lift entirely). Asserting equality
      // there would pin behaviour this change never claimed.
      if (family === "elegant") {
        expect(
          triggerHover.bg,
          `${label}/${variant}: trigger hover bg ${triggerHover.bg} must equal plain hover bg ${plainHover.bg}`,
        ).toBe(plainHover.bg);
      } else {
        // brutal: no equality claim, only that hovering the trigger does
        // something — so a future change that kills its hover entirely is
        // still caught here.
        expect(
          JSON.stringify(triggerHover),
          `${label}/${variant}: the trigger must still react on hover`,
        ).not.toBe(JSON.stringify(triggerResting));
      }
    }
  });
}
