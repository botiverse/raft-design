import "./button.test.css";
/**
 * A loading button means "working on it", not "unavailable": it keeps its
 * width and its colors (button.md › Loading). It is aria-disabled so it keeps
 * its focus, and the recipe's aria-disabled grey used to reach it too: a
 * loading primary lost its pink, an outline its ink edge. A button that is
 * disabled and loading still looks disabled. Measured in a real browser.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/button`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function look(el: Element) {
  const cs = getComputedStyle(el);
  return {
    borderColor: cs.borderTopColor,
    background: cs.backgroundColor,
    backgroundImage: cs.backgroundImage,
    color: cs.color,
    boxShadow: cs.boxShadow,
  };
}

/** The browser dev server injects Tailwind rules asynchronously: read once
 * the look is the same across two reads (or after ~2.5s). */
async function settled(el: Element) {
  let prev = "";
  let next = JSON.stringify(look(el));
  for (let i = 0; i < 50 && next !== prev; i += 1) {
    prev = next;
    await new Promise((r) => setTimeout(r, 50));
    next = JSON.stringify(look(el));
  }
  return look(el);
}

for (const mode of ["light", "dark"] as const) {
  for (const variant of ["primary", "outline"] as const) {
    it(`${mode}, ${variant}: a loading button keeps its width and colors, hovered too`, async () => {
      const Subject = ({ loading }: { loading: boolean }) => (
        <ThemeProvider mode={mode}>
          <Button variant={variant} loading={loading} loadingLabel="Saving">
            Save Changes
          </Button>
        </ThemeProvider>
      );
      const { rerender } = render(<Subject loading={false} />);
      const button = screen.getByRole("button", { name: "Save Changes" });
      const { userEvent } = await import("vite-plus/test/browser/context");
      await userEvent.unhover(document.body);
      const idle = await settled(button);
      const width = button.getBoundingClientRect().width;

      rerender(<Subject loading />);
      expect(button.getAttribute("aria-disabled")).toBe("true");
      expect(button.getBoundingClientRect().width).toBe(width);
      expect(await settled(button)).toEqual(idle);

      await userEvent.hover(button);
      expect(await settled(button)).toEqual(idle);
      await userEvent.unhover(document.body);
    });

    it(`${mode}, ${variant}: a disabled button that is also loading looks disabled`, async () => {
      render(
        <ThemeProvider mode={mode}>
          <Button variant={variant} disabled>
            Idle
          </Button>
          <Button variant={variant} disabled loading loadingLabel="Busy">
            Busy
          </Button>
          <Button variant={variant}>Enabled</Button>
        </ThemeProvider>,
      );
      const disabled = await settled(screen.getByRole("button", { name: "Idle" }));
      const busy = await settled(screen.getByRole("button", { name: /Busy/ }));
      const enabled = await settled(screen.getByRole("button", { name: "Enabled" }));
      expect(busy).toEqual(disabled);
      expect(disabled.borderColor).not.toBe(enabled.borderColor);
    });
  }
}
