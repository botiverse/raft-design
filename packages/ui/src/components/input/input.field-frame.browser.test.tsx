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

// A field's frame rests on a 1px `line-field` border (the ink of
// `line-strong`), on a phone and on a desktop, in light and dark. 1.5px ink
// stays for what has to stand out: buttons, stickers, selected rows. Measured
// in a real browser, zoomed 2x: at one device pixel per CSS pixel Chromium
// snaps a 1.5px border to 1px, so the two would read the same.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

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
    it(`${mode}, ${width}px: a field rests on a 1px ink border; a button keeps 1.5px`, async () => {
      await viewport(width);
      render(<Fields mode={mode} />);
      const ink = getComputedStyle(screen.getByTestId("ink")).borderTopColor;
      for (const field of FIELDS) {
        const style = getComputedStyle(screen.getByTestId(field));
        expect(style.borderTopWidth, field).toBe("1px");
        expect(style.borderTopColor, field).toBe(ink);
      }
      expect(getComputedStyle(screen.getByTestId("button")).borderTopWidth).toBe("1.5px");
    });
  }
}
