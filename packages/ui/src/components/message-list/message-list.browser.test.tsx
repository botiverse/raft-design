import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageList } from "./message-list";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

it("wide content does not stretch messages past a narrow list on a desktop viewport", async () => {
  // A narrow list on a wide window (a side panel, a phone frame) takes the
  // ScrollArea path, not the mobile one.
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 900);
  render(
    <ThemeProvider>
      <div style={{ width: "320px", height: "400px" }}>
        <MessageList>
          <div data-testid="message" className="min-w-0">
            <div className="overflow-x-auto">
              <div style={{ width: "800px" }}>wide tab strip</div>
            </div>
          </div>
        </MessageList>
      </div>
    </ThemeProvider>,
  );
  const message = screen.getByTestId("message").getBoundingClientRect();
  expect(message.width).toBeLessThanOrEqual(320);
});
