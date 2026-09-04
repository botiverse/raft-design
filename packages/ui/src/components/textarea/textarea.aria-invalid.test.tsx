/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Textarea } from "./textarea";

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

// data-invalid is the styling contract; aria-invalid is the accessibility
// contract. The two overlap but are not identical — aria-invalid also takes
// "grammar"/"spelling" — so a caller's explicit aria-invalid must win over
// the data-invalid-derived default rather than being wiped to undefined.

function renderTextarea(props: Record<string, unknown> = {}) {
  return render(
    <ThemeProvider theme="elegant">
      <Textarea data-testid="textarea" {...props} />
    </ThemeProvider>,
  );
}

test("data-invalid defaults aria-invalid to true", () => {
  renderTextarea({ "data-invalid": true });
  expect(screen.getByTestId("textarea").getAttribute("aria-invalid")).toBe("true");
});

test("a caller's aria-invalid survives without data-invalid", () => {
  renderTextarea({ "aria-invalid": "grammar" });
  expect(screen.getByTestId("textarea").getAttribute("aria-invalid")).toBe("grammar");
});

test("a caller's aria-invalid wins over the data-invalid default", () => {
  renderTextarea({ "data-invalid": true, "aria-invalid": "grammar" });
  expect(screen.getByTestId("textarea").getAttribute("aria-invalid")).toBe("grammar");
});
