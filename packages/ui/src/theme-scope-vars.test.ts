import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

/**
 * A recipe that sets its own custom property from a colour takes the theme
 * token (`[--meter-value:var(--warning-strong)]`), never Tailwind's
 * `--color-*` alias (`var(--color-warning-strong)`). The aliases are declared
 * once on `:root` as `var(--warning-strong)`, so they are computed there, in
 * the page's theme: inside a nested `.dark` (the docs' dark previews, a dark
 * panel in a light page) they keep the light values. The theme tokens are
 * redeclared in every theme scope. Meter shipped dark-brown warning text on
 * the dark canvas this way.
 */
const SRC = fileURLToPath(new URL(".", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

const ALIAS_IN_CUSTOM_PROPERTY = /\[--[\w-]+:var\(--color-[\w-]+\)\]/g;

test("no recipe sets a custom property from a :root --color-* alias", () => {
  const found = sourceFiles(SRC).flatMap((path) =>
    [...readFileSync(path, "utf8").matchAll(ALIAS_IN_CUSTOM_PROPERTY)].map(
      (match) => `${relative(SRC, path)}: ${match[0]}`,
    ),
  );
  expect(found).toEqual([]);
});
