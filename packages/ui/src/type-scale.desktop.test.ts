// @vitest-environment node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { expect, test } from "vite-plus/test";

// The type scale has a phone value and a desktop value (Feishu's mobile and PC
// specs). The desktop one is set again from 768px in the token layer, so it
// only reaches components if the utilities read the variables rather than
// inlining the phone values. design/foundations/typography.md#type-scale.

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
const styles = readFileSync(join(sourceDirectory, "styles.css"), "utf8");
const foundation = readFileSync(join(sourceDirectory, "foundation.css"), "utf8");

const PHONE: Record<string, [string, string]> = {
  headline: ["17px", "22px"],
  body: ["16px", "24px"],
  subhead: ["15px", "20px"],
  callout: ["14px", "20px"],
  control: ["13px", "18px"],
  footnote: ["13px", "18px"],
  caption: ["12px", "16px"],
  "mono-meta": ["12px", "16px"],
  "mono-code": ["13px", "20px"],
};

const DESKTOP: Record<string, [string, string]> = {
  headline: ["16px", "24px"],
  body: ["14px", "22px"],
  subhead: ["14px", "22px"],
  callout: ["14px", "22px"],
  control: ["14px", "22px"],
  footnote: ["12px", "20px"],
  caption: ["12px", "20px"],
  "mono-meta": ["12px", "20px"],
  "mono-code": ["13px", "20px"],
};

/**
 * The body of the first block opened by `opener` that contains `inside`,
 * matched brace for brace.
 */
function block(css: string, opener: string, inside = "") {
  for (let start = css.indexOf(opener); start !== -1; start = css.indexOf(opener, start + 1)) {
    const open = css.indexOf("{", start);
    let depth = 0;
    for (let index = open; index < css.length; index++) {
      if (css[index] === "{") depth++;
      if (css[index] === "}" && --depth === 0) {
        const body = css.slice(open + 1, index);
        if (body.includes(inside)) return body;
        break;
      }
    }
  }
  return null;
}

function declared(css: string, name: string) {
  return css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim();
}

async function build(candidates: string[]) {
  const compiler = await compile(`${styles}\n@tailwind utilities;`, {
    loadStylesheet: async (id) => {
      const path = join(sourceDirectory, id);
      return { content: readFileSync(path, "utf8"), path, base: dirname(path) };
    },
  });
  return compiler.build(candidates);
}

const without = (css: string, part: string | null) => (part ? css.replace(part, "") : css);

test("the theme keeps the phone scale", async () => {
  const css = await build(Object.keys(PHONE).map((name) => `text-${name}`));
  const desktop = block(css, "@media (width >= 48rem)", "--text-body:");
  const phone = without(css, desktop);
  for (const [name, [size, line]] of Object.entries(PHONE)) {
    expect(declared(phone, `--text-${name}`), name).toBe(size);
    expect(declared(phone, `--text-${name}--line-height`), name).toBe(line);
  }
});

test("from 768px the scale is Feishu's PC scale", async () => {
  const css = await build(Object.keys(DESKTOP).map((name) => `text-${name}`));
  const desktop = block(css, "@media (width >= 48rem)", "--text-body:");
  expect(desktop).not.toBeNull();
  for (const [name, [size, line]] of Object.entries(DESKTOP)) {
    expect(declared(desktop!, `--text-${name}`), name).toBe(size);
    expect(declared(desktop!, `--text-${name}--line-height`), name).toBe(line);
  }
});

test("the type utilities read the variables, so the desktop values reach them", async () => {
  const css = await build(["text-body", "text-control"]);
  const utility = block(css, ".text-body {");
  expect(utility).toContain("font-size: var(--text-body)");
  expect(utility).toContain("var(--text-body--line-height)");
  expect(block(css, ".text-control {")).toContain("font-size: var(--text-control)");
});

test("field and card-title text take the desktop size from 768px, on light islands too", () => {
  const desktop = block(foundation, "@media (width >= 48rem)");
  expect(desktop).not.toBeNull();
  expect(desktop).toMatch(/:where\(:root\),\s*\.light\s*\{/);
  expect(declared(desktop!, "--field-font-size")).toBe("14px");
  expect(declared(desktop!, "--field-line-height")).toBe("22px");
  expect(declared(desktop!, "--card-title-font-size")).toBe("14px");
  expect(declared(desktop!, "--card-title-line-height")).toBe("22px");
  const phone = without(foundation, desktop);
  // iOS zooms into a field whose text is under 16px.
  expect(declared(phone, "--field-font-size")).toBe("16px");
  expect(declared(phone, "--field-line-height")).toBe("24px");
  expect(declared(phone, "--card-title-font-size")).toBe("16px");
});
