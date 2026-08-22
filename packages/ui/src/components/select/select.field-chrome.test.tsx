/**
 * @vitest-environment jsdom
 *
 * Per file rather than by config: neither `packages/ui/vitest.config.ts` nor a
 * `test` key in this package's vite-plus config is picked up by the current
 * runner — verified by removing this directive and watching every DOM test
 * fail with `document is not defined`. A config that is not honoured would be
 * worse than none: it reads as though the environment is set.
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "./select";

// What these pin, and what they deliberately do not.
//
// They assert WHICH DECLARED TOKEN each end consumes — not measured geometry.
// jsdom performs no layout, so any pixel assertion here would read 0 and pass
// on nothing; and this repo forbids browser validation without same-turn
// authorization, so a real engine is not available either. Consuming one token
// is the property that matters anyway: the defect was never a wrong number, it
// was the trigger and the popup each resolving their own.
//
// None of this is reachable from the recipe: a recipe is a class string, so
// there is no context to sever and no portal container to vary.

function renderSelect(props: { chrome?: "default" | "field"; container?: HTMLElement } = {}) {
  const { chrome, container } = props;
  return render(
    <Select defaultOpen chrome={chrome}>
      <SelectTrigger data-testid="trigger">
        <SelectValue />
      </SelectTrigger>
      <SelectContent portalProps={container ? { container } : undefined}>
        <SelectList>
          <SelectItem value="a" data-testid="item">
            Option A
          </SelectItem>
        </SelectList>
      </SelectContent>
    </Select>,
  );
}

const cls = (testid: string) => screen.getByTestId(testid).className;

afterEach(cleanup);

// Split per end on purpose. A single "both ends consume it" test is tripped by
// any of the three ways this can break, so a failure would not say which end
// stopped consuming — and nothing would isolate the trigger from the popup.
// Verified by mutation: with one combined test, severing the context, dropping
// the trigger classes and dropping the item classes all killed exactly the same
// pair, which reads as three checks while behaving as one.

test("field chrome: the trigger consumes the field token", () => {
  renderSelect({ chrome: "field" });
  expect(cls("trigger")).toContain("text-field");
  expect(cls("trigger")).toContain("font-field");
});

test("field chrome: the popup option consumes the field token", () => {
  renderSelect({ chrome: "field" });
  expect(cls("item")).toContain("text-field");
  expect(cls("item")).toContain("font-field");
});

test("default chrome consumes it at neither end", () => {
  // The zero-regression gate. Most Selects in the product are not form fields —
  // filter and sort controls among them — so the default must be untouched.
  renderSelect();
  expect(cls("trigger")).not.toContain("text-field");
  expect(cls("item")).not.toContain("text-field");
});

test("one declaration reaches a popup rendered into a custom portal container", () => {
  // The popup shares no DOM ancestor with its trigger, so this is the property
  // that would break first if either end went back to resolving its own value.
  const container = document.createElement("div");
  document.body.append(container);

  renderSelect({ chrome: "field", container });

  expect(container.contains(screen.getByTestId("item"))).toBe(true);
  expect(cls("item")).toContain("text-field");
  expect(cls("trigger")).toContain("text-field");
});

test("the two mount targets agree, and agree because they share a source", () => {
  // Equal results in two containers do NOT by themselves prove a shared source
  // — two independent lookups can coincide. The mutation teeth are what
  // separate those, and they live alongside this file.
  renderSelect({ chrome: "field" });
  const atRoot = cls("item");
  cleanup();

  const container = document.createElement("div");
  document.body.append(container);
  renderSelect({ chrome: "field", container });

  expect(cls("item")).toBe(atRoot);
});
