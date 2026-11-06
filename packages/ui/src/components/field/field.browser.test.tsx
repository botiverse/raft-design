import "../timeline/timeline.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Checkbox } from "../checkbox/checkbox";
import { RadioGroup, RadioGroupItem } from "../radio-group/radio-group";
import { Switch } from "../switch/switch";
import { Field, FieldDescription, FieldItem, FieldLabel } from "./field";

// Same guard as the other browser tests: these need real layout, so they
// stand down in the node run and measure under `vp test --browser.enabled`.
const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

// The centre of the label's FIRST line, from the text itself rather than from
// the element box: a label that wraps has a box several lines tall, and the
// control belongs to the first of them.
function firstLineCentre(label: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(label);
  const first = range.getClientRects()[0] as DOMRect;
  return first.top + first.height / 2;
}

function controlCentre(control: HTMLElement) {
  const r = control.getBoundingClientRect();
  return r.top + r.height / 2;
}

for (const size of ["sm", "md"] as const) {
  it(`centres a ${size} control on its label's first line`, () => {
    render(
      <Field>
        <FieldItem size={size}>
          <Checkbox data-testid="box" />
          <FieldLabel size={size} data-testid="label">
            Don&apos;t remind me again
          </FieldLabel>
        </FieldItem>
      </Field>,
    );
    const delta =
      controlCentre(screen.getByTestId("box")) - firstLineCentre(screen.getByTestId("label"));
    expect(Math.abs(delta), `${size}: control off the label's line`).toBeLessThanOrEqual(0.5);
    cleanup();
  });
}

it("stays on the first line when the label wraps", () => {
  // The reason this is not `items-center`: centring on the label BOX would put
  // the control between the two lines.
  render(
    <div style={{ width: 200 }}>
      <Field>
        <FieldItem>
          <Checkbox data-testid="box" />
          <FieldLabel data-testid="label">
            A label long enough that it has to wrap onto a second line here
          </FieldLabel>
        </FieldItem>
      </Field>
    </div>,
  );
  const label = screen.getByTestId("label");
  const range = document.createRange();
  range.selectNodeContents(label);
  expect(range.getClientRects().length, "the label must wrap for this case").toBeGreaterThan(1);
  const delta = controlCentre(screen.getByTestId("box")) - firstLineCentre(label);
  expect(Math.abs(delta), "control left the first line").toBeLessThanOrEqual(0.5);
  cleanup();
});

it("stays on the label's line when a description follows", () => {
  render(
    <Field>
      <FieldItem>
        <Checkbox data-testid="box" />
        <div>
          <FieldLabel data-testid="label">Send as a task</FieldLabel>
          <FieldDescription>Leaving this off posts an ordinary message.</FieldDescription>
        </div>
      </FieldItem>
    </Field>,
  );
  const delta =
    controlCentre(screen.getByTestId("box")) - firstLineCentre(screen.getByTestId("label"));
  expect(Math.abs(delta), "control drifted toward the description").toBeLessThanOrEqual(0.5);
  cleanup();
});

// Every control the rule names, not just the checkbox: a selector that matches
// nothing passes a test written only for the box it does match. The switch is
// 30px against the same line, so it proves the offset follows the control.
const CONTROLS = [
  { name: "checkbox", render: () => <Checkbox data-testid="control" /> },
  { name: "radio", render: () => <RadioGroupItem value="a" data-testid="control" /> },
  { name: "switch", render: () => <Switch data-testid="control" /> },
] as const;

for (const control of CONTROLS) {
  it(`centres a ${control.name} on its label's first line`, () => {
    const item = (
      <Field>
        <FieldItem>
          {control.render()}
          <FieldLabel data-testid="label">Send as a task</FieldLabel>
        </FieldItem>
      </Field>
    );
    // A radio group wraps the items; each one sits in its own field row.
    render(control.name === "radio" ? <RadioGroup>{item}</RadioGroup> : item);
    const delta =
      controlCentre(screen.getByTestId("control")) - firstLineCentre(screen.getByTestId("label"));
    expect(Math.abs(delta), `${control.name} off the label's line`).toBeLessThanOrEqual(0.5);
    cleanup();
  });
}

// The space between the end of the label's own text and the optional marker:
// Latin "(optional)" gets 4px, a full-width "（选填）" none, because its bracket
// already carries the space (Field: Content).
function markerGap(label: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(label.firstChild as Node);
  const text = range.getBoundingClientRect();
  const marker = label.querySelector("[data-slot=label-optional]") as HTMLElement;
  return marker.getBoundingClientRect().left - text.right;
}

it("puts 4px before (optional) and nothing before a full-width （选填）", () => {
  render(
    <Field>
      <FieldLabel data-testid="latin" optional>
        Role
      </FieldLabel>
      <FieldLabel data-testid="zh" optional="（选填）">
        角色
      </FieldLabel>
    </Field>,
  );
  const latin = screen.getByTestId("latin");
  const zh = screen.getByTestId("zh");
  expect(latin.textContent).toBe("Role(optional)");
  expect(zh.textContent).toBe("角色（选填）");
  expect(markerGap(latin), "(optional) lost its 4px").toBeCloseTo(4, 0);
  expect(Math.abs(markerGap(zh)), "margin before （选填）").toBeLessThanOrEqual(0.5);
  cleanup();
});
