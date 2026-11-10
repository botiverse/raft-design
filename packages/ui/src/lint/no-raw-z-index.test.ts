import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, expect, it, test } from "vite-plus/test";
import { hasRawZIndexClass, noRawZIndex } from "./no-raw-z-index";

RuleTester.describe = describe;
RuleTester.it = it;

const error = { messageId: "noRawZIndex" };

new RuleTester({
  languageOptions: { sourceType: "module", parserOptions: { lang: "tsx" } },
}).run("no-raw-z-index", noRawZIndex as never, {
  valid: [
    '<div className="relative z-raised max-md:z-chrome before:z-below z-auto" />',
    'cn("isolate", open && "z-cover");',
    // Not a z-index class: other utilities that end in a number, and not a class.
    '<div className="size-10 translate-z-10 gap-z-1 fuzz-10" />',
    '<span title="z-10" data-layer="z-[60]" />',
    'const label = t("z-10");',
    'const classes = "z-10";',
    // A named layer as a style, and a zIndex the rule can't see into.
    '<div style={{ zIndex: "var(--z-index-raised)" }} />',
    "<div style={{ zIndex: layer }} />",
    "<DragLift zIndex={DRAG_LIFT_Z_INDEX} />",
    'el.style.zIndex = "auto";',
    "const s = { zIndex: open ? undefined : layer };",
    // The escape comment with a reason.
    '<div\n  // raft-ui: z-index the third-party widget pins itself at 9999\n  className="z-[10000]"\n/>',
    "const s = {\n  // raft-ui: z-index computed from the grid row\n  zIndex: 3,\n};",
    'cn("p-2", "z-10"); // raft-ui: z-index measured overlay',
  ],
  invalid: [
    { code: '<div className="relative z-10" />', errors: [error] },
    { code: '<div class="-z-1" />', errors: [error] },
    { code: '<Popover contentClassName="z-[70]" />', errors: [error] },
    {
      name: "variant prefixes, important, negative, arbitrary values and properties",
      code: [
        '<div className="max-md:z-30" />;',
        '<div className="before:-z-10" />;',
        '<div className="!z-50" />;',
        '<div className="z-50!" />;',
        '<div className="z-[calc(80-var(--i))]" />;',
        '<div className="z-(--my-z)" />;',
        '<div className="[z-index:5]" />;',
      ].join("\n"),
      errors: [error, error, error, error, error, error, error],
    },
    {
      name: "a tv() recipe, a conditional and a const used as a class",
      code: [
        'tv({ base: ["absolute", "z-20"], variants: { open: { true: "z-40" } } });',
        '<div className={open ? "z-10" : "z-auto"} />;',
        'const layer = "fixed z-50";',
        "<div className={layer} />;",
      ].join("\n"),
      errors: [error, error, error, { ...error, line: 3 }],
    },
    {
      name: "a numeric zIndex in a style object, a const, a prop and an assignment",
      code: [
        "<div style={{ zIndex: 10 }} />;",
        'const style = { zIndex: isDragging ? 20 : "5" };',
        "const back = { zIndex: -1 };",
        "<DismissBackdrop zIndex={55} />;",
        'el.style.zIndex = "1000";',
        'el.style["zIndex"] = 2;',
      ].join("\n"),
      errors: [error, error, error, error, error, error, error],
    },
    {
      name: "an escape comment without a reason, or two lines up, doesn't count",
      code: '<div\n  // raft-ui: z-index\n  className="z-10"\n/>;\n// raft-ui: z-index a reason\n\n<div className="z-20" />;',
      errors: [error, error],
    },
  ],
});

test("the class matcher finds raw z-index classes only", () => {
  expect(hasRawZIndexClass("relative md:z-10")).toBe(true);
  expect(hasRawZIndexClass("-z-1")).toBe(true);
  expect(hasRawZIndexClass("z-[60]")).toBe(true);
  expect(hasRawZIndexClass("z-raised z-popup z-auto max-md:z-chrome")).toBe(false);
  expect(hasRawZIndexClass("size-10 translate-z-10")).toBe(false);
});
