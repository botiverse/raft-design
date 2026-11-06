import "../button/button.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import { PickerTriggerButton } from "../picker-trigger-button/picker-trigger-button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";

// A field in a toolbar or a filter row takes the row's button height
// (`size="md"`): by touch it looks 32px like the filter triggers and `md`
// buttons beside it, and its input still takes a 44px tap; with a mouse every
// one of them is the control height, 34px, as before (xxchan, 2026-11-06,
// design/foundations/spacing.md#heights). A field on its own keeps the
// control height. Real layout only: jsdom has no boxes to measure.

const it = test.skipIf(typeof window === "undefined");

// Turning touch emulation off again leaves Chromium reporting `pointer: none`,
// so the mouse screen runs first.
const SCREENS = [
  { name: "desktop 1280", width: 1280, height: 800, touch: false, row: 34, field: 34 },
  { name: "tablet 1024", width: 1024, height: 768, touch: true, row: 32, field: 44 },
  { name: "phone 390", width: 390, height: 844, touch: true, row: 32, field: 44 },
] as const;
type Screen = (typeof SCREENS)[number];

let touching = false;
async function setScreen(s: Screen) {
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await page.viewport(s.width, s.height);
  if (s.touch && !touching) {
    touching = true;
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "pointer", value: "coarse" }],
    });
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  }
}

afterEach(cleanup);
afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  if (touching) {
    await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  }
  await page.viewport(414, 896);
});

function showRow() {
  render(
    <ThemeProvider mode="light">
      <div style={{ padding: 24, width: 360 }}>
        <div className="flex items-center gap-2">
          <InputGroup size="md" data-testid="toolbar-field" className="flex-1">
            <InputGroupAddon>
              <svg aria-hidden viewBox="0 0 24 24" />
            </InputGroupAddon>
            <InputGroupInput aria-label="Search artifacts" placeholder="Search artifacts" />
            <InputGroupAddon align="inline-end">
              <Button variant="ghost" size="icon-md" aria-label="Clear search" />
            </InputGroupAddon>
          </InputGroup>
          <PickerTriggerButton data-testid="picker">Type</PickerTriggerButton>
          <Button size="md" data-testid="button">
            New
          </Button>
        </div>
        <InputGroup data-testid="form-field" className="mt-8">
          <InputGroupInput aria-label="Name" />
        </InputGroup>
      </div>
    </ThemeProvider>,
  );
  return {
    field: screen.getByTestId("toolbar-field"),
    input: screen.getByRole("textbox", { name: "Search artifacts" }),
    picker: screen.getByTestId("picker"),
    button: screen.getByTestId("button"),
    formField: screen.getByTestId("form-field"),
    clear: screen.getByRole("button", { name: "Clear search" }),
  };
}

const height = (el: Element) => el.getBoundingClientRect().height;

for (const s of SCREENS) {
  it(`${s.name}: a toolbar field is as high as the row's buttons`, async () => {
    await setScreen(s);
    const { field, picker, button, formField, clear } = showRow();
    expect(height(picker)).toBe(s.row);
    expect(height(button)).toBe(s.row);
    expect(height(field)).toBe(height(picker));
    // A field on its own keeps the control height.
    expect(height(formField)).toBe(s.field);
    // A button embedded in it stays 6px inside the box's outer edge.
    expect(height(clear)).toBe(s.row - 12);
    expect(clear.getBoundingClientRect().top - field.getBoundingClientRect().top).toBe(6);
  });

  it(`${s.name}: a toolbar field's input takes a 44px tap by touch, none extra with a mouse`, async () => {
    await setScreen(s);
    const { field, input } = showRow();
    const box = field.getBoundingClientRect();
    const target = input.getBoundingClientRect();
    const x = target.left + target.width / 2;
    if (s.touch) {
      expect(target.height).toBeGreaterThanOrEqual(44);
      expect(target.top + target.height / 2).toBeCloseTo(box.top + box.height / 2, 1);
      // 5px past the box, above and below, a tap still lands on the input.
      expect(document.elementFromPoint(x, box.top - 5)).toBe(input);
      expect(document.elementFromPoint(x, box.bottom + 5)).toBe(input);
    } else {
      expect(target.top).toBeGreaterThanOrEqual(box.top);
      expect(target.bottom).toBeLessThanOrEqual(box.bottom);
      expect(document.elementFromPoint(x, box.top - 5)).not.toBe(input);
    }
  });
}
