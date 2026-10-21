import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

/**
 * A field the browser filled in keeps the field's own surface and ink
 * (design/foundations/states.md#autofill). The browser's fill is !important,
 * so styles.css delays the transition into it instead. Asserted on the source:
 * no test can make a browser autofill a field.
 */

const STYLES = readFileSync(
  fileURLToPath(new URL("./styles.css", import.meta.url)),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

function ruleFor(selector: string): string {
  const at = STYLES.indexOf(selector);
  expect(at, `${selector} has a rule`).toBeGreaterThanOrEqual(0);
  return STYLES.slice(STYLES.indexOf("{", at) + 1, STYLES.indexOf("}", at));
}

test("every autofilled field holds off the browser's fill and keeps its ink", () => {
  for (const element of ["input", "textarea", "select"]) {
    const body = ruleFor(`${element}:-webkit-autofill`);
    expect(body).toMatch(/-webkit-text-fill-color:\s*var\(--foreground\)/);
    expect(body).toMatch(/background-color 0s \d{6,}s/);
    // The fields animate their focus ring on box-shadow; the rule replaces
    // their transition, so it has to keep that one.
    expect(body).toMatch(/box-shadow 90ms /);
  }
});
