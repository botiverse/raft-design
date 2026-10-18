import "./button.test.css";
/**
 * Browser-mode verification: on the aria-disabled path a hovered/pressed button
 * must NOT react — background, border, scale and translate stay at their
 * resting values, in each mode.
 *
 * Run: `vp test --browser.enabled=true src/components/button/button.disabled-hover.browser.test.tsx`
 * (chromium via playwright; real CDP hover so :hover actually applies).
 *
 * NOTE: `vite-plus/test/browser/context` throws when imported in the node pool, so
 * `page` is imported lazily inside the test (the file itself must stay
 * importable in the regular pool, where it skips).
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const MODES = ["light", "dark"] as const;

const VARIANTS = [
  "default",
  "primary",
  "outline",
  "ghost",
  "on-frame",
  "danger-secondary",
  "danger",
  "danger-outline",
  "accent",
  "warning",
  "information",
  "muted",
  "link",
  "success",
] as const;

// Frameless icon buttons draw no box when disabled, so hover must not bring
// one back either.
const ICON_VARIANTS = ["ghost", "on-frame"] as const;

function snap(el: Element) {
  const cs = getComputedStyle(el);
  return {
    bg: transparent(cs.backgroundColor),
    // Filled variants hover through a pressed overlay (a background image).
    bgImage: cs.backgroundImage,
    borderColor: transparent(cs.borderColor),
    scale: cs.scale,
    translate: cs.translate,
    boxShadow: transparentShadows(cs.boxShadow),
    textDecorationLine: cs.textDecorationLine,
  };
}

/** Fully-transparent colors serialize differently across rules (rgba vs
 * oklab); they are visually identical, so normalize them for comparison. */
const FULLY_TRANSPARENT = new Set([
  "rgba(0, 0, 0, 0)",
  "oklab(0 0 0 / 0)",
  "oklch(0 0 0 / 0)",
  "oklch(1 0 0 / 0)",
]);

function transparent(value: string): string {
  return FULLY_TRANSPARENT.has(value) ? "transparent" : value;
}

function transparentShadows(value: string): string {
  return value
    .split(/,(?![^(]*\))/)
    .map((layer) => transparent(layer.trim()))
    .join(", ");
}

/**
 * The vitest-browser dev server generates Tailwind rules on demand and injects
 * them asynchronously: reading computed style immediately after a real CDP
 * hover can race the new rule (measured: recipe hover color only appeared after
 * a wait). Poll until the value is stable across two reads (or ~2.5s).
 */
async function settledBg(el: Element): Promise<string> {
  let prev = "";
  let next = getComputedStyle(el).backgroundColor;
  for (let i = 0; i < 50 && next !== prev; i += 1) {
    prev = next;
    await new Promise((r) => setTimeout(r, 50));
    next = getComputedStyle(el).backgroundColor;
  }
  return next;
}

