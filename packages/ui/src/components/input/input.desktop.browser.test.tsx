import "./input.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Input } from "./input";

// Field text is 16px on a phone, where iOS zooms into a field with smaller
// text, and the desktop body size, 14/22, from 768px; the field is 44px high
// on a phone and Feishu's 32px on a desktop. The field and control tokens
// switch in foundation.css, so Input carries no breakpoint. Measured in a real
// browser.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

function renderInput() {
  render(
    <ThemeProvider>
      <Input data-testid="input" aria-label="Channel name" />
    </ThemeProvider>,
  );
  return screen.getByTestId("input");
}

it("on a phone, field text is 16/24", async () => {
  await viewport(390);
  const style = getComputedStyle(renderInput());
  expect([style.fontSize, style.lineHeight]).toEqual(["16px", "24px"]);
});

it("on a desktop, field text is 14/22", async () => {
  await viewport(1280);
  const style = getComputedStyle(renderInput());
  expect([style.fontSize, style.lineHeight]).toEqual(["14px", "22px"]);
});

it("on a phone, an input is 44px high", async () => {
  await viewport(390);
  expect(renderInput().getBoundingClientRect().height).toBe(44);
});

it("on a desktop, an input is 32px high", async () => {
  await viewport(1280);
  expect(renderInput().getBoundingClientRect().height).toBe(32);
});
