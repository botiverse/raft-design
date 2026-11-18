import "./select.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Select, SelectIcon, SelectTrigger, SelectValue } from "./select";

// The selected value that doesn't fit ends in an ellipsis (select.md: it stays
// on one line and truncates). A browser draws `text-overflow: ellipsis` only in
// a block container: as a flex container the value clipped its text with no
// ellipsis (a Server name in the desktop sign-in sheet at 390px, 2026-11-18).

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const LABEL = "QA Workspace Artifacts (qa-wa-1ilac), a long Server name";
const ITEMS = [{ value: "a", label: LABEL }];

it("a value that doesn't fit is a block that ends in an ellipsis, with its whole text as the title", async () => {
  const { container } = render(
    <ThemeProvider mode="light">
      <div style={{ width: 240 }}>
        <Select items={ITEMS} value="a">
          <SelectTrigger className="w-full">
            <SelectValue />
            <SelectIcon />
          </SelectTrigger>
        </Select>
      </div>
    </ThemeProvider>,
  );
  const value = container.querySelector<HTMLElement>('[data-slot="select-value"]')!;
  await expect.poll(() => value.textContent).toBe(LABEL);
  const style = getComputedStyle(value);
  expect(style.display).toBe("block");
  expect(style.textOverflow).toBe("ellipsis");
  expect(style.whiteSpace).toBe("nowrap");
  expect(style.overflowX).toBe("hidden");
  expect(value.scrollWidth).toBeGreaterThan(value.clientWidth);
  await expect.poll(() => value.getAttribute("title")).toBe(LABEL);
});
