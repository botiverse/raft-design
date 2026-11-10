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
    // A const that is never used as a class, a `let`, and an object key named className.
    'const hint = "overflow-auto"; <div title={hint} />;',
    'let log = "overflow-auto"; <div className={log} />;',
    'const box = "overflow-auto"; f({ className: other, box });',
    'const log = "overflow-auto"; <div className={styles.log} />;',
    // A property that isn't a class.
    'f({ label: "overflow-auto" });',
    // The escape comment covers a const's string too.
    '// raft-ui: native-scroll a one-line strip\nconst strip = "overflow-x-auto";\n<div className={strip} />;',
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
      name: "an escape comment above a multi-line call covers only the string on the next line",
      code: 'cn(\n  // raft-ui: native-scroll a one-line strip\n  "overflow-x-auto",\n  "overflow-y-auto",\n);',
      errors: [{ ...error, line: 4 }],
    },
    {
      name: "an escape comment above the call or its attribute doesn't cover the strings inside",
      code: [
        "// raft-ui: native-scroll a one-line strip",
        'cn(\n  "p-2",\n  "overflow-x-auto",\n);',
        "<div",
        "  // raft-ui: native-scroll a one-line strip",
        '  className={cn(\n    "p-2",\n    "overflow-y-auto",\n  )}',
        "/>;",
      ].join("\n"),
      errors: [
        { ...error, line: 4 },
        { ...error, line: 10 },
      ],
    },
    {
      name: "a const of the same file used as a class, declared before or after its use",
      code: [
        'const log = "max-h-64 overflow-auto";',
        "<pre className={log} />;",
        "cn(strip, open && wide);",
        'const strip = open ? "overflow-x-auto" : "hidden";',
        'const wide = cn("p-2", "overflow-x-scroll");',
      ].join("\n"),
      errors: [
        { ...error, line: 1 },
        { ...error, line: 4 },
        { ...error, line: 5 },
      ],
    },
    {
      name: "a const in a template literal class and a recipe slot",
      code: 'const gap = "overflow-auto";\nconst x = "overflow-y-auto";\n<div className={`grid ${gap}`} />;\ntv({ base: x });',
      errors: [
        { ...error, line: 1 },
        { ...error, line: 2 },
      ],
    },
    {
      name: "a className property: a recipe slot's option",
      code: [
        'content({ className: "overflow-y-auto" });',
        'list({ className: [open && "overflow-auto"], "contentClassName": "overflow-x-auto" });',
      ].join("\n"),
      errors: [error, error, error],
    },
    {
      name: "a const passed as a shorthand className property",
      code: 'const className = "overflow-y-auto";\ncontent({ className });',
      errors: [{ ...error, line: 1 }],
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
  // A new rule warns for one release before it is an error (index.ts).
  const warnFirst = new Set(["no-raw-z-index"]);
  const everyRule = Object.fromEntries(
    Object.keys(plugin.rules).map((name) => [
      `${plugin.meta.name}/${name}`,
      warnFirst.has(name) ? "warn" : "error",
    ]),
  );
  // `plugins: []` keeps the app's own built-in plugins: an extended config
  // without `plugins` counts as Oxlint's defaults and turns unicorn back on in
  // an app that left it out (Kirby, slock, Oxlint 1.85 to 1.91).
  expect(json).toEqual({ plugins: [], jsPlugins: ["@botiverse/raft-ui/lint"], rules: everyRule });
  expect(recommendedRules).toEqual(everyRule);
  expect(plugin.configs.recommended?.rules).toEqual(everyRule);
});
