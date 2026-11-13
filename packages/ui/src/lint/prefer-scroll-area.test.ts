import { readFileSync } from "node:fs";
import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, expect, it, test } from "vite-plus/test";
import plugin, { recommendedRules } from "./index";
import {
  hasNativeScrollClass,
  nativeScrollAxis,
  nativeScrollStyleAxis,
  preferScrollArea,
} from "./prefer-scroll-area";

RuleTester.describe = describe;
RuleTester.it = it;

// By the direction the hit scrolls in: `overflow-y-*`, `overflow-x-*`, and `overflow-*` or the two together.
const error = { messageId: "preferScrollArea" };
const sideways = { messageId: "preferScrollAreaHorizontal" };
const both = { messageId: "preferScrollAreaBoth" };
// By the element the hit is on.
const already = { messageId: "scrollAreaAlreadyScrolls" };
const textarea = { messageId: "preferScrollAreaTextarea" };
const native = { messageId: "nativeScrollElement" };
const container = { messageId: "preferScrollAreaContainer" };

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
    // In a JSX spread: under a key that isn't a class name, in a function, in nested JSX, or bare.
    '<div {...props({ title: "overflow-auto" })} />',
    '<div {...{ title: "overflow-auto" }} />',
    '<div {...{ title: guard("overflow-auto") }} />',
    '<div {...guard(() => "overflow-auto")} />',
    '<div {...guard({ onClick: () => log("overflow-auto") })} />',
    '<div {...guard(<span title="overflow-auto">overflow-auto</span>)} />',
    // What a call that isn't a class helper takes inside a class helper is its own,
    // in a class attribute as outside one.
    '<div className={cn("p-2", t("overflow-auto"))} />',
    '<div className={wrap(t("overflow-auto"))} />',
    '<div className={(state) => cn("p-2", t("overflow-auto"))} />',
    // A callback inside a class attribute that isn't the class.
    '<div className={cn(items.map(() => "overflow-auto"))} />',
    // An object of the same file: a member that isn't read as a class.
    'const cls = { body: "p-2", hint: "overflow-x-auto" }; <div className={cls.body} />;',
    'const styles = { pre: { overflow: "hidden" }, log: { overflow: "auto" } }; <pre style={styles.pre} />;',
    // A prop whose name reads as a yes or no, or doesn't end in a capitalized Class.
    '<Row isClass="overflow-auto" hasErrorClass="overflow-auto" firstclass="overflow-auto" />',
    "<Row errorClass={true} positionClass={flag} />",
    // A parameter of the same name is not the const.
    'const s = { overflow: "auto" }; function Row({ s }) { return <div style={s} />; }',
    'const log = "overflow-y-auto"; const Row = (log) => <div className={log} />;',
    // A default of a parameter that isn't a class.
    'function Log({ title = "overflow-auto" }) {}',
    // Styles that don't scroll, with two values.
    '<div style={{ overflow: "hidden clip" }} className="overflow-[hidden_clip] [overflow:clip_visible]" />',
    // A comment at the end of the string's own line.
    'cn(\n  "p-2",\n  "overflow-x-auto", // raft-ui: native-scroll a one-line strip\n);',
    // The escape comment covers a const's string too.
    '// raft-ui: native-scroll a one-line strip\nconst strip = "overflow-x-auto";\n<div className={strip} />;',
  ],
  invalid: [
    { code: '<div className="min-h-0 overflow-auto" />', errors: [both] },
    { code: '<div class="overflow-scroll" />', errors: [both] },
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
      errors: [error, sideways, both, both, error],
    },
    { code: '<div className={"overflow-x-auto"} />', errors: [sideways] },
    { code: "<div className={`grid ${gap} overflow-scroll`} />", errors: [both] },
    {
      name: "through a conditional, a logical and an array",
      code: '<div className={[open ? "overflow-y-auto" : "hidden", wide && "overflow-x-auto"]} />',
      errors: [error, sideways],
    },
    { code: 'cn("p-2", open && "overflow-y-auto");', errors: [error] },
    { code: 'clsx({ "overflow-auto": open });', errors: [both] },
    { code: 'twMerge("overflow-scroll", "p-2");', errors: [both] },
    {
      name: "a tv() recipe's base and variants",
      code: 'tv({ base: ["flex", "overflow-y-auto"], variants: { wide: { true: "overflow-x-auto" } } });',
      errors: [error, sideways],
    },
    {
      name: "inline style",
      code: '<div style={{ overflow: "auto", overflowX: open ? "scroll" : "hidden", "overflowY": `auto` }} />',
      errors: [both, sideways, error],
    },
    {
      name: "an escape comment without a reason doesn't count",
      code: '<div\n  // raft-ui: native-scroll\n  className="overflow-auto"\n/>',
      errors: [both],
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
        "<div className={log} />;",
        "cn(strip, open && wide);",
        'const strip = open ? "overflow-x-auto" : "hidden";',
        'const wide = cn("p-2", "overflow-x-scroll");',
      ].join("\n"),
      errors: [
        { ...both, line: 1 },
        { ...sideways, line: 4 },
        { ...sideways, line: 5 },
      ],
    },
    {
      name: "a const in a template literal class and a recipe slot",
      code: 'const gap = "overflow-auto";\nconst x = "overflow-y-auto";\n<div className={`grid ${gap}`} />;\ntv({ base: x });',
      errors: [
        { ...both, line: 1 },
        { ...error, line: 2 },
      ],
    },
    {
      name: "a className property: a recipe slot's option",
      code: [
        'content({ className: "overflow-y-auto" });',
        'list({ className: [open && "overflow-auto"], "contentClassName": "overflow-x-auto" });',
      ].join("\n"),
      errors: [error, both, sideways],
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
      name: "an object of the same file: only the members read as a class",
      code: [
        'const cls = { head: "p-2", body: "min-h-0 overflow-y-auto", hint: "overflow-x-auto" };',
        'const nested = { list: { base: "overflow-auto" }, aside: { base: "overflow-y-scroll" } };',
        'const quoted = { "wide-row": "overflow-x-auto", narrow: "overflow-y-auto" };',
        "<div className={cls.body} />;",
        "cn(nested.list.base);",
        '<div className={quoted["wide-row"]} />;',
      ].join("\n"),
      errors: [
        { ...error, line: 1, column: 33 },
        { ...both, line: 2 },
        { ...sideways, line: 3 },
      ],
    },
    {
      name: "an object read by a computed key, or used whole: every member",
      code: [
        'const VARIANTS = { wide: "overflow-x-auto", tall: "overflow-y-auto" } as const;',
        'const slots = { body: "overflow-auto", foot: "overflow-y-scroll" };',
        "<div className={VARIANTS[kind]} />;",
        "<List classNames={slots} />;",
      ].join("\n"),
      errors: [
        { ...sideways, line: 1 },
        { ...error, line: 1 },
        { ...container, line: 2 },
        { ...container, line: 2 },
      ],
    },
    {
      name: "a member built from another const: only when that member is read",
      code: [
        'const scroller = "overflow-y-auto";',
        'const strip = "overflow-x-auto";',
        "const cls = { body: scroller, row: strip };",
        "<div className={cls.body} />;",
      ].join("\n"),
      errors: [{ ...error, line: 1 }],
    },
    {
      name: "one call that isn't a class helper, in a class attribute, a class property or a spread",
      code: [
        '<div {...guardProps("my-2 overflow-x-auto")} />;',
        '<div className={wrap("overflow-y-auto")} />;',
        '<div {...props({ className: fit("overflow-y-scroll") })} />;',
        '<div {...guard(open ? "overflow-auto" : "hidden")} />;',
        'content({ className: fit("overflow-x-scroll") });',
      ].join("\n"),
      errors: [sideways, error, error, both, sideways],
    },
    {
      name: "a function that returns the class, in a class attribute",
      code: [
        '<div className={(state) => (state.open ? "overflow-auto" : undefined)} />;',
        '<div className={(state) => {\n  if (state.open) return "overflow-y-auto";\n  return "hidden";\n}} />;',
        '<div className={function (state) { return cn("p-2", "overflow-x-auto"); }} />;',
      ].join("\n"),
      errors: [both, { ...error, line: 3 }, sideways],
    },
    {
      name: "a default of a parameter with a class name",
      code: [
        'function Log({ className = "max-h-64 overflow-y-auto", title = "overflow-auto" }) {}',
        'const Strip = ({ className: cls = "overflow-x-auto" }) => null;',
        'function box(contentClassName = open ? "overflow-auto" : "") {}',
        'const base = "overflow-y-scroll";',
        "function Pane({ bodyClass = base }) {}",
      ].join("\n"),
      errors: [
        { ...error, line: 1 },
        { ...sideways, line: 2 },
        { ...both, line: 3 },
        { ...error, line: 4 },
      ],
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
      name: "a *Class prop and property",
      code: [
        '<Popup positionClass="overflow-y-auto" />;',
        'popup({ bodyClass: "overflow-x-auto" });',
        '<Popup listClass={cn("overflow-auto")} />;',
      ].join("\n"),
      errors: [error, sideways, both],
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
        { ...both, line: 1 },
        { ...native, line: 2 },
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
        { ...both, line: 1 },
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
      errors: [both, error, sideways, both, error, both, both],
    },
    {
      name: "x and y classes in one string scroll both ways; a hidden axis doesn't count",
      code: [
        '<div className="overflow-x-auto overflow-y-auto" />;',
        '<div className="overflow-x-auto overflow-y-hidden" />;',
        '<div className="overflow-x-hidden overflow-y-scroll" />;',
        '<div style={{ overflowX: "auto", overflowY: "auto" }} />;',
      ].join("\n"),
      errors: [both, sideways, error, sideways, error],
    },
    {
      name: "two values: x then y, in a style, an arbitrary value and an arbitrary property",
      code: [
        '<div style={{ overflow: "hidden auto" }} />;',
        '<div style={{ overflow: "scroll hidden" }} />;',
        '<div style={{ overflow: "auto scroll" }} />;',
        '<div className="overflow-[hidden_auto]" />;',
        '<div className="[overflow:auto_hidden]" />;',
        '<div className="[overflow:hidden_overlay]" />;',
        '<div className="[overflow-y:auto!important]" />;',
      ].join("\n"),
      errors: [error, sideways, both, error, sideways, error, error],
    },
    {
      name: "a style key in a JSX spread, a call's argument and a plain object",
      code: [
        '<div {...{ style: { overflowY: "auto" } }} />;',
        '<div {...props({ style: { overflow: "auto" } })} />;',
        'const rest = { style: { overflowX: "scroll" } };',
      ].join("\n"),
      errors: [error, both, sideways],
    },
    {
      name: "a <textarea> gets ScrollAreaTextarea",
      code: [
        '<textarea className="max-h-40 overflow-y-auto" />;',
        '<Textarea className={cn("p-2", "overflow-auto")} />;',
        '<textarea style={{ overflowY: "scroll" }} />;',
        'const field = "overflow-y-auto";',
        "<textarea className={field} />;",
      ].join("\n"),
      errors: [textarea, textarea, textarea, { ...textarea, line: 4 }],
    },
    {
      name: "an element a ScrollArea can't replace gets no replacement, only the comment",
      code: [
        '<pre className="overflow-x-auto" />;',
        '<html className="overflow-y-scroll" />;',
        '<body className={cn("overflow-auto")} />;',
        '<iframe style={{ overflow: "auto" }} />;',
        'const code = "p-4 overflow-x-auto";',
        "<pre className={code} />;",
      ].join("\n"),
      errors: [native, native, native, native, { ...native, line: 5 }],
    },
    {
      name: "a classNames object, whose classes go to another component's elements, gets useScrollAreaContainer",
      code: [
        '<Virtuoso classNames={{ scroller: "overflow-y-auto" }} />;',
        '<Picker listClassNames={{ list: cn("overflow-auto") }} />;',
        'picker({ classNames: { list: "overflow-x-auto" } });',
        'const scroller = "h-64 overflow-y-auto";',
        "<Virtuoso classNames={{ scroller }} />;",
      ].join("\n"),
      errors: [container, container, container, { ...container, line: 4 }],
    },
    {
      name: "a const used on elements of different kinds keeps the message by direction",
      code: [
        'const shared = "overflow-x-auto";',
        "<pre className={shared} />;",
        "<div className={shared} />;",
        'const fields = "overflow-auto";',
        "<textarea className={fields} />;",
        "<pre className={fields} />;",
      ].join("\n"),
      errors: [
        { ...sideways, line: 1 },
        { ...both, line: 4 },
      ],
    },
    {
      name: "a const is the one in scope, not a parameter of the same name",
      code: [
        'const s = { overflow: "auto" };',
        'const log = "overflow-y-auto";',
        "function Row({ s, log }) {\n  return <div style={s} className={log} />;\n}",
        "function Pane() {\n  return <div style={s} className={log} />;\n}",
        "function Other() {\n  const log = open;\n  return <div className={log} />;\n}",
      ].join("\n"),
      errors: [
        { ...both, line: 1 },
        { ...error, line: 2 },
      ],
    },
    {
      name: "a comment at the end of a line covers that line only, not the next",
      code: [
        "cn(",
        '  "p-2", // raft-ui: native-scroll a one-line strip',
        '  "overflow-y-auto",',
        ");",
        "<div>",
        "  <span /> {/* raft-ui: native-scroll a <pre> holds phrasing content only */}",
        '  <pre className="overflow-x-auto" />',
        "</div>;",
      ].join("\n"),
      errors: [
        { ...error, line: 3 },
        { ...native, line: 7 },
      ],
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
      errors: [both],
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

test("the direction a class string scrolls in", () => {
  expect(nativeScrollAxis("w-full overflow-x-auto")).toBe("horizontal");
  expect(nativeScrollAxis("[overflow-x:scroll] overflow-y-hidden")).toBe("horizontal");
  expect(nativeScrollAxis("min-h-0 overflow-y-auto")).toBe("vertical");
  expect(nativeScrollAxis("overflow-x-auto md:overflow-y-auto")).toBe("both");
  expect(nativeScrollAxis("overflow-auto")).toBe("both");
  expect(nativeScrollAxis("overflow-[hidden_auto]")).toBe("vertical");
  expect(nativeScrollAxis("[overflow:scroll_hidden]")).toBe("horizontal");
  expect(nativeScrollAxis("overflow-hidden")).toBeUndefined();
  expect(nativeScrollAxis("overflow-[hidden_clip]")).toBeUndefined();
});

test("the direction a style property scrolls in", () => {
  expect(nativeScrollStyleAxis("overflow", "auto")).toBe("both");
  expect(nativeScrollStyleAxis("overflow", "hidden auto")).toBe("vertical");
  expect(nativeScrollStyleAxis("overflow", " scroll  hidden ")).toBe("horizontal");
  expect(nativeScrollStyleAxis("overflowX", "overlay")).toBe("horizontal");
  expect(nativeScrollStyleAxis("overflowY", "scroll")).toBe("vertical");
  expect(nativeScrollStyleAxis("overflow", "hidden")).toBeUndefined();
  expect(nativeScrollStyleAxis("textOverflow", "auto")).toBeUndefined();
});

const DOCS = "Docs: https://raft-design.botiverse.build/components/scroll-area.md";
const OPT_OUT =
  'Only a region that must scroll natively (see the allowed cases in the docs) takes "// raft-ui: native-scroll <reason>" on the line above.';
const WHERE =
  "Sizing classes (max-h-*, flex-1, min-h-0) stay on the area; grid/flex/gap/padding go on contentClassName.";

test("each message says what to write for its direction and element", () => {
  expect(preferScrollArea.meta.messages).toEqual({
    preferScrollArea: `Use ScrollArea from @botiverse/raft-ui for a scrolling region: <ScrollArea className="…sizing…" contentClassName="…layout, gap, padding…">…</ScrollArea> (inside a Panel: PanelScrollViewport). ${WHERE} ${OPT_OUT} ${DOCS}`,
    preferScrollAreaHorizontal: `Use ScrollArea from @botiverse/raft-ui for a region that scrolls sideways: <ScrollArea orientation="horizontal" className="…sizing…" contentClassName="…layout, gap, padding…">…</ScrollArea>. ${WHERE} ${OPT_OUT} ${DOCS}`,
    preferScrollAreaBoth: `Use ScrollArea from @botiverse/raft-ui for a region that scrolls both ways: <ScrollArea orientation="both" className="…sizing…" contentClassName="…layout, gap, padding…">…</ScrollArea>. Leave orientation out (vertical, the default) only when nothing inside is wider than the area: a vertical area cuts off what is. ${WHERE} ${OPT_OUT} ${DOCS}`,
    preferScrollAreaTextarea: `Use ScrollAreaTextarea from @botiverse/raft-ui for a textarea that scrolls: <ScrollAreaTextarea wrapperClassName="…border, background, focus ring…" className="…padding…" />. A <textarea> can't hold ScrollArea's scrollbars, so ScrollAreaTextarea draws them over a frame around it. ${OPT_OUT} ${DOCS}`,
    preferScrollAreaContainer: `These classes go to an element another component renders, so a ScrollArea can't take its place. Bind that element: const { containerProps, guttersProps } = useScrollAreaContainer(); give it containerProps (ref, className, style) and render <ScrollAreaGutters {...guttersProps} /> as its first child, with no overflow class ("Your own container" in the docs). Where the component takes neither, it scrolls natively: say so in "// raft-ui: native-scroll <reason>" on the line above. ${DOCS}`,
    nativeScrollElement: `A ScrollArea can't take the place of this element (<pre>, <html>, <body>, <iframe>), so there is nothing to write instead. It may scroll natively only as one of the allowed cases in the docs (a <pre> of code is one, since it holds phrasing content only): say which in "// raft-ui: native-scroll <reason>" on the line above. ${DOCS}`,
    scrollAreaAlreadyScrolls: `ScrollArea already scrolls: remove the overflow class (or style) and set the direction with orientation="vertical" (the default), "horizontal" or "both". ${DOCS}`,
  });
});

test("a ScrollArea's own overflow has no exception to point to, and no replacement names another", () => {
  const { messages } = preferScrollArea.meta;
  expect(messages.scrollAreaAlreadyScrolls).not.toContain("native-scroll");
  for (const id of ["nativeScrollElement", "preferScrollAreaContainer"]) {
    expect(messages[id]).not.toContain("<ScrollArea ");
  }
  expect(messages.preferScrollAreaTextarea).not.toContain("<ScrollArea ");
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
