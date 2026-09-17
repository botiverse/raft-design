// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { expect, test } from "vitest";

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
const foundationPath = join(sourceDirectory, "foundation.css");
const foundation = readFileSync(foundationPath, "utf8");
const styles = readFileSync(join(sourceDirectory, "styles.css"), "utf8");

test("the standalone foundation parses as native CSS with self-contained theme values", () => {
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
    expect(selectors).toContain('[data-theme="elegant"]');
    expect(selectors).toContain('[data-theme="elegant"].dark');
    expect(selectors).toContain('[data-theme="elegant"]:not(.light):not(.dark)');
    expect(selectors.some((selector) => selector.includes('[data-theme="brutal"]'))).toBe(true);

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
      if (id === "./components/float-button/float-button.css") {
        const floatButtonPath = join(sourceDirectory, "components/float-button/float-button.css");
        return {
          content: readFileSync(floatButtonPath, "utf8"),
          path: floatButtonPath,
          base: sourceDirectory,
        };
      }
      if (id === "./components/collapsible/collapsible.css") {
        const collapsiblePath = join(sourceDirectory, "components/collapsible/collapsible.css");
        return {
          content: readFileSync(collapsiblePath, "utf8"),
          path: collapsiblePath,
          base: sourceDirectory,
        };
      }
      throw new Error(`Unexpected stylesheet id: ${id}`);
    },
  });
  const css = compiler.build(["bg-layer-panel", "text-foreground", "shadow-raft-md"]);
  expect(css).toContain("background-color: var(--layer-panel)");
  expect(css).toContain("color: var(--foreground)");
  expect(css).toContain("var(--theme-shadow-md)");
  expect(css).toContain('[data-theme="elegant"].dark');
  expect(css).toContain("--color-brutal-yellow-400:");
  expect(css).not.toContain('@import "./foundation.css"');
  expect(css).not.toContain('@import "./components/float-button/float-button.css"');
  expect(css).not.toContain('@import "./components/collapsible/collapsible.css"');
});
