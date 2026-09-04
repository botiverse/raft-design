/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { NotificationCenter, NotificationCenterTrigger } from "./notification-center";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

// The default trigger content is icon-only (an aria-hidden bell plus an
// aria-hidden status dot), so the accessible name has to come from the trigger
// itself. These pin the emitted attributes, not resolved pixels — same node-side
// contract as dialog.chrome.test.tsx.

function renderTrigger(
  triggerProps: Record<string, unknown> = {},
  theme: "brutal" | "elegant" = "elegant",
) {
  return render(
    <ThemeProvider theme={theme}>
      <NotificationCenter>
        <NotificationCenterTrigger {...triggerProps} />
      </NotificationCenter>
    </ThemeProvider>,
  );
}

test.each(["brutal", "elegant"] as const)(
  "default trigger has an accessible name (%s)",
  (theme) => {
    renderTrigger({}, theme);
    expect(screen.getByRole("button", { name: "Notifications" })).toBeTruthy();
  },
);

test("a caller's aria-label wins over the built-in default", () => {
  renderTrigger({ "aria-label": "Activity" });
  expect(screen.getByRole("button", { name: "Activity" })).toBeTruthy();
});

test("custom children are not forced under the default label", () => {
  render(
    <ThemeProvider theme="elegant">
      <NotificationCenter>
        <NotificationCenterTrigger>Activity feed</NotificationCenterTrigger>
      </NotificationCenter>
    </ThemeProvider>,
  );
  expect(screen.getByRole("button", { name: "Activity feed" })).toBeTruthy();
});
