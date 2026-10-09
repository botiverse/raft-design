import "../button/button.test.css";
/**
 * Browser-mode hit-target contract for MessageItemToolbar (slock #6297,
 * tasks #477 / #532).
 *
 * In Brutal the toolbar straddles the row's top edge (`-top-3.5`), so part of
 * each button sits above the row. If the toolbar stops being a hit target
 * while the row is not hovered, a pointer that lands on that upper part hits
 * the element behind it instead: the row never gets :hover, the toolbar never
 * becomes clickable, and the click goes to whatever is behind it. Slock's E2E
 * shard failed deterministically this way.
 *
 * Run: `vp test --browser.enabled=true src/components/message-item/message-item-toolbar.hit-target.browser.test.tsx`
 */
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItemToolbar, MessageItemToolbarButton } from "./message-item-toolbar";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

it("brutal: a click on the part of a toolbar button above the row reaches the button", async () => {
  const onToolbarClick = vi.fn();
  const onBehindClick = vi.fn();

  render(
    <ThemeProvider theme="brutal">
      <div style={{ width: 400, padding: "40px 0" }}>
        <div data-testid="behind" style={{ height: 60 }} onClick={onBehindClick} />
        <div className="group/message relative" style={{ height: 60 }} data-testid="row">
          <MessageItemToolbar>
            <MessageItemToolbarButton aria-label="reply" onClick={onToolbarClick}>
              <svg viewBox="0 0 10 10" />
            </MessageItemToolbarButton>
          </MessageItemToolbar>
        </div>
      </div>
    </ThemeProvider>,
  );

  const { page } = await import("@vitest/browser/context");
  const row = page.getByTestId("row").query() as unknown as HTMLElement;
  const button = page.getByRole("button", { name: "reply" }).query() as unknown as HTMLElement;

  const rowTop = row.getBoundingClientRect().top;
  const b = button.getBoundingClientRect();
  // Premise: the button really does stick out above the row.
  expect(b.top, "toolbar button must straddle the row's top edge").toBeLessThan(rowTop - 2);

  // Click straight onto the part above the row, without hovering the row
  // first. `force` skips Playwright's actionability check so the click lands
  // on whatever is actually hit at that point (coordinates are relative to the
  // button, so the test iframe's offset/scale doesn't matter).
  await page.getByRole("button", { name: "reply" }).click({
    force: true,
    position: { x: b.width / 2, y: (rowTop - b.top) / 2 },
  });

  expect(
    onBehindClick,
    "the click must not fall through to the element behind",
  ).not.toHaveBeenCalled();
  expect(onToolbarClick).toHaveBeenCalledTimes(1);
});
