import { readFileSync } from "node:fs";
import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, expect, it, test } from "vite-plus/test";
import plugin, { recommendedRules } from "./index";
import { hasNativeScrollClass, nativeScrollAxis, preferScrollArea } from "./prefer-scroll-area";

RuleTester.describe = describe;
RuleTester.it = it;

const error = { messageId: "preferScrollArea" };
// A string whose native-scrolling classes are all on the x axis.
const sideways = { messageId: "preferScrollAreaHorizontal" };
const already = { messageId: "scrollAreaAlreadyScrolls" };

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
    // A list, an object and a style object that nothing uses as a class or a style.
    'const list = ["p-2", "overflow-auto"].join(" "); <div title={list} />;',
    'const cls = { body: "overflow-auto" }; <div title={cls.body} />;',
    'const s = { overflow: "auto" }; <div data-style={s} />;',
    'const s = { overflow: "hidden" }; <div style={s} />;',
    // A call's argument outside a class attribute, and a prop whose name only ends like one.
    '<div title={wrap("overflow-y-auto")} />',
    '<div subclass="overflow-auto" />',
    // Arbitrary values that don't scroll.
    '<div className="overflow-[hidden] overflow-y-[clip] [overflow:visible] overflow-[autos]" />',
    // A ScrollArea without an overflow class needs no comment, whatever else it carries.
    '<ScrollArea orientation="horizontal" className="max-h-64" contentClassName="grid gap-2 p-4" />',
    '<PanelScrollViewport className="min-h-0 flex-1 overflow-x-hidden" />',
    // The escape comment covers a string in a list, an object member and a style const.
    'const list = [\n  "p-2",\n  // raft-ui: native-scroll a one-line strip\n  "overflow-x-auto",\n].join(" ");\n<div className={list} />;',
    'const cls = {\n  // raft-ui: native-scroll a <pre> holds phrasing content only\n  pre: "overflow-x-auto",\n};\n<pre className={cls.pre} />;',
    'const s = {\n  // raft-ui: native-scroll a <pre> holds phrasing content only\n  overflowX: "auto",\n};\n<pre style={s} />;',
    '<div\n  // raft-ui: native-scroll measured by its own virtualizer\n  {...guard("overflow-y-auto")}\n/>',
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
      errors: [error, sideways, error, error, error],
    },
    { code: '<div className={"overflow-x-auto"} />', errors: [sideways] },
    { code: "<div className={`grid ${gap} overflow-scroll`} />", errors: [error] },
    {
      name: "through a conditional, a logical and an array",
      code: '<div className={[open ? "overflow-y-auto" : "hidden", wide && "overflow-x-auto"]} />',
      errors: [error, sideways],
    },
    { code: 'cn("p-2", open && "overflow-y-auto");', errors: [error] },
    { code: 'clsx({ "overflow-auto": open });', errors: [error] },
    { code: 'twMerge("overflow-scroll", "p-2");', errors: [error] },
    {
      name: "a tv() recipe's base and variants",
      code: 'tv({ base: ["flex", "overflow-y-auto"], variants: { wide: { true: "overflow-x-auto" } } });',
      errors: [error, sideways],
    },
    {
      name: "inline style",
      code: '<div style={{ overflow: "auto", overflowX: open ? "scroll" : "hidden", "overflowY": `auto` }} />',
      errors: [error, sideways, error],
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
        { ...sideways, line: 4 },
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
        { ...sideways, line: 4 },
        { ...sideways, line: 5 },
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
      errors: [error, error, sideways],
    },
    {
      name: "a const passed as a shorthand className property",
      code: 'const className = "overflow-y-auto";\ncontent({ className });',
      errors: [{ ...error, line: 1 }],
    },
    {
      name: "a class list joined into a const",
      code: [
        'const panel = ["min-h-0 flex-1", "overflow-y-auto"].join(" ");',
        "<div className={panel} />;",
        'const strip = ["flex", open && "overflow-x-auto"].filter(Boolean).join(" ");',
        "cn(strip);",
      ].join("\n"),
      errors: [
        { ...error, line: 1 },
        { ...sideways, line: 3 },
      ],
    },
    {
      name: "a const built with a template literal or +",
      code: [
        "const a = `grid ${gap} overflow-y-auto`;",
        'const b = "p-2 " + "overflow-x-auto";',
        "<div className={a} />;",
        "<div className={b} />;",
      ].join("\n"),
      errors: [
        { ...error, line: 1 },
        { ...sideways, line: 2 },
      ],
    },
    {
      name: "a const built from another const, at any depth",
      code: [
        'const base = "min-h-0 overflow-y-auto";',
        "const padded = `p-2 ${base}`;",
        'const framed = ["border", padded].join(" ");',
        "<div className={framed} />;",
      ].join("\n"),
      errors: [{ ...error, line: 1 }],
    },
    {
      name: "an object member and a variant map of the same file",
      code: [
        'const cls = { head: "p-2", body: "min-h-0 overflow-y-auto" };',
        'const VARIANTS = { wide: "overflow-x-auto", narrow: "w-40" } as const;',
        'const nested = { list: { base: "overflow-auto" } };',
        "<div className={cls.body} />;",
        "<div className={VARIANTS[kind]} />;",
        "cn(nested.list.base);",
      ].join("\n"),
      errors: [
        { ...error, line: 1 },
        { ...sideways, line: 2 },
        { ...error, line: 3 },
      ],
    },
    {
      name: "an argument of any call in a class attribute or a JSX spread",
      code: [
        '<div {...guardProps("my-2 overflow-x-auto")} />;',
        '<div className={wrap("overflow-y-auto")} />;',
        '<div className={(state) => (state.open ? "overflow-auto" : undefined)} />;',
        '<div {...props({ className: fit("overflow-y-scroll") })} />;',
      ].join("\n"),
      errors: [sideways, error, error, error],
    },
    {
      name: "a const passed through any call in a class attribute or a JSX spread",
      code: [
        'const log = "overflow-y-auto";',
        'const strip = "overflow-x-auto";',
        "<div className={wrap(log)} />;",
        "<div {...guardProps(strip)} />;",
      ].join("\n"),
      errors: [
        { ...error, line: 1 },
        { ...sideways, line: 2 },
      ],
    },
    {
      name: "a *Class prop and a classNames prop",
      code: [
        '<Popup positionClass="overflow-y-auto" />;',
        '<Popup classNames={{ body: "overflow-auto" }} />;',
        'popup({ bodyClass: "overflow-x-auto" });',
      ].join("\n"),
      errors: [error, error, sideways],
    },
    {
      name: "a style object in a const of the same file",
      code: [
        'const s = { overflow: "auto" };',
        'const styles = { pre: { overflowX: "auto" }, row: { overflow: "hidden" } } as const;',
        'const merged = { ...base, overflowY: "scroll" };',
        "<div style={s} />;",
        "<pre style={styles.pre} />;",
        "<div style={{ ...merged, height }} />;",
      ].join("\n"),
      errors: [
        { ...error, line: 1 },
        { ...sideways, line: 2 },
        { ...error, line: 3 },
      ],
    },
    {
      name: "a style object built from another const, and a conditional inline style",
      code: [
        'const base = { overflow: "auto" };',
        "const tall = { ...base, height: 320 };",
        "<div style={tall} />;",
        '<div style={open ? { overflowY: "overlay" } : undefined} />;',
      ].join("\n"),
      errors: [
        { ...error, line: 1 },
        { ...error, line: 4 },
      ],
    },
    {
      name: "arbitrary values",
      code: [
        '<div className="overflow-[auto]" />;',
        '<div className="md:overflow-y-[scroll]" />;',
        '<div className="overflow-x-[auto]" />;',
        '<div className="[overflow:auto]" />;',
        '<div className="[overflow-y:scroll]" />;',
        '<div className="[overflow:overlay]" />;',
        '<div className="overflow-[overlay]!" />;',
      ].join("\n"),
      errors: [error, error, sideways, error, error, error, error],
    },
    {
      name: "both axes in one string is not sideways only",
      code: '<div className="overflow-x-auto overflow-y-auto" />;\n<div className="overflow-x-auto overflow-y-hidden" />;',
      errors: [error, sideways],
    },
    {
      name: "a ScrollArea that carries an overflow class itself",
      code: [
        '<ScrollArea className="max-h-64 overflow-y-auto" />;',
        '<PanelScrollViewport className={cn("flex-1", "overflow-auto")} />;',
        '<Raft.ScrollArea style={{ overflowX: "auto" }} />;',
        'const area = "overflow-y-auto";',
        "<ScrollArea className={area} />;",
        // Its content is another element: a second scroller inside the area.
        '<ScrollArea contentClassName="overflow-x-auto" />;',
        // A const also used on a plain element keeps the message that says what to write.
        'const shared = "overflow-y-auto";',
        "<ScrollArea className={shared} />;",
        "<div className={shared} />;",
      ].join("\n"),
      errors: [
        { ...already, line: 1 },
        { ...already, line: 2 },
        { ...already, line: 3 },
        { ...already, line: 4 },
        { ...sideways, line: 6 },
        { ...error, line: 7 },
      ],
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
  expect(hasNativeScrollClass("overflow-[auto] p-2")).toBe(true);
  expect(hasNativeScrollClass("[overflow:overlay]")).toBe(true);
  expect(hasNativeScrollClass("overflow-[hidden] [overflow-x:clip]")).toBe(false);
});

