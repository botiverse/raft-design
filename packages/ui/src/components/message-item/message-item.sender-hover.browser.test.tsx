import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItemSender, MessageItemSenderButton } from "./message-item-header";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

async function settled(read: () => string): Promise<string> {
  let prev = "";
  let next = read();
  for (let i = 0; i < 40 && next !== prev; i += 1) {
    prev = next;
    await new Promise((r) => setTimeout(r, 50));
    next = read();
  }
  return next;
}

function renderAsTooltipTrigger(props: ComponentProps<"button">) {
  return <button {...props} data-slot="tooltip-trigger" />;
}

// A Tooltip trigger, or any render wrapper, replaces the button's data-slot.
// The hover underline used to be keyed on that data-slot and went with it.
it("the sender button underlines on hover when a wrapper replaces its data-slot", async () => {
  render(
    <ThemeProvider>
      <div className="flex gap-4 p-4">
        <MessageItemSenderButton data-testid="sender" render={renderAsTooltipTrigger}>
          Martin
        </MessageItemSenderButton>
        <MessageItemSender data-testid="plain">Bugen</MessageItemSender>
      </div>
    </ThemeProvider>,
  );
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  // The pointer may still rest where the last test hovered.
  await userEvent.unhover(document.body);
  const sender = screen.getByTestId("sender");
  expect(sender.getAttribute("data-slot")).toBe("tooltip-trigger");
  expect(getComputedStyle(sender).textDecorationLine).toBe("none");
  await page.getByTestId("sender").hover();
  expect(await settled(() => getComputedStyle(sender).textDecorationLine)).toBe("underline");

  // A name that opens nothing doesn't react to hover.
  const plain = screen.getByTestId("plain");
  await page.getByTestId("plain").hover();
  await new Promise((r) => setTimeout(r, 300));
  expect(getComputedStyle(plain).textDecorationLine).toBe("none");
});
