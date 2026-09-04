/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Combobox, ComboboxClear } from "./combobox";

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

// The clear button stays mounted while hidden (keepMounted default), painted
// away with opacity and pointer-events. aria-hidden alone does not keep a
// button out of the tab order, so the hidden state must also drop tabIndex —
// otherwise keyboard users land on an invisible, aria-hidden control.

function renderClear(props: { defaultValue?: string } = {}) {
  return render(
    <ThemeProvider theme="elegant">
      <Combobox defaultValue={props.defaultValue}>
        <ComboboxClear data-testid="clear" />
      </Combobox>
    </ThemeProvider>,
  );
}

test("hidden clear stays out of the tab order", () => {
  renderClear();
  const clear = screen.getByTestId("clear");
  expect(clear.getAttribute("aria-hidden")).toBe("true");
  expect(clear.getAttribute("tabindex")).toBe("-1");
});

test("visible clear re-enters the tab order", () => {
  renderClear({ defaultValue: "a" });
  const clear = screen.getByTestId("clear");
  expect(clear.getAttribute("aria-hidden")).toBeNull();
  expect(clear.getAttribute("tabindex")).toBeNull();
});
