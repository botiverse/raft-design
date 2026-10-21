import "./components/select/select.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import { Checkbox } from "./components/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./components/combobox";
import { ComboboxSelect } from "./components/combobox-select";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "./components/dialog";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from "./components/drawer";
import { Field, FieldDescription, FieldError, FieldItem, FieldLabel } from "./components/field";
import { Input } from "./components/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./components/input-group";
import { RadioGroup, RadioGroupItem } from "./components/radio-group";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "./components/select";
import { Switch } from "./components/switch";
import { Textarea } from "./components/textarea";

// Long values in fields (design/patterns/forms.md#long-values-in-fields): a
// value, a label, a description, an error, an option or a chip of any length
// stays inside the field, the dialog, the drawer and the screen, at 320px and
// 390px on a touch screen and at 1280px with a mouse. Real layout only: jsdom
// has no boxes to measure.

const it = test.skipIf(typeof window === "undefined");

async function context() {
  return import("vite-plus/test/browser/context");
}

const VIEWPORTS = [
  { width: 320, touch: true },
  { width: 390, touch: true },
  { width: 1280, touch: false },
] as const;

async function viewport(width: number, touch: boolean) {
  const { cdp, page } = await context();
  await page.viewport(width, 720);
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: touch ? "coarse" : "fine" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: touch, maxTouchPoints: 1 });
}

afterEach(cleanup);
afterAll(() => viewport(1280, false));

/** Waits for layout and any running transition (a sheet sliding in) to end. */
async function settled() {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await Promise.all(document.getAnimations().map((animation) => animation.finished));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

const TOKEN = `https://files.example.com/${"a1b2c3d4e5".repeat(28)}`;
const CJK = "这是一个非常长的中文字段值用来测试表单控件在窄屏上是否会溢出屏幕".repeat(4);
const WORDS =
  "Internationalization Telecommunications Counterrevolutionaries Incomprehensibilities Uncharacteristically Electroencephalographically";

const CASES = [
  { name: "a 300-character token", text: TOKEN },
  { name: "a long CJK string", text: CJK },
  { name: "long words with spaces", text: WORDS },
] as const;

/** The values each control is given, made once per text. */
function valuesFor(text: string) {
  return {
    options: [
      { value: "long", label: text },
      { value: "short", label: "Short" },
    ],
    items: [text, "Short"],
    both: ["long", "short"],
  };
}
const VALUES = new Map([TOKEN, CJK, WORDS].map((text) => [text, valuesFor(text)]));
const values = (text: string) => VALUES.get(text)!;

/** Every control with the same long text in every slot it has. */
function Fields({ text }: { text: string }) {
  const { options, items, both } = values(text);
  return (
    <div className="flex flex-col gap-4" data-testid="fields">
      <Field>
        <FieldLabel>{text}</FieldLabel>
        <Input defaultValue={text} />
        <FieldDescription>{text}</FieldDescription>
      </Field>
      <Field invalid>
        <FieldLabel>Placeholder</FieldLabel>
        <Input placeholder={text} />
        <FieldError match>{text}</FieldError>
      </Field>
      <Field>
        <FieldLabel>Textarea</FieldLabel>
        <Textarea defaultValue={text} />
      </Field>
      <Field>
        <FieldLabel>Input group</FieldLabel>
        <InputGroup>
          <InputGroupAddon.Text>{text}</InputGroupAddon.Text>
          <InputGroupInput defaultValue={text} />
        </InputGroup>
      </Field>
      <Field>
        <FieldLabel>Select</FieldLabel>
        <Select items={options} defaultValue="long" chrome="field">
          <SelectTrigger data-testid="select-trigger">
            <SelectValue data-testid="select-value" />
            <SelectIcon />
          </SelectTrigger>
          <SelectContent>
            <SelectList>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectList>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Combobox chips</FieldLabel>
        <Combobox<string, true> multiple items={items} defaultValue={items}>
          <ComboboxChips data-testid="combobox-chips">
            {items.map((chip) => (
              <ComboboxChip key={chip} data-testid="combobox-chip">
                <span>{chip}</span>
                <ComboboxChipRemove />
              </ComboboxChip>
            ))}
            <ComboboxInput />
          </ComboboxChips>
        </Combobox>
      </Field>
      <Field>
        <FieldLabel>Combobox</FieldLabel>
        <Combobox<string> items={items} defaultInputValue={text}>
          <ComboboxControl>
            <ComboboxInput />
          </ComboboxControl>
        </Combobox>
      </Field>
      <Field>
        <FieldLabel>ComboboxSelect</FieldLabel>
        <ComboboxSelect options={options} defaultValue="long" clearable />
      </Field>
      <Field>
        <FieldLabel>ComboboxSelect, several</FieldLabel>
        <ComboboxSelect options={options} multiple defaultValue={both} clearable />
      </Field>
      <Field>
        <FieldItem>
          <Checkbox />
          <div>
            <FieldLabel>{text}</FieldLabel>
            <FieldDescription>{text}</FieldDescription>
          </div>
        </FieldItem>
      </Field>
      <Field>
        <RadioGroup defaultValue="a">
          <FieldItem>
            <RadioGroupItem value="a" />
            <FieldLabel>{text}</FieldLabel>
          </FieldItem>
        </RadioGroup>
      </Field>
      <Field>
        <FieldItem>
          <FieldLabel className="flex-1">{text}</FieldLabel>
          <Switch />
        </FieldItem>
      </Field>
    </div>
  );
}

const SURFACES: Record<string, (children: ReactNode) => ReactNode> = {
  page: (children) => (
    <main className="p-4" data-testid="surface">
      {children}
    </main>
  ),
  dialog: (children) => (
    <Dialog open>
      <DialogContent data-testid="surface">
        <DialogHeader>
          <DialogTitle>Edit</DialogTitle>
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
      </DialogContent>
    </Dialog>
  ),
  drawer: (children) => (
    <Drawer open>
      <DrawerContent data-testid="surface">
        <DrawerHeader>Edit</DrawerHeader>
        <DrawerBody>{children}</DrawerBody>
      </DrawerContent>
    </Drawer>
  ),
};

function describe(element: Element) {
  const slot = element.getAttribute("data-slot") ?? element.getAttribute("data-testid");
  const cls = typeof element.className === "string" ? element.className.split(" ")[0] : "";
  return `${element.tagName.toLowerCase()}${slot ? `[${slot}]` : ""}${cls ? `.${cls}` : ""}`;
}

const HIT_AREAS = [
  "[data-slot=checkbox]::after",
  "[data-slot=radio-group-item]::after",
  "[data-slot=switch]::after",
]
  .join(",")
  .concat("{display:none}");

/** Things that can't spill: text scrolls inside a text field, a hidden form input has no box. */
function measured(element: Element) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) return false;
  if (element instanceof SVGElement) return false;
  return element.getClientRects().length > 0;
}

