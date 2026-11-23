import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, expect, it, test } from "vite-plus/test";
import { mutedTextClasses, noMutedText } from "./no-muted-text";

RuleTester.describe = describe;
RuleTester.it = it;

const error = { messageId: "noMutedText" };

new RuleTester({
  languageOptions: { sourceType: "module", parserOptions: { lang: "tsx" } },
}).run("no-muted-text", noMutedText as never, {
  valid: [
    '<p className="text-foreground text-callout">Saved</p>',
    // Other tiers and other properties of the same tokens.
    '<p className="text-foreground-disabled bg-foreground-muted border-foreground-hint" />',
    '<p className="placeholder:text-foreground-hint">x</p>',
    // State-only variants: nothing is grey at rest.
    '<button className="text-foreground hover:text-foreground-muted focus-visible:text-foreground-hint">x</button>',
    '<a className="aria-disabled:text-foreground-muted data-[state=off]:text-foreground-muted group-hover:text-foreground-hint">x</a>',
    // A self-closing element: an icon holds no text.
    '<ChevronRight className="size-4 text-foreground-muted" />',
    '<Icon className={cn("size-4", quiet && "text-foreground-hint")} />',
    // The escape comment with a reason, above or at the end of the line.
    '// raft-ui: muted the shortcut beside a menu label, a tooltip-style hint\nconst KBD = "text-foreground-hint";',
    'const KBD = "text-foreground-muted"; // raft-ui: muted a legend under a chart',
    '<div>\n  {/* raft-ui: muted the placeholder of a custom editor */}\n  <p className="text-foreground-hint">Write something</p>\n</div>',
    // Not a colour value, and not a colour property.
    'const s = { fill: "var(--foreground-muted)" };',
    'const name = "foreground-muted";',
    // Body ink at full strength, or made see-through by opacity, which isn't a colour.
    '<p className="text-foreground text-(--foreground) text-[var(--foreground)] [color:var(--foreground)]">a</p>',
    '<p className="text-foreground/100 text-foreground/[1]">a</p>',
    '<p className="text-foreground opacity-60">a</p>',
    '<p style={{ color: "var(--foreground)", opacity: 0.6 }}>a</p>',
    // Other properties of body ink with an alpha.
    '<p className="bg-foreground/10 border-foreground/40 ring-foreground/20">a</p>',
    // Body ink with an alpha behind a state variant, on an icon, or escaped.
    '<button className="text-foreground hover:text-foreground/60 group-hover:text-foreground/20">x</button>',
    '<ChevronRight className="size-4 text-foreground/50" />',
    '// raft-ui: muted the separator dot between two badges\nconst SEP = "text-foreground/45";',
    // A colour function without body ink in it, or a mix outside a colour property.
    '<p className="text-[color-mix(in_oklch,var(--accent)_60%,transparent)]">a</p>',
    'const s = { background: "color-mix(in oklch, var(--foreground) 10%, transparent)" };',
    'const s = { color: "rgb(from var(--foreground) r g b)" };',
  ],
  invalid: [
    { code: '<p className="text-foreground-muted">Your changes are saved.</p>', errors: [error] },
    {
      code: '<span className="text-callout text-foreground-hint">3 members</span>',
      errors: [error],
    },
    {
      name: "frame and HUD tones, opacity, important, responsive and dark variants",
      code: [
        '<p className="text-foreground-on-frame-muted">a</p>;',
        '<p className="text-foreground-on-hud-muted">a</p>;',
        '<p className="text-foreground-muted/80">a</p>;',
        '<p className="!text-foreground-hint">a</p>;',
        '<p className="md:text-foreground-muted">a</p>;',
        '<p className="dark:text-foreground-hint">a</p>;',
      ].join("\n"),
      errors: [error, error, error, error, error, error],
    },
    {
      name: "the tokens as arbitrary values and an arbitrary property",
      code: [
        '<p className="text-(--foreground-muted)">a</p>;',
        '<p className="text-[var(--foreground-hint)]">a</p>;',
        '<p className="text-[color:var(--color-foreground-muted)]">a</p>;',
        '<p className="[color:var(--foreground-hint)]">a</p>;',
      ].join("\n"),
      errors: [error, error, error, error],
    },
    {
      name: "body ink with an opacity modifier",
      code: [
        '<p className="text-foreground/60">a</p>;',
        '<p className="text-foreground/[0.6]">a</p>;',
        '<p className="text-foreground/(--alpha)">a</p>;',
        '<p className="text-foreground-on-frame/70 md:text-foreground-on-hud/50">a</p>;',
        '<p className="!text-foreground/45">a</p>;',
      ].join("\n"),
      errors: [error, error, error, error, error],
    },
    {
      name: "body ink as an arbitrary value or property with an alpha",
      code: [
        '<p className="text-(--foreground)/50">a</p>;',
        '<p className="text-(color:--color-foreground)/50">a</p>;',
        '<p className="text-[var(--foreground)]/50">a</p>;',
        '<p className="text-[color:var(--foreground)]/50">a</p>;',
        '<p className="[color:var(--foreground)]/50">a</p>;',
        '<p className="text-[color-mix(in_oklch,var(--foreground)_60%,transparent)]">a</p>;',
        '<p className="[color:color-mix(in_srgb,var(--color-foreground),transparent_40%)]">a</p>;',
        '<p className="[color:rgb(from_var(--foreground)_r_g_b_/_0.6)]">a</p>;',
      ].join("\n"),
      errors: [error, error, error, error, error, error, error, error],
    },
    {
      name: "an inline colour of body ink with an alpha",
      code: [
        '<p style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>a</p>;',
        '<p style={{ color: "rgb(from var(--foreground) r g b / 0.6)" }}>a</p>;',
        'const s = { color: quiet ? "oklch(from var(--color-foreground) l c h / 50%)" : undefined };',
      ].join("\n"),
      errors: [error, error, error],
    },
    {
      name: "an inline colour",
      code: [
        '<p style={{ color: "var(--foreground-muted)" }}>a</p>;',
        'const s = { color: quiet ? "var(--color-foreground-hint)" : undefined };',
      ].join("\n"),
      errors: [error, error],
    },
    {
      name: "any string: a constant exported for another file, a tv() recipe, a template",
      code: [
        'export const DETAIL_HELP_CLASS_NAME = "text-footnote text-foreground-muted";',
        'tv({ base: ["text-sm", "text-foreground-hint"] });',
        "const c = `mt-1 ${size} text-foreground-muted`;",
      ].join("\n"),
      errors: [error, error, error],
    },
    {
      name: "a class inside an element that holds text, through cn()",
      code: '<p className={cn("text-sm", quiet && "text-foreground-muted")}>a</p>',
      errors: [error],
    },
    {
      name: "an escape comment without a reason, or two lines up, doesn't count",
      code: '// raft-ui: muted\nconst a = "text-foreground-muted";\n// raft-ui: muted a reason\n\nconst b = "text-foreground-hint";',
      errors: [error, error],
    },
  ],
});

test("the class matcher finds muted text colours only, outside state variants", () => {
  expect(mutedTextClasses("text-sm md:text-foreground-muted hover:text-foreground-hint")).toEqual([
    "md:text-foreground-muted",
  ]);
  expect(mutedTextClasses("text-foreground text-foreground-disabled")).toEqual([]);
  expect(
    mutedTextClasses("opacity-60 text-foreground/60 hover:text-foreground/40 bg-foreground/10"),
  ).toEqual(["text-foreground/60"]);
  expect(mutedTextClasses("[&_svg]:text-foreground-hint text-(--foreground-hint)")).toEqual([
    "[&_svg]:text-foreground-hint",
    "text-(--foreground-hint)",
  ]);
});
