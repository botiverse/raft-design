import "./list-row.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { ListRow, ListRowBody, ListRowChevron, ListRowTitle, ListRowValue } from "./list-row";

// A settings row (`variant="plain"`) is 56px with one line of text: it
// declares the height instead of deriving 48 from 12 + 24 + 12, which is how
// the 44px touch floor ended up read as the row height. Measured at phone
// width in a real browser; jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function phone() {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 844);
}

it("on a phone a one-line settings row is 56px", async () => {
  await phone();
  render(
    <ThemeProvider>
      <ListRow variant="plain" data-testid="row">
        <ListRowBody>
          <ListRowTitle>Appearance</ListRowTitle>
        </ListRowBody>
        <ListRowValue>System</ListRowValue>
        <ListRowChevron />
      </ListRow>
    </ThemeProvider>,
  );
  expect(screen.getByTestId("row").getBoundingClientRect().height).toBe(56);
});

it("CONTROL: a conversation row keeps its own 64px", async () => {
  await phone();
  render(
    <ThemeProvider>
      <ListRow data-testid="row">
        <ListRowBody>
          <ListRowTitle>Wug</ListRowTitle>
        </ListRowBody>
      </ListRow>
    </ThemeProvider>,
  );
  expect(screen.getByTestId("row").getBoundingClientRect().height).toBe(64);
});
