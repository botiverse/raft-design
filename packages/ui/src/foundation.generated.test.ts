import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expect, test } from "vite-plus/test";

// foundation.css and tokens.resolved.json are generated from tokens.json.
// Editing either by hand, or tokens.json without regenerating, fails here: run
// `vp run @botiverse/raft-ui#build:tokens`.
const script = join(dirname(fileURLToPath(import.meta.url)), "../scripts/build-tokens.mjs");
const read = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");

type Resolved = {
  $type: string;
  $value: { touch: number; fine: number; desktop: number; wideTouch: number };
};
type BuildTokens = {
  renderFoundation: (tokens: unknown) => string;
  resolveTokens: (tokens: unknown) => Record<string, Record<string, Resolved>>;
};
// A path held in a variable, so the type check doesn't look for the script's types.
const scriptUrl = pathToFileURL(script).href;
const loadScript = async () => (await import(scriptUrl)) as BuildTokens;

const dimension = (value: number) => ({ value, unit: "px" });

test("foundation.css and tokens.resolved.json match tokens.json", () => {
  expect(() =>
    execFileSync(process.execPath, [script, "--check"], { stdio: "pipe" }),
  ).not.toThrow();
});

test("a fine value is declared under (pointer: fine), before the desktop block", async () => {
  const { renderFoundation } = await loadScript();
  const css = renderFoundation({
    size: {
      $type: "dimension",
      both: {
        $value: dimension(56),
        $extensions: { "build.botiverse.raft": { fine: dimension(0), desktop: dimension(8) } },
      },
    },
  });
  const fine = css.indexOf("@media (pointer: fine) {");
  const desktop = css.indexOf("@media (width >= 48rem) and (pointer: fine) {");
  expect(fine).toBeGreaterThan(-1);
  expect(desktop).toBeGreaterThan(fine);
  expect(css.slice(fine, desktop)).toContain("--size-both: 0px;");
  expect(css.slice(desktop)).toContain("--size-both: 8px;");
});

test("a wideTouch value is declared from 768px with a coarse pointer", async () => {
  const { renderFoundation } = await loadScript();
  const css = renderFoundation({
    size: {
      $type: "dimension",
      head: {
        $value: dimension(56),
        $extensions: {
          "build.botiverse.raft": { desktop: dimension(44), wideTouch: dimension(48) },
        },
      },
    },
  });
  const desktop = css.indexOf("@media (width >= 48rem) and (pointer: fine) {");
  const wideTouch = css.indexOf("@media (width >= 48rem) and (pointer: coarse) {");
  expect(desktop).toBeGreaterThan(-1);
  expect(wideTouch).toBeGreaterThan(-1);
  expect(css.slice(wideTouch)).toContain("--size-head: 48px;");
  expect(css.slice(wideTouch)).not.toContain("--size-head: 44px;");
});

test("tokens.resolved.json resolves each context: desktop, else fine, else the touch value", () => {
  const resolved = JSON.parse(read("./tokens.resolved.json")) as Record<
    string,
    Record<string, Resolved>
  >;
  // calc() over var()s, and a desktop value that is another token.
  expect(resolved["list-toolbar"]!.height!.$value).toEqual({
    touch: 49,
    fine: 49,
    desktop: 44,
    wideTouch: 49,
  });
  // A fine value, which a desktop takes too when the token has no desktop value.
  expect(resolved["list-row"]!["min-height"]!.$value).toEqual({
    touch: 56,
    fine: 0,
    desktop: 0,
    wideTouch: 56,
  });
  // rem, and a chain of var()s resolved in the desktop context.
  expect(resolved.option!.height!.$value).toEqual({
    touch: 36,
    fine: 36,
    desktop: 34,
    wideTouch: 36,
  });
  // A wide touch screen's head: the 36px bar button with the header air (artin, #wg-mobile-sync:#265).
  expect(resolved.header!.height!.$value).toEqual({
    touch: 56,
    fine: 56,
    desktop: 44,
    wideTouch: 48,
  });
  expect(resolved["bar-button"]!.size!.$value).toEqual({
    touch: 44,
    fine: 44,
    desktop: 28,
    wideTouch: 36,
  });
  // Its icon: the control's icon, 20px in the 36px button (Raft 1.29, MobileShortHead).
  expect(resolved["bar-icon"]!.size!.$value).toEqual({
    touch: 22,
    fine: 22,
    desktop: 18,
    wideTouch: 20,
  });
  expect(resolved.control!.height!.$type).toBe("dimension");
  // Colors aren't numbers.
  expect(resolved.layer).toBeUndefined();
});

test("an expression the generator can't evaluate fails the build", async () => {
  const { resolveTokens } = await loadScript();
  const tokens = (value: string) => ({
    size: { $type: "dimension", a: { $value: dimension(4) }, b: { $value: value } },
  });
  expect(resolveTokens(tokens("calc(2 * var(--size-a))")).size!.b!.$value.touch).toBe(8);
  expect(() => resolveTokens(tokens("min(var(--size-a), 2px)"))).toThrow(/size\.b/);
  expect(() => resolveTokens(tokens("var(--size-missing)"))).toThrow(/--size-missing/);
  expect(() => resolveTokens(tokens("calc(var(--size-a) + 1)"))).toThrow(/adds px/);
  expect(() => resolveTokens(tokens("var(--size-b)"))).toThrow(/refers to itself/);
});