for (const mode of MODES) {
  const label = mode;
  it(`${label}: hovered/pressed aria-disabled buttons do not react (bg/border/scale/translate/shadow/underline unchanged)`, async () => {
    render(
      <ThemeProvider mode={mode}>
        <div
          data-testid="stage"
          className="bg-layer-page text-foreground"
          style={{ display: "inline-flex", flexWrap: "wrap", gap: 12, padding: 16 }}
        >
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} disabled focusableWhenDisabled>
              {variant}
            </Button>
          ))}
          {ICON_VARIANTS.map((variant) => (
            <Button
              key={`${variant}-icon`}
              variant={variant}
              size="icon-md"
              aria-label={`${variant} icon`}
              disabled
              focusableWhenDisabled
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14" />
              </svg>
            </Button>
          ))}
          {/* Positive control (review round 3): proves this run's hover rules
              have actually landed before the disabled set is measured —
              without it, "no change" could just mean "not yet injected". */}
          <Button variant="primary" data-testid="control">
            control
          </Button>
        </div>
      </ThemeProvider>,
    );

    const { page } = await import("vite-plus/test/browser/context");

    // Positive control first: hover the ENABLED button and require a real
    // change (watch the pressed overlay, motion and shadow too, not only the
    // colour: the primary hover keeps its colour and adds an overlay).
    let canTestActive = false;
    {
      const control = page.getByTestId("control");
      const el = control.query() as unknown as Element;
      const resting = snap(el);
      await control.hover();
      const changed = await (async () => {
        for (let i = 0; i < 60; i += 1) {
          await new Promise((r) => setTimeout(r, 50));
          const now = snap(el);
          if (
            now.bg !== resting.bg ||
            now.bgImage !== resting.bgImage ||
            now.translate !== resting.translate ||
            now.boxShadow !== resting.boxShadow
          ) {
            return true;
          }
        }
        return false;
      })();
      expect(changed, `${label}: enabled control must react on hover (proves rules landed)`).toBe(
        true,
      );

      // Active-state probe: press-and-hold via raw CDP input events, then poll
      // a few frames — the CDP command returning does NOT guarantee the
      // renderer has processed the input and recomputed styles, so a single
      // synchronous read can false-negative. click({delay}) was tried earlier
      // and also never surfaced :active in this environment.
      {
        const { cdp } = await import("vite-plus/test/browser/context");
        const r = el.getBoundingClientRect();
        const point = {
          x: r.x + r.width / 2,
          y: r.y + r.height / 2,
          button: "left" as const,
          clickCount: 1,
        };
        await cdp().send("Input.dispatchMouseEvent", { type: "mousePressed", ...point });
        for (let frame = 0; frame < 10 && !canTestActive; frame += 1) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
          canTestActive = el.matches(":active");
        }
        await cdp().send("Input.dispatchMouseEvent", { type: "mouseReleased", ...point });
      }
      if (!canTestActive) {
        // Measured in this environment: after mousePressed (raw CDP) plus 10
        // rAF polls, and after click({delay: 1500}) earlier, :active was never
        // observed in any mode. Press assertions then stay covered by the
        // class-string assertions and the (0,3,0) > (0,2,0) cascade argument
        // (3 active: utilities, each with a matching aria-disabled:active
        // reset, scope verified in review). Any environment where the probe
        // turns true runs the full press assertions.
        console.warn(
          `[${label}] :active not observed (cdp mousePressed + 10 rAF polls) — ` +
            "press assertions skipped for this run",
        );
      }
    }

    for (const variant of [...VARIANTS, ...ICON_VARIANTS.map((name) => `${name} icon`)]) {
      const button = page.getByRole("button", { name: variant, exact: true });
      const el = button.query() as unknown as Element;
      const resting = snap(el);
      await button.hover();
      await settledBg(el);
      expect(snap(el), `${label}/${variant} must not change on hover`).toEqual(resting);

      if (canTestActive) {
        const { cdp } = await import("vite-plus/test/browser/context");
        const r = (el as HTMLElement).getBoundingClientRect();
        const point = {
          x: r.x + r.width / 2,
          y: r.y + r.height / 2,
          button: "left" as const,
          clickCount: 1,
        };
        await cdp().send("Input.dispatchMouseEvent", { type: "mousePressed", ...point });
        expect(snap(el), `${label}/${variant} must not change on press`).toEqual(resting);
        await cdp().send("Input.dispatchMouseEvent", { type: "mouseReleased", ...point });
      }
    }
  });
}

it("enabled button keeps consumer hover overrides (review round-2 regression)", async () => {
  // Gating recipe hovers with not-aria-disabled: broke this: the recipe's
  // rule out-ranked the consumer's plain hover:. With the resets approach the
  // original stacks are restored, so the consumer's hover must win again.
  // (The override class must exist in the parsed sheet: an arbitrary-value
  // class only present in this test file lands in a stylesheet chunk the
  // browser had not parsed yet in this env — measured. hover:bg-attention-500 is
  // used by the accent variant itself, so it is always parsed.)
  render(
    <ThemeProvider>
      <Button variant="primary" className="hover:bg-attention-500">
        Save
      </Button>
    </ThemeProvider>,
  );
  const { page } = await import("vite-plus/test/browser/context");
  const button = page.getByRole("button", { name: "Save" });
  const el = button.query() as unknown as Element;
  const resting = snap(el);
  await button.hover();
  const settled = await settledBg(el);
  // attention-500 = palette-pink-400 = oklch(0.749 0.162 0.71)
  expect(settled).toContain("0.749");
  expect(settled).not.toBe(resting.bg);
});
