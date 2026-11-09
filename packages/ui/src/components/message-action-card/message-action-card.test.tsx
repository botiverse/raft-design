// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import {
  MessageActionCard,
  MessageActionCardHeader,
  MessageActionCardHeaderDescription,
  MessageActionCardHeaderMeta,
  MessageActionCardHeaderTitle,
} from "./message-action-card";

// What the header's parts render, without layout. Where the time sits beside
// the title and the description needs a real browser:
// message-action-card.browser.test.tsx.

afterEach(cleanup);

const classes = (element: Element) => element.className.split(/\s+/);

test("the header's time is a mono note at the hint tier, at 400 under the bold header", () => {
  render(
    <MessageActionCard defaultOpen={false}>
      <MessageActionCardHeader>
        <MessageActionCardHeaderTitle>
          Sent to #launch-week
          <MessageActionCardHeaderMeta data-testid="meta" render={<time dateTime="10:51" />}>
            10:51
          </MessageActionCardHeaderMeta>
        </MessageActionCardHeaderTitle>
      </MessageActionCardHeader>
    </MessageActionCard>,
  );
  const meta = screen.getByTestId("meta");
  expect(meta.tagName).toBe("TIME");
  expect(meta.getAttribute("dateTime")).toBe("10:51");
  expect(meta.getAttribute("data-slot")).toBe("message-action-card-header-meta");
  expect(classes(meta)).toEqual(
    expect.arrayContaining([
      "block",
      "font-mono",
      "text-mono-meta",
      "font-normal",
      "tabular-nums",
      "text-foreground-hint",
    ]),
  );
  expect(classes(meta)).not.toContain("text-foreground-muted");
});

test("inside the description it closes that line instead of starting its own", () => {
  render(
    <MessageActionCardHeaderTitle>
      Merge #26 into main
      <MessageActionCardHeaderDescription data-testid="description">
        Approved by Martin ·{" "}
        <MessageActionCardHeaderMeta data-testid="meta">10:51</MessageActionCardHeaderMeta>
      </MessageActionCardHeaderDescription>
    </MessageActionCardHeaderTitle>,
  );
  expect(screen.getByTestId("description").getAttribute("data-slot")).toBe(
    "message-action-card-header-description",
  );
  expect(classes(screen.getByTestId("meta"))).toEqual(
    expect.arrayContaining([
      "in-data-[slot=message-action-card-header-description]:inline",
      "in-data-[slot=message-action-card-header-description]:mt-0",
    ]),
  );
});