test("a string that scrolls on the x axis only is sideways", () => {
  expect(nativeScrollAxis("w-full overflow-x-auto")).toBe("inline");
  expect(nativeScrollAxis("[overflow-x:scroll] overflow-y-hidden")).toBe("inline");
  expect(nativeScrollAxis("overflow-x-auto md:overflow-y-auto")).toBe("block");
  expect(nativeScrollAxis("overflow-auto")).toBe("block");
  expect(nativeScrollAxis("overflow-hidden")).toBeUndefined();
});

test("each message says what to write, where the opt-out goes and where the docs are", () => {
  const { messages } = preferScrollArea.meta;
  expect(messages.preferScrollArea).toBe(
    'Use ScrollArea from @botiverse/raft-ui for a scrolling region: <ScrollArea className="…sizing…" contentClassName="…layout, gap, padding…">…</ScrollArea> (inside a Panel: PanelScrollViewport). Sizing classes (max-h-*, flex-1, min-h-0) stay on the area; grid/flex/gap/padding go on contentClassName. Only a region that must scroll natively (see the allowed cases in the docs) takes "// raft-ui: native-scroll <reason>" on the line above. Docs: https://raft-design.botiverse.build/components/scroll-area.md',
  );
  expect(messages.preferScrollAreaHorizontal).toContain('<ScrollArea orientation="horizontal" ');
  expect(messages.scrollAreaAlreadyScrolls).toMatch(
    /^ScrollArea already scrolls: remove the overflow class/,
  );
  for (const message of Object.values(messages)) {
    expect(message).toContain('"// raft-ui: native-scroll <reason>" on the line above.');
    expect(message).toMatch(
      /Docs: https:\/\/raft-design\.botiverse\.build\/components\/scroll-area\.md$/,
    );
  }
});

test("recommended.json lists every rule of the plugin", () => {
  const json = JSON.parse(readFileSync(new URL("./recommended.json", import.meta.url), "utf8"));
  // A rule the apps can't pass yet is off until they have, then an error (index.ts). None is now.
  const offFirst = new Set<string>([]);
  const everyRule = Object.fromEntries(
    Object.keys(plugin.rules).map((name) => [
      `${plugin.meta.name}/${name}`,
      offFirst.has(name) ? "off" : "error",
    ]),
  );
  // `plugins: []` keeps the app's own built-in plugins: an extended config
  // without `plugins` counts as Oxlint's defaults and turns unicorn back on in
  // an app that left it out (Kirby, slock, Oxlint 1.85 to 1.91).
  expect(json).toEqual({ plugins: [], jsPlugins: ["@botiverse/raft-ui/lint"], rules: everyRule });
  expect(recommendedRules).toEqual(everyRule);
  expect(plugin.configs.recommended?.rules).toEqual(everyRule);
});