/**
 * Every part that sticks out of the screen, every box whose content is wider
 * than the box (spilling, or scrolling sideways), and every value cut off
 * with an ellipsis that offers its whole text nowhere.
 */
function offenders(root: Element) {
  const width = document.documentElement.clientWidth;
  const found: string[] = [];
  // A checkbox's, a radio's and a switch's 44px hit area is an invisible
  // ::after reaching 12px past the control, inside the field's own padding.
  const hitAreas = document.head.appendChild(document.createElement("style"));
  hitAreas.textContent = HIT_AREAS;
  for (const element of [root, ...root.querySelectorAll("*")]) {
    if (!measured(element)) continue;
    const rect = element.getBoundingClientRect();
    if (rect.right > width + 0.5 || rect.left < -0.5) {
      found.push(`${describe(element)} spans ${Math.round(rect.left)}..${Math.round(rect.right)}`);
      continue;
    }
    const style = getComputedStyle(element);
    if (element.scrollWidth <= element.clientWidth + 1) continue;
    if (style.textOverflow === "ellipsis" && style.overflowX !== "visible") {
      const named = element.closest("[title]")?.getAttribute("title")?.length ?? 0;
      if (named < (element.textContent ?? "").trim().length) {
        found.push(`${describe(element)} truncates without its full value`);
      }
      continue;
    }
    if (style.webkitLineClamp !== "none" && style.overflowX !== "visible") continue;
    found.push(
      `${describe(element)} content ${element.scrollWidth}px > box ${element.clientWidth}px (overflow-x ${style.overflowX})`,
    );
  }
  for (const element of root.querySelectorAll("*")) {
    const style = getComputedStyle(element);
    const clamped =
      style.webkitLineClamp !== "none" && element.scrollHeight > element.clientHeight + 1;
    const named = element.closest("[title]")?.getAttribute("title") ?? "";
    if (clamped && named.length < (element.textContent ?? "").trim().length) {
      found.push(`${describe(element)} is clamped without its full value`);
    }
  }
  hitAreas.remove();
  return found;
}

