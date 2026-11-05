import "./input.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import { Combobox, ComboboxControl, ComboboxInput } from "../combobox/combobox";
import { Composer, ComposerInput } from "../composer/composer";
import { InputGroup, InputGroupInput } from "../input-group/input-group";
import { Select, SelectTrigger, SelectValue } from "../select/select";
import { Textarea } from "../textarea/textarea";
import { Input } from "./input";

// A field's frame is a 1.5px `line-field` border, the ink and width of a
// button's `line-strong`, on a phone and on a desktop, in light and dark: no
// control is drawn thinner than the others (task #137). Measured in a real
// browser, zoomed 2x: at one device pixel per CSS pixel Chromium snaps a 1.5px
// border to 1px, so a 1px field would read the same as a button.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

// The provider puts its mode on <html> in an effect, after the fields are
// first styled, and a Select trigger's border has `transition-colors`: put
// on the root from the light tests before it, the dark mode reached the
// trigger as a 150ms fade from the light ink, read mid-way (alone, the dark
// tests failed on the select). The mode is on the root before the render,
// so the effect changes nothing and every border is at rest when read.
function rootMode(mode: (typeof MODES)[number]) {
  const root = document.documentElement;
  root.classList.toggle("light", mode === "light");
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
}

const MODES = ["light", "dark"] as const;
const MODELS = [{ value: "opus", label: "Opus" }];
const PEOPLE = ["Martin", "Wug"];

function Fields({ mode }: { mode: (typeof MODES)[number] }) {
  return (
    <ThemeProvider mode={mode}>
      <div style={{ zoom: 2 }}>
        <span data-testid="ink" className="border border-line-strong" />
        <Input data-testid="input" aria-label="Channel name" />
        <Textarea data-testid="textarea" aria-label="Description" />
        <InputGroup data-testid="input-group">
          <InputGroupInput aria-label="Search" />
        </InputGroup>
        <Select items={MODELS} defaultValue="opus">
          <SelectTrigger data-testid="select" aria-label="Model">
            <SelectValue />
          </SelectTrigger>
        </Select>
        <Combobox items={PEOPLE}>
          <ComboboxControl data-testid="combobox">
            <ComboboxInput aria-label="Person" />
          </ComboboxControl>
        </Combobox>
        <Composer data-testid="composer">
          <ComposerInput aria-label="Message #launch-week" />
        </Composer>
        <Button data-testid="button">Assign</Button>
      </div>
    </ThemeProvider>
  );
}

const FIELDS = ["input", "textarea", "input-group", "select", "combobox", "composer"];

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

for (const mode of MODES) {
  for (const width of [390, 1280]) {
    it(`${mode}, ${width}px: a field has the 1.5px ink border of a button`, async () => {
      await viewport(width);
      rootMode(mode);
      render(<Fields mode={mode} />);
      const ink = getComputedStyle(screen.getByTestId("ink")).borderTopColor;
      for (const field of FIELDS) {
        const style = getComputedStyle(screen.getByTestId(field));
        expect(style.borderTopWidth, field).toBe("1.5px");
        expect(style.borderTopColor, field).toBe(ink);
      }
      expect(getComputedStyle(screen.getByTestId("button")).borderTopWidth).toBe("1.5px");
    });
  }
}
