/**
 * @vitest-environment jsdom
 *
 * Per-file directive for the same reason as select.field-chrome.test.tsx: no
 * config-level environment is honoured by the current runner.
 */
import { afterEach, expect, test } from "vite-plus/test";
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
//   D2  different element, higher specificity -> weight declared on the
//       text-bearing descendant. tailwind-merge can never fix this; the axis has
//       to restate itself at the same target. Measured in production at the time
//       of writing: select-value 500 and select-item-text 700 against a 400
//       token, and both survive a D1-only fix.
//
// These read class strings rather than computed pixels on purpose: jsdom runs no
// cascade, so a computed assertion here would resolve to nothing and pass. The
// computed-value check lives app-side where a real browser is available.

function renderSelect(chrome?: "field") {
  return render(
    <ThemeProvider>
      <Select defaultOpen chrome={chrome}>
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

const classes = (testid: string) => screen.getByTestId(testid).className.split(/\s+/);

afterEach(cleanup);

test("D1: the trigger keeps the field size and weight and drops the default's", () => {
  renderSelect("field");
  const trigger = classes("trigger");
  expect(trigger).toContain("text-field");
  expect(trigger).toContain("font-field");
  // The trigger renders as Button size="md", which brings `text-sm`, and the
  // default chrome brings `text-subhead font-semibold`. Any of them surviving
  // is the 0.5.2 defect: the size won by emission order, not by intent.
  expect(trigger).not.toContain("text-sm");
  expect(trigger).not.toContain("text-subhead");
  expect(trigger).not.toContain("font-semibold");
});

test("D1: the option keeps the field size and weight and drops the default's", () => {
  renderSelect("field");
  const item = classes("item");
  expect(item).toContain("text-field");
  expect(item).toContain("font-field");
  expect(item).not.toContain("text-callout");
  expect(item).not.toContain("font-medium");
});

test("D2: the axis reaches BOTH descendants that carry trigger text", () => {
  renderSelect("field");
  // An ancestor-level `font-field` loses to weight declared on select-value or
  // button-content on specificity no matter how the merge resolves, so the
  // override must exist at both targets.
  //
  // Both are asserted because the implementation overrides both: pinning only
  // one lets the other silently regress. Verified by mutation — deleting just
  // the button-content override left this suite green when it only checked
  // select-value (@Dozy, review of 89f72133), which is the same shape of gap
  // these tests exist to catch.
  const trigger = classes("trigger");
  expect(trigger).toContain("**:data-[slot='select-value']:font-field");
  expect(trigger).not.toContain("**:data-[slot='select-value']:font-medium");
  expect(trigger).toContain("**:data-[slot='button-content']:font-field");
  expect(trigger).not.toContain("**:data-[slot='button-content']:font-medium");
});

test("D2: the axis reaches the option's text element", () => {
  renderSelect("field");
  const item = classes("item");
  expect(item).toContain("**:data-[slot='select-item-text']:font-field");
  expect(item).not.toContain("**:data-[slot='select-item-text']:font-bold");
});

test("default chrome is untouched: it keeps its own declarations", () => {
  // The counterweight. Every absence above passes on an empty string — if
  // `chrome="field"` silently stopped emitting anything at all, they would all
  // still be green. This one fails in that case, because it requires the
  // competing declarations to be present when they are not overridden.
  renderSelect();
  const trigger = classes("trigger");
  expect(trigger).toContain("text-subhead");
  expect(trigger).toContain("font-semibold");
  expect(trigger).not.toContain("text-field");
  const item = classes("item");
  expect(item).toContain("text-callout");
  expect(item).toContain("font-medium");
  expect(item).not.toContain("text-field");
  // A selected option reads bold, down to its text element.
  expect(item).toContain("data-selected:**:data-[slot='select-item-text']:font-bold");
});