/** A popup, its edges at least 8px from the screen's, nothing in it spilling. */
function popupOffenders(popup: Element) {
  const width = document.documentElement.clientWidth;
  const rect = popup.getBoundingClientRect();
  const found = offenders(popup);
  if (rect.left < 7.5 || rect.right > width - 7.5) {
    found.push(`popup spans ${Math.round(rect.left)}..${Math.round(rect.right)} of ${width}`);
  }
  return found;
}

for (const { width, touch } of VIEWPORTS) {
  for (const { name, text } of CASES) {
    for (const [surface, wrap] of Object.entries(SURFACES)) {
      it(`keeps every field inside a ${surface} at ${width}px with ${name}`, async () => {
        await viewport(width, touch);
        render(<ThemeProvider mode="light">{wrap(<Fields text={text} />)}</ThemeProvider>);
        await settled();
        expect(offenders(await screen.findByTestId("surface")).join("\n")).toBe("");
        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
      });
    }

    it(`keeps an open Select list inside the screen at ${width}px with ${name}`, async () => {
      await viewport(width, touch);
      const { options } = values(text);
      render(
        <ThemeProvider mode="light">
          <main className="p-4">
            <Select items={options} defaultValue="long" defaultOpen chrome="field">
              <SelectTrigger>
                <SelectValue />
                <SelectIcon />
              </SelectTrigger>
              <SelectContent data-testid="popup">
                <SelectList>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <SelectItemText>{option.label}</SelectItemText>
                      <SelectItemIndicator />
                    </SelectItem>
                  ))}
                </SelectList>
              </SelectContent>
            </Select>
          </main>
        </ThemeProvider>,
      );
      const popup = await screen.findByTestId("popup");
      await settled();
      expect(popupOffenders(popup).join("\n")).toBe("");
    });

    it(`keeps an open Combobox list inside the screen at ${width}px with ${name}`, async () => {
      await viewport(width, touch);
      render(
        <ThemeProvider mode="light">
          <main className="p-4">
            <Combobox<string> items={values(text).items} defaultOpen>
              <ComboboxControl>
                <ComboboxInput aria-label="Pick" />
              </ComboboxControl>
              <ComboboxContent data-testid="popup">
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </main>
        </ThemeProvider>,
      );
      const popup = await screen.findByTestId("popup");
      await settled();
      expect(popupOffenders(popup).join("\n")).toBe("");
    });

    it(`keeps an open ComboboxSelect list inside the screen at ${width}px with ${name}`, async () => {
      await viewport(width, touch);
      render(
        <ThemeProvider mode="light">
          <main className="p-4">
            <ComboboxSelect options={values(text).options} defaultOpen />
          </main>
        </ThemeProvider>,
      );
      await waitFor(() =>
        expect(document.querySelector(".r-combobox-select__popup")).not.toBeNull(),
      );
      await settled();
      expect(popupOffenders(document.querySelector(".r-combobox-select__popup")!).join("\n")).toBe(
        "",
      );
    });
  }
}

it("names a cut-off value with its whole text, and a value that fits with nothing more", async () => {
  await viewport(320, true);
  const { options } = values(TOKEN);
  function Picker({ value }: { value: string }) {
    return (
      <Select items={options} defaultValue={value} chrome="field">
        <SelectTrigger data-testid={value}>
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
      </Select>
    );
  }
  render(
    <ThemeProvider mode="light">
      <main className="p-4">
        <Picker value="long" />
        <Picker value="short" />
      </main>
    </ThemeProvider>,
  );
  await settled();
  const value = (id: string) => screen.getByTestId(id).querySelector("[data-slot=select-value]")!;
  await waitFor(() => expect(value("long").getAttribute("title")).toBe(TOKEN));
  expect(value("short").hasAttribute("title")).toBe(false);
});
