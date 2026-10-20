import "./button.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

// A Button follows Feishu's specs: on a desktop (from 768px) its label is
// 14px, and the default control height (`lg`, `icon-lg`) is 32px with an 18px
// icon and a 44px hit area; on a phone it keeps 13px labels and 44px controls
// with 22px icons. The sizes switch in the token layer (`text-control`,
// `control-*`), in light and dark alike. Measured in a real browser.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const MODES = ["light", "dark"] as const;

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

function renderButton(mode: (typeof MODES)[number], size?: "md" | "lg" | "xl" | "icon-lg") {
  render(
    <ThemeProvider mode={mode}>
      <Button
        data-testid="button"
        size={size}
        aria-label={size === "icon-lg" ? "Search" : undefined}
      >
        {size === "icon-lg" ? <svg data-testid="icon" viewBox="0 0 24 24" /> : "Assign"}
      </Button>
    </ThemeProvider>,
  );
  return screen.getByTestId("button");
}

const height = (element: Element) => element.getBoundingClientRect().height;

/** The height of the button's ::after hit area. */
function hitHeight(button: HTMLElement) {
  const after = getComputedStyle(button, "::after");
  if (after.position !== "absolute") return height(button);
  return height(button) - Number.parseFloat(after.top) - Number.parseFloat(after.bottom);
}

for (const mode of MODES) {
  it(`${mode}: on a phone the default Button's label is 13px`, async () => {
    await viewport(390);
    expect(getComputedStyle(renderButton(mode)).fontSize).toBe("13px");
  });

  it(`${mode}: on a desktop the default Button's label is 14px`, async () => {
    await viewport(1280);
    expect(getComputedStyle(renderButton(mode)).fontSize).toBe("14px");
  });

  it(`${mode}: the default Button is 32px on both, with a 44px hit area`, async () => {
    for (const width of [390, 1280]) {
      await viewport(width);
      const button = renderButton(mode);
      expect(height(button), `at ${width}px`).toBe(32);
      expect(hitHeight(button), `at ${width}px`).toBe(44);
      cleanup();
    }
  });

  it(`${mode}: on a phone a large Button and an icon-lg button are 44px, with a 22px icon`, async () => {
    await viewport(390);
    expect(height(renderButton(mode, "lg"))).toBe(44);
    cleanup();
    expect(height(renderButton(mode, "icon-lg"))).toBe(44);
    expect(height(screen.getByTestId("icon"))).toBe(22);
    cleanup();
    expect(height(renderButton(mode, "xl"))).toBe(52);
  });

  it(`${mode}: on a desktop they are 32px with an 18px icon and keep a 44px hit area`, async () => {
    await viewport(1280);
    const large = renderButton(mode, "lg");
    expect(height(large)).toBe(32);
    expect(hitHeight(large)).toBe(44);
    cleanup();
    const icon = renderButton(mode, "icon-lg");
    expect(height(icon)).toBe(32);
    expect(hitHeight(icon)).toBe(44);
    expect(height(screen.getByTestId("icon"))).toBe(18);
    cleanup();
    expect(height(renderButton(mode, "xl"))).toBe(40);
  });
}
