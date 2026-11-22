import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Kbd } from "../kbd/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip/tooltip";
import { MessageItem } from "./message-item-root";
import { MessageItemToolbar, MessageItemToolbarButton } from "./message-item-toolbar";

// Every icon-only button shows its name as a tooltip on a pointer device
// (button.md, "Accessibility"): the hover toolbar's buttons show their
// aria-label, with the shortcut after it. A caller's own tooltip replaces it,
// and the open tooltip never counts as one of the row's popups, which would
// keep the toolbar shown after the pointer leaves.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const SHOWN_TOOLBAR = { opacity: 1, pointerEvents: "auto" } as const;

function Row({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <div style={{ paddingTop: 80 }}>
          <MessageItem data-testid="row">
            <MessageItemToolbar style={SHOWN_TOOLBAR}>{children}</MessageItemToolbar>
            <p>Message</p>
          </MessageItem>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

const tooltips = () => Array.from(document.querySelectorAll("[data-slot=tooltip-content]"));

async function hover(element: Element) {
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  await userEvent.hover(element);
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

it("hovering a toolbar button shows its name and shortcut as a tooltip, not as an open popup", async () => {
  render(
    <Row>
      <MessageItemToolbarButton aria-label="Reply in thread" shortcut={<Kbd>R</Kbd>}>
        R
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Save message">S</MessageItemToolbarButton>
    </Row>,
  );

  const reply = screen.getByRole("button", { name: "Reply in thread" });
  await hover(reply);
  await waitFor(
    () => expect(tooltips().map((node) => node.textContent)).toEqual(["Reply in thread" + "R"]),
    {
      timeout: 3000,
    },
  );
  expect(tooltips()[0]?.querySelector("[data-slot=kbd]")?.textContent).toBe("R");
  expect(screen.getByTestId("row").querySelector("[data-popup-open]")).toBeNull();

  await hover(screen.getByRole("button", { name: "Save message" }));
  await waitFor(
    () => expect(tooltips().map((node) => node.textContent)).toEqual(["Save message"]),
    { timeout: 3000 },
  );
});

it("tooltip={false} shows no tooltip", async () => {
  render(
    <Row>
      <MessageItemToolbarButton aria-label="More actions" tooltip={false}>
        M
      </MessageItemToolbarButton>
    </Row>,
  );

  await hover(screen.getByRole("button", { name: "More actions" }));
  await settle();
  expect(tooltips()).toHaveLength(0);
});

it("inside a caller's own TooltipTrigger it adds none: one tooltip, the caller's", async () => {
  render(
    <Row>
      <Tooltip>
        <TooltipTrigger
          render={<MessageItemToolbarButton aria-label="Like">L</MessageItemToolbarButton>}
        />
        <TooltipContent>Like, hover for more reactions</TooltipContent>
      </Tooltip>
    </Row>,
  );

  await hover(screen.getByRole("button", { name: "Like" }));
  await waitFor(
    () =>
      expect(tooltips().map((node) => node.textContent)).toEqual([
        "Like, hover for more reactions",
      ]),
    { timeout: 3000 },
  );
  await settle();
  expect(tooltips()).toHaveLength(1);
});
