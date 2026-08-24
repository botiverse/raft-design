/**
 * @vitest-environment jsdom
 *
 * Per-file directive for the same reason as select.field-chrome.test.tsx: no
 * config-level environment is honoured by the current runner.
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "./select";

// jsdom ships no matchMedia; ThemeProvider reads it for system-theme detection.
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

// Why these exist, given select.field-chrome.test.tsx already covers this pair.
//
// Those tests assert `toContain("text-field")`. That is satisfied while the
// competing declaration is STILL on the element — which is exactly the state
// that shipped in 0.5.2 and rendered a 14px trigger against a 16px token. A
// presence assertion cannot see a conflict; only an absence assertion can.
//
// So these pin EXCLUSIVITY: the field declaration must be the only one of its
// kind left after the merge. Two distinct mechanisms can break that, and they
// need separate teeth because a fix for one does not touch the other:
//
//   D1  same element, same specificity  -> resolved by tailwind-merge, and only
//       if `text-field`/`font-field` are registered class groups. Unregistered,
//       both survive and stylesheet order silently decides.
//   D2  different element, higher specificity -> a theme puts weight on the
//       text-bearing descendant. tailwind-merge can never fix this; the axis has
//       to restate itself at the same target. Measured in production at the time
//       of writing: select-value 500 and select-item-text 700 against a 400
//       token, and both survive a D1-only fix.
//
// These read class strings rather than computed pixels on purpose: jsdom runs no
// cascade, so a computed assertion here would resolve to nothing and pass. The
// computed-value check lives app-side where a real browser is available.

function renderFieldSelect(theme: "brutal" | "elegant") {
  return render(
    <ThemeProvider theme={theme}>
      <Select defaultOpen chrome="field">
        <SelectTrigger data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectList>
            <SelectItem value="a" data-testid="item">
              Option A
            </SelectItem>
          </SelectList>
        </SelectContent>
      </Select>
    </ThemeProvider>,
  );
}

const cls = (testid: string) => screen.getByTestId(testid).className;

afterEach(cleanup);

test("D1 brutal: the trigger keeps the field size and drops the button's", () => {
  renderFieldSelect("brutal");
  expect(cls("trigger")).toContain("text-field");
  // The trigger renders as Button size="md", which brings `text-sm`. Both
  // surviving is the 0.5.2 defect: 14px won by emission order, not by intent.
  expect(cls("trigger")).not.toContain("text-sm");
});

test("D1 brutal: the option keeps the field size and drops the theme's", () => {
  renderFieldSelect("brutal");
  expect(cls("item")).toContain("text-field");
  expect(cls("item")).not.toContain("text-xs");
});

test("D1 elegant: the option keeps the field size and drops the theme's", () => {
  renderFieldSelect("elegant");
  expect(cls("item")).toContain("text-field");
  expect(cls("item")).not.toContain("text-[13px]");
});

test("D2 elegant: the axis reaches the descendant that actually carries the text", () => {
  renderFieldSelect("elegant");
  // The theme declares weight on select-value, not on the trigger. An
  // ancestor-level `font-field` loses to it on specificity no matter how the
  // merge resolves, so the override must exist at the same target.
  expect(cls("trigger")).toContain("**:data-[slot='select-value']:font-field");
  expect(cls("trigger")).not.toContain("**:data-[slot='select-value']:font-medium");
});

test("D2 brutal: the axis reaches the option's text element", () => {
  renderFieldSelect("brutal");
  expect(cls("item")).toContain("**:data-[slot='select-item-text']:font-field");
  expect(cls("item")).not.toContain("**:data-[slot='select-item-text']:font-bold");
});

test("default chrome is untouched: it keeps the theme's own declarations", () => {
  // The counterweight. Every assertion above is an absence, and absences pass on
  // an empty string — if `chrome="field"` silently stopped emitting anything at
  // all, all five would still be green. This one fails in that case, because it
  // requires the competing declarations to be present when they are not overridden.
  render(
    <ThemeProvider theme="brutal">
      <Select defaultOpen>
        <SelectTrigger data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectList>
            <SelectItem value="a" data-testid="item">
              Option A
            </SelectItem>
          </SelectList>
        </SelectContent>
      </Select>
    </ThemeProvider>,
  );
  expect(cls("trigger")).toContain("text-sm");
  expect(cls("item")).toContain("text-xs");
  expect(cls("item")).not.toContain("text-field");
});
