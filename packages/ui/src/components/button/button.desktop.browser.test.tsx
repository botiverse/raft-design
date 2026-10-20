import "./button.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

// A Button follows Feishu's specs: on a desktop (from 768px) its label is
// 14px; on a phone it keeps 13px. The sizes switch in the token layer
// (`text-control`), in light and dark alike. Measured in a real browser.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const MODES = ["light", "dark"] as const;

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

function renderButton(mode: (typeof MODES)[number]) {
  render(
    <ThemeProvider mode={mode}>
      <Button data-testid="button">Assign</Button>
    </ThemeProvider>,
  );
  return screen.getByTestId("button");
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
}
