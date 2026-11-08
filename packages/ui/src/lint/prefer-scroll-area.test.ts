import { readFileSync } from "node:fs";
import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, expect, it, test } from "vite-plus/test";
import plugin, { recommendedRules } from "./index";
import { hasNativeScrollClass, preferScrollArea } from "./prefer-scroll-area";

RuleTester.describe = describe;
RuleTester.it = it;

const error = { messageId: "preferScrollArea" };

new RuleTester({
  languageOptions: { sourceType: "module", parserOptions: { lang: "tsx" } },
}).run("prefer-scroll-area", preferScrollArea as never, {
  valid: [
    '<div className="overflow-hidden overflow-x-clip overflow-y-visible" />',
    '<ScrollArea className="min-h-0 flex-1" />',
    // Not a class: another attribute, a translation, a plain variable.
    '<span title="overflow-auto" data-mode="overflow-scroll" />',
    'const label = t("overflow-auto");',
    'const classes = "overflow-auto";',
    'cn("p-2", format("overflow-auto"));',
    // Names that only start or end like a scrolling class.
    '<div className="overflow-auto-ish text-overflow-auto-x" />',
    // Inline styles that don't scroll, and a style object the rule can't see into.
    '<div style={{ overflow: "hidden", overflowX: "clip" }} />',
    "<div style={style} />",
    '<div style={{ textOverflow: "auto" }} />',
    // The escape comment with a reason, on the line above or at the end of the line.
    '<div>\n  {/* raft-ui: native-scroll a <pre> holds phrasing content only */}\n  <pre className="overflow-x-auto" />\n</div>',
    '<div\n  // raft-ui: native-scroll Base UI owns this list\n  className="min-h-0 overflow-y-auto"\n/>',
    'cn(\n  "p-2",\n  // raft-ui: native-scroll a one-line strip with no scrollbar\n  "overflow-x-auto",\n);',
    'const strip = tv({ base: "overflow-x-auto" }); // raft-ui: native-scroll one-line strip',
    '<div\n  // raft-ui: native-scroll measured by its own virtualizer\n  style={{ overflowY: "auto" }}\n/>',
  ],
  invalid: [
    { code: '<div className="min-h-0 overflow-auto" />', errors: [error] },
    { code: '<div class="overflow-scroll" />', errors: [error] },
    { code: '<Dialog contentClassName="overflow-y-auto" />', errors: [error] },
    {
      name: "variant prefixes, important and arbitrary properties",
      code: [
        '<div className="md:overflow-y-auto" />;',
        '<div className="data-open:hover:overflow-x-scroll" />;',
        '<div className="!overflow-auto" />;',
        '<div className="overflow-auto!" />;',
        '<div className="[overflow-y:auto]" />;',
      ].join("\n"),
      errors: [error, error, error, error, error],
    },
    { code: '<div className={"overflow-x-auto"} />', errors: [error] },
    { code: "<div className={`grid ${gap} overflow-scroll`} />", errors: [error] },
    {
      name: "through a conditional, a logical and an array",
      code: '<div className={[open ? "overflow-y-auto" : "hidden", wide && "overflow-x-auto"]} />',
      errors: [error, error],
    },
    { code: 'cn("p-2", open && "overflow-y-auto");', errors: [error] },
    { code: 'clsx({ "overflow-auto": open });', errors: [error] },
    { code: 'twMerge("overflow-scroll", "p-2");', errors: [error] },
    {
      name: "a tv() recipe's base and variants",
      code: 'tv({ base: ["flex", "overflow-y-auto"], variants: { wide: { true: "overflow-x-auto" } } });',
      errors: [error, error],
    },
    {
      name: "inline style",
      code: '<div style={{ overflow: "auto", overflowX: open ? "scroll" : "hidden", "overflowY": `auto` }} />',
      errors: [error, error, error],
    },
    {
      name: "an escape comment without a reason doesn't count",
      code: '<div\n  // raft-ui: native-scroll\n  className="overflow-auto"\n/>',
      errors: [error],
    },
    {
      name: "an escape comment two lines up doesn't count",
      code: '// raft-ui: native-scroll a reason\n\n<div className="overflow-auto" />',
      errors: [error],
    },
  ],
});

test("the class matcher finds scrolling classes only", () => {
  expect(hasNativeScrollClass("min-h-0 md:overflow-y-auto")).toBe(true);
  expect(hasNativeScrollClass("[overflow:scroll]")).toBe(true);
  expect(hasNativeScrollClass("overflow-y-hidden overflow-x-clip overflow-visible")).toBe(false);
  expect(hasNativeScrollClass("scroll-auto overflow-hidden")).toBe(false);
});

test("recommended.json enables every rule of the plugin", () => {
  const json = JSON.parse(readFileSync(new URL("./recommended.json", import.meta.url), "utf8"));
  const everyRule = Object.fromEntries(
    Object.keys(plugin.rules).map((name) => [`${plugin.meta.name}/${name}`, "error"]),
  );
  expect(json).toEqual({ jsPlugins: ["@botiverse/raft-ui/lint"], rules: everyRule });
  expect(recommendedRules).toEqual(everyRule);
  expect(plugin.configs.recommended?.rules).toEqual(everyRule);
});
