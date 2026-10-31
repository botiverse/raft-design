// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { expect, test } from "vite-plus/test";

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
const foundationPath = join(sourceDirectory, "foundation.css");
const foundation = readFileSync(foundationPath, "utf8");
const styles = readFileSync(join(sourceDirectory, "styles.css"), "utf8");

test("the standalone foundation parses as native CSS with self-contained mode values", () => {
  const style = document.createElement("style");
  style.textContent = foundation;
  document.head.append(style);
  try {
    const declarations: CSSStyleDeclaration[] = [];
    const selectors: string[] = [];
    function inspect(rules: CSSRuleList) {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSMediaRule) {
          inspect(rule.cssRules);
        } else {
          expect(rule).toBeInstanceOf(CSSStyleRule);
          const scoped = rule as CSSStyleRule;
          selectors.push(scoped.selectorText);
          declarations.push(scoped.style);
        }
      }
    }
    inspect(style.sheet!.cssRules);
    // Light on the root (and `.light` islands), `.dark`, and the pre-hydration
    // system fallback; no theme-family attribute is left anywhere.
    const normalized = selectors.map((selector) => selector.replace(/\s+/g, " "));
    expect(normalized).toContain(":where(:root), .light");
    expect(normalized).toContain(".dark");
    expect(normalized).toContain(":root:not(.light):not(.dark)");
    expect(selectors.some((selector) => selector.includes("data-theme"))).toBe(false);

    const names = new Set(declarations.flatMap((declaration) => Array.from(declaration)));
    for (const declaration of declarations) {
      for (const name of Array.from(declaration)) {
        expect(name.startsWith("--") || name === "color-scheme", name).toBe(true);
        for (const reference of declaration
          .getPropertyValue(name)
          .matchAll(/var\((--[\w-]+)\s*([,)])/g)) {
          expect(names.has(reference[1]) || reference[2] === ",", `${name}: ${reference[1]}`).toBe(
            true,
          );
        }
      }
    }
    expect(foundation.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(
      /@(theme|utility|custom-variant|import)\b/,
    );
  } finally {
    style.remove();
  }
});

test("the Tailwind entry includes the shared foundation and still generates semantic utilities", async () => {
  const compiler = await compile(`${styles}\n@tailwind utilities;`, {
    loadStylesheet: async (id) => {
      if (id === "./foundation.css") {
        return {
          content: foundation,
          path: foundationPath,
          base: sourceDirectory,
        };
      }
      if (id === "./components/combobox-select/combobox-select.css") {
        const comboboxSelectPath = join(
          sourceDirectory,
          "components/combobox-select/combobox-select.css",
        );
        return {
          content: readFileSync(comboboxSelectPath, "utf8"),
          path: comboboxSelectPath,
          base: sourceDirectory,
        };
      }
      if (id === "./components/timeline/timeline.css") {
        const timelinePath = join(sourceDirectory, "components/timeline/timeline.css");
        return {
          content: readFileSync(timelinePath, "utf8"),
          path: timelinePath,
          base: sourceDirectory,
        };
      }
      if (id === "./components/steps/steps.css") {
        const stepsPath = join(sourceDirectory, "components/steps/steps.css");
        return {
          content: readFileSync(stepsPath, "utf8"),
          path: stepsPath,
          base: sourceDirectory,
        };
      }
      if (id === "./components/steps/otter-indicator.css") {
        const otterIndicatorPath = join(sourceDirectory, "components/steps/otter-indicator.css");
        return {
          content: readFileSync(otterIndicatorPath, "utf8"),
          path: otterIndicatorPath,
          base: sourceDirectory,
        };
      }
      if (id === "./components/virtual-list/styles/virtual-list.css") {
        const virtualListPath = join(
          sourceDirectory,
          "components/virtual-list/styles/virtual-list.css",
        );
        return {
          content: readFileSync(virtualListPath, "utf8"),
          path: virtualListPath,
          base: sourceDirectory,
        };
      }
      throw new Error(`Unexpected stylesheet id: ${id}`);
    },
  });
  const css = compiler.build([
    "bg-layer-canvas",
    "text-foreground",
    "shadow-float",
    "bg-you",
    "bg-selected",
    "border-selected",
  ]);
  expect(css).toContain("background-color: var(--layer-canvas)");
  expect(css).toContain("background-color: var(--you)");
  expect(css).toContain("background-color: var(--selected)");
  expect(css).toContain("border-color: var(--selected)");
  expect(css).toContain("color: var(--foreground)");
  expect(css).toContain("var(--elevation-float)");
  expect(css).toMatch(/^\.dark \{$/m);
  expect(css).not.toContain("data-theme");
  expect(css).toContain("--palette-yellow-400:");
  expect(css).not.toContain('@import "./foundation.css"');
});
