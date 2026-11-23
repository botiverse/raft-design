#!/usr/bin/env node
// Generates src/foundation.css and src/tokens.resolved.json from
// src/tokens.json, the single source of the Raft Design System's color,
// elevation and metric tokens.
//
//   node scripts/build-tokens.mjs           write both files
//   node scripts/build-tokens.mjs --check   exit 1 if either file is stale
//
// tokens.json follows the Design Tokens Community Group format (2025.10). Its
// extension "build.botiverse.raft" carries what the format has no field for:
// `modes.dark` (the dark value), `fine` (the value with a mouse or a trackpad
// at any width), `desktop` (the value from 768px with a fine pointer, where the
// desktop layout begins; it wins over `fine`; the token's own value is the
// phone's and a touch screen's), `scope`
// ("root" for mode-independent values, "every-mode" for aliases declared again
// in each mode scope) and `css` (a value kept as a CSS expression, such as
// color-mix() or a layered shadow).
//
// tokens.resolved.json is for readers that can't evaluate CSS, such as the iOS
// and Android apps: every numeric token (dimension, number, fontWeight,
// duration) as a plain number in each context, `touch`, `fine` and `desktop`,
// with its references, var() and calc() evaluated here. An expression this
// script can't evaluate fails the build.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXT = "build.botiverse.raft";
const packageDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tokensPath = path.join(packageDir, "src/tokens.json");
const foundationPath = path.join(packageDir, "src/foundation.css");
const resolvedPath = path.join(packageDir, "src/tokens.resolved.json");

/** `{group.name}` -> `--group-name`; `$root` names the group itself. */
function propertyName(tokenPath) {
  const parts = tokenPath.filter((part) => part !== "$root");
  if (parts[0] === "deprecated") return `--${parts.slice(1).join("-")}`;
  return `--${parts.join("-")}`;
}

function formatNumber(value) {
  return String(value);
}

function formatValue(value) {
  if (typeof value === "string") {
    const reference = value.match(/^\{([^{}]+)\}$/);
    if (reference) return `var(${propertyName(reference[1].split("."))})`;
    return value;
  }
  if (typeof value === "number") return formatNumber(value);
  if (Array.isArray(value)) return `cubic-bezier(${value.map(formatNumber).join(", ")})`;
  if (value && value.colorSpace === "oklch") {
    const components = value.components.map(formatNumber).join(" ");
    return value.alpha === undefined
      ? `oklch(${components})`
      : `oklch(${components} / ${formatNumber(value.alpha)})`;
  }
  if (value && "unit" in value) return `${formatNumber(value.value)}${value.unit}`;
  throw new Error(`Unsupported token value: ${JSON.stringify(value)}`);
}

/** Every token in document order, with its path. */
function* tokensOf(node, trail = []) {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$") && key !== "$root") continue;
    if (child && typeof child === "object" && "$value" in child) yield [[...trail, key], child];
    else if (child && typeof child === "object") yield* tokensOf(child, [...trail, key]);
  }
}

function comment(text, indent) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (line && `${line} ${word}`.length > 76) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  lines.push(line);
  return lines
    .map((text, index) => {
      const open = index === 0 ? "/* " : "   ";
      const close = index === lines.length - 1 ? " */" : "";
      return `${indent}${open}${text}${close}`;
    })
    .join("\n");
}

/** Matches the formatter: a declaration past 100 columns breaks after its colon. */
function fit(line, indent) {
  if (line.startsWith("/*") || `${indent}${line}`.length <= 100) {
    return line.startsWith("/*") ? line : `${indent}${line}`;
  }
  const colon = line.indexOf(": ");
  return `${indent}${line.slice(0, colon + 1)}\n${indent}  ${line.slice(colon + 2)}`;
}

export function renderFoundation(tokens) {
  const root = [];
  const light = [];
  const dark = [];
  const everyMode = [];
  const staticDeprecated = [];
  const fineRoot = [];
  const fineLight = [];
  const desktopRoot = [];
  const desktopLight = [];

  for (const [tokenPath, token] of tokensOf(tokens)) {
    const name = propertyName(tokenPath);
    const ext = token.$extensions?.[EXT] ?? {};
    const declaration = (value) => `${name}: ${formatValue(value)};`;
    const described = (list, indent) => {
      if (token.$description && !token.$deprecated) list.push(comment(token.$description, indent));
    };
    if (tokenPath[0] === "deprecated") {
      (ext.static ? staticDeprecated : everyMode).push({
        line: declaration(token.$value),
        deprecated: true,
      });
      continue;
    }
    if (ext.scope === "root") {
      root.push(declaration(token.$value));
      if (ext.fine !== undefined) fineRoot.push(declaration(ext.fine));
      if (ext.desktop !== undefined) desktopRoot.push(declaration(ext.desktop));
      continue;
    }
    if (ext.scope === "every-mode" && (ext.fine !== undefined || ext.desktop !== undefined)) {
      throw new Error(`${name}: an every-mode alias can't have a \`fine\` or \`desktop\` value`);
    }
    if (ext.scope === "every-mode") {
      everyMode.push({ line: declaration(token.$value), deprecated: false });
      continue;
    }
    described(light, "  ");
    light.push(fit(declaration(token.$value), "  "));
    if (ext.modes?.dark !== undefined) dark.push(declaration(ext.modes.dark));
    if (ext.fine !== undefined) fineLight.push(declaration(ext.fine));
    if (ext.desktop !== undefined) desktopLight.push(declaration(ext.desktop));
  }

  const block = (lines, indent) => lines.map((line) => fit(line, indent)).join("\n");
  const current = everyMode.filter((entry) => !entry.deprecated).map((entry) => entry.line);
  const deprecated = everyMode.filter((entry) => entry.deprecated).map((entry) => entry.line);

  return `${HEADER}
/* Raw brand ramps (the website palette) — variables only, no utility registration. Consumed by the
   Tailwind aliases in styles.css, the brand ramps, and state families below. Then the
   mode-independent values: the fade lengths (design/foundations/spacing.md), the dimmed
   opacity (design/foundations/states.md) and motion (design/foundations/motion.md). */
:where(:root) {
${block(root, "  ")}
}

/* Raft Design System, light: yellow frame -> cream sidebar -> white paper; ink
   lines say "control", seams split regions, hairlines sit inside content; every
   colour block is a sticker with an ink edge and ink type. Values are the
   system's tokens re-authored in oklch. A \`.light\` element is a light island
   inside a dark page (a preview, a portal from a light scope). */
:where(:root),
.light {
  color-scheme: light;

${light.join("\n")}
}

/* Raft Design System, dark: content stays lighter than the frame and sidebar
   (#0d0d0b); stickers keep their colours and ink type and gain a die-cut edge. */
.dark {
  color-scheme: dark;

${block(dark, "  ")}
}

/* Pre-hydration system fallback; explicit mode classes opt out. Generated from
   the same list as the explicit dark block above. */
@media (prefers-color-scheme: dark) {
  :root:not(.light):not(.dark) {
    color-scheme: dark;

${block(dark, "    ")}
  }
}

/* Aliases of tokens that change with the mode. A custom property resolves
   var() where it is declared, so each mode scope declares them again to
   resolve against its own values (a \`.dark\` island under a light root would
   otherwise inherit the light ones). */
:where(:root),
.light,
.dark {
${block(current, "  ")}
${renderDeprecated(deprecated)}}
${renderStaticDeprecated(staticDeprecated.map((entry) => entry.line))}${renderFine(fineRoot, fineLight)}${renderDesktop(desktopRoot, desktopLight)}`;
}

/* Former names (the \`deprecated\` group), declared only while there are any. */
function renderDeprecated(lines) {
  if (lines.length === 0) return "";
  return `
  /* Deprecated names. Run
     \`node node_modules/@botiverse/raft-ui/codemods/token-names.mjs <src>\` to move to the
     current names. */
${lines.map((line) => fit(line, "  ")).join("\n")}
`;
}

/* Former names of values that don't change with the mode (\`static: true\`). */
function renderStaticDeprecated(lines) {
  if (lines.length === 0) return "";
  return `
/* Deprecated names of values that don't change with the mode. */
:where(:root) {
${lines.map((line) => fit(line, "  ")).join("\n")}
}
`;
}

/* The rules inside a media query: mode-independent values on `:where(:root)`,
   the others on `:where(:root)` and `.light`, as outside it. */
function scoped(rootLines, lightLines) {
  const scope = (selector, lines) =>
    lines.length === 0 ? [] : [`  ${selector} {`, ...lines.map((line) => fit(line, "    ")), "  }"];
  return [
    ...scope(":where(:root)", rootLines),
    ...scope(":where(:root),\n  .light", lightLines),
  ].join("\n");
}

/* Fine-pointer values, declared again in the scope the phone value lives in,
   before the desktop block: the desktop query is a subset of this one with the
   same selectors, so a token's `desktop` wins from 768px by source order. */
function renderFine(rootLines, lightLines) {
  if (rootLines.length === 0 && lightLines.length === 0) return "";
  return `
/* A mouse or a trackpad at any width: the sizes that follow the input, not the
   width (design/foundations/tokens.md#component-tokens). A touch screen at any
   width keeps the values above; a desktop then takes its own values below. The
   same query as Tailwind's \`pointer-fine:\`. */
@media (pointer: fine) {
${scoped(rootLines, lightLines)}
}
`;
}

/* Desktop values, declared again in the scope the phone value lives in (a
   `.light` island declares its own), inside the one breakpoint. */
function renderDesktop(rootLines, lightLines) {
  if (rootLines.length === 0 && lightLines.length === 0) return "";
  return `
/* Desktop: from 768px (Tailwind's \`md\`, where the desktop layout begins)
   with a mouse or trackpad. The metrics that follow Feishu's PC specs. A
   phone, and a touch screen at any width, keep the values above. The same
   query as the desktop type in styles.css. */
@media (width >= 48rem) and (pointer: fine) {
${scoped(rootLines, lightLines)}
}
`;
}

/* ─── tokens.resolved.json ─────────────────────────────────────────────── */

/** The types resolved to a number, and the unit each one's number is in. */
const RESOLVED_UNITS = { dimension: "px", duration: "ms", number: null, fontWeight: null };
const CONTEXTS = ["touch", "fine", "desktop"];
/** What 1rem is: the root font size, which raft-ui never changes. */
const REM = 16;

/** The value a token takes in a context: touch < fine < desktop. */
function rawIn(token, context) {
  const ext = token.$extensions?.[EXT] ?? {};
  if (context === "desktop") return ext.desktop ?? ext.fine ?? token.$value;
  if (context === "fine") return ext.fine ?? token.$value;
  return token.$value;
}

function quantity(number, unit, where) {
  if (unit === "px" || unit === "ms") return { n: number, unit };
  if (unit === "rem") return { n: number * REM, unit: "px" };
  if (unit === "s") return { n: number * 1000, unit: "ms" };
  if (unit === "" || unit === undefined) return { n: number, unit: null };
  throw new Error(`${where}: unit "${unit}" can't be resolved to a number`);
}

/** Parses and evaluates a CSS length expression: numbers, px, rem, ms, s, var(), calc() and + - * /. */
function evaluateCss(source, where, lookup) {
  const pattern = /\s*(?:(-?\d*\.?\d+)([a-z%]*)|(var|calc)\(|(--[\w-]+)|([-+*/(),]))/y;
  const tokens = [];
  pattern.lastIndex = 0;
  while (pattern.lastIndex < source.length) {
    if (/^\s*$/.test(source.slice(pattern.lastIndex))) break;
    const start = pattern.lastIndex;
    const match = pattern.exec(source);
    if (!match) {
      throw new Error(`${where}: can't resolve "${source}" (unexpected "${source.slice(start)}")`);
    }
    if (match[1] !== undefined)
      tokens.push({ kind: "number", n: Number(match[1]), unit: match[2] });
    else if (match[3] !== undefined) tokens.push({ kind: "function", name: match[3] });
    else if (match[4] !== undefined) tokens.push({ kind: "property", name: match[4] });
    else tokens.push({ kind: "op", value: match[5] });
  }
  let index = 0;
  const fail = (why) => {
    throw new Error(`${where}: can't resolve "${source}" (${why})`);
  };
  const peek = () => tokens[index];
  const take = (value) => {
    const token = tokens[index];
    if (!token || token.kind !== "op" || token.value !== value) fail(`expected "${value}"`);
    index += 1;
  };
  const combine = (a, op, b) => {
    if (op === "+" || op === "-") {
      if (a.unit !== b.unit) fail(`adds ${a.unit ?? "a number"} to ${b.unit ?? "a number"}`);
      return { n: op === "+" ? a.n + b.n : a.n - b.n, unit: a.unit };
    }
    if (op === "*") {
      if (a.unit && b.unit) fail(`multiplies ${a.unit} by ${b.unit}`);
      return { n: a.n * b.n, unit: a.unit ?? b.unit };
    }
    if (b.unit) fail(`divides by ${b.unit}`);
    if (b.n === 0) fail("divides by zero");
    return { n: a.n / b.n, unit: a.unit };
  };
  const sum = () => {
    let value = product();
    while (peek()?.kind === "op" && (peek().value === "+" || peek().value === "-")) {
      const op = tokens[index++].value;
      value = combine(value, op, product());
    }
    return value;
  };
  const product = () => {
    let value = factor();
    while (peek()?.kind === "op" && (peek().value === "*" || peek().value === "/")) {
      const op = tokens[index++].value;
      value = combine(value, op, factor());
    }
    return value;
  };
  const factor = () => {
    const token = tokens[index++];
    if (!token) fail("ends too early");
    if (token.kind === "number") return quantity(token.n, token.unit, where);
    if (token.kind === "op" && token.value === "-") {
      const value = factor();
      return { n: -value.n, unit: value.unit };
    }
    if (token.kind === "op" && token.value === "(") {
      const value = sum();
      take(")");
      return value;
    }
    if (token.kind === "function" && token.name === "calc") {
      const value = sum();
      take(")");
      return value;
    }
    if (token.kind === "function" && token.name === "var") {
      const property = tokens[index++];
      if (property?.kind !== "property") fail("var() without a custom property");
      take(")");
      return lookup(property.name);
    }
    return fail(`unexpected "${token.value ?? token.name}"`);
  };
  const value = sum();
  if (index !== tokens.length) fail("has more after its value");
  return value;
}

/**
 * Every numeric token resolved to a number in each context, in tokens.json's
 * group nesting: `{ "$type": "dimension", "$value": { "touch": 44, "fine": 44,
 * "desktop": 34 } }`. A dimension is in px, a duration in ms; a number and a
 * font weight have no unit. A reference resolves in the same context, as a
 * custom property does under the same media query.
 */
export function resolveTokens(tokens) {
  const byProperty = new Map();
  const types = new Map();
  (function collect(node, trail, inherited) {
    const type = node.$type ?? inherited;
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("$") && key !== "$root") continue;
      if (!child || typeof child !== "object") continue;
      const childPath = [...trail, key];
      if ("$value" in child) {
        byProperty.set(propertyName(childPath), childPath);
        types.set(childPath.join("."), child.$type ?? type);
      } else collect(child, childPath, type);
    }
  })(tokens, [], undefined);

  const tokenAt = (tokenPath) => tokenPath.reduce((node, part) => node?.[part], tokens);
  const memo = new Map();

  function resolve(tokenPath, context, stack) {
    const id = tokenPath.join(".");
    const key = `${id}@${context}`;
    if (memo.has(key)) return memo.get(key);
    if (stack.includes(key)) {
      throw new Error(`{${id}} refers to itself in the ${context} context: ${stack.join(" -> ")}`);
    }
    const token = tokenAt(tokenPath);
    const where = `{${id}} (${context})`;
    const raw = rawIn(token, context);
    const lookup = (property) => {
      const target = byProperty.get(property);
      if (!target) throw new Error(`${where}: ${property} is not a token in tokens.json`);
      return resolve(target, context, [...stack, key]);
    };
    let value;
    if (typeof raw === "number") value = { n: raw, unit: null };
    else if (raw && typeof raw === "object" && "unit" in raw)
      value = quantity(raw.value, raw.unit, where);
    else if (typeof raw === "string") {
      const reference = raw.match(/^\{([^{}]+)\}$/);
      value = reference
        ? lookup(propertyName(reference[1].split(".")))
        : evaluateCss(raw, where, lookup);
    } else throw new Error(`${where}: ${JSON.stringify(raw)} can't be resolved to a number`);
    memo.set(key, value);
    return value;
  }

  const result = {
    $description:
      "Generated from tokens.json by scripts/build-tokens.mjs; do not edit. Every numeric token resolved to a plain number per context, for readers that can't evaluate CSS: `touch` (a phone and a touch screen, the token's own value), `fine` (a mouse or a trackpad at any width) and `desktop` (from 768px with a mouse or a trackpad). A dimension is in px, a duration in ms; a number and a font weight have no unit. See design/foundations/tokens.md.",
  };
  for (const [tokenPath] of tokensOf(tokens)) {
    if (tokenPath[0] === "deprecated") continue;
    const type = types.get(tokenPath.join("."));
    if (!(type in RESOLVED_UNITS)) continue;
    const values = {};
    for (const context of CONTEXTS) {
      const { n, unit } = resolve(tokenPath, context, []);
      if (unit !== RESOLVED_UNITS[type]) {
        throw new Error(
          `{${tokenPath.join(".")}} (${context}): a ${type} token resolved to ${unit ?? "a plain number"}, not ${RESOLVED_UNITS[type] ?? "a plain number"}`,
        );
      }
      values[context] = Math.round(n * 1000) / 1000;
    }
    let node = result;
    for (const part of tokenPath.slice(0, -1)) node = node[part] ??= {};
    node[tokenPath.at(-1)] = { $type: type, $value: values };
  }
  return result;
}

export function renderResolved(tokens) {
  return `${JSON.stringify(resolveTokens(tokens), null, 2)}\n`;
}

const HEADER = `/* Generated from tokens.json by scripts/build-tokens.mjs. Do not edit this
   file: change tokens.json, then run \`vp run @botiverse/raft-ui#build:tokens\`.

   ─── Token grammar ──────────────────────────────────────────────────────────
   Neutrals:  {role}(-{purpose})(-{intensity})
     role      = foreground | layer | line | fill
     purpose   = frame, sidebar, canvas, card, popover, code, hud, on-frame,
                 on-hud, link, inverse, disabled, field, ...
                 (unordered axis — names say where the token is used)
     intensity = (bare default) > muted > hint for foreground;
                 hairline < seam < strong for line
     layer = places on the elevation ladder; fill = neutral interaction fills
     (resting/hover/active/disabled surfaces): fill-muted and fill-strong are
     opaque, the two hover tiers are translucent ink laid over a surface:
     fill-subtle (hover on rows, messages and readable cards, and a row whose
     menu is open, lighter than any selection tint) and fill-medium (hover on
     small controls, press on everything; fill-frame-medium on the frame,
     sticker-medium on a colour sticker).
   Families:  {family}(-{slot})
     family = brand | attention | info | success | warning | danger | inactive
     slot   = -strong (deep shade: readable text, rings) > bare (solid fill)
              > -muted (strong wash) > -soft (soft wash)
              | -foreground (text on the solid)
              | -hover / -active (derived interaction pair, opt-in per family;
                an opted-in family always gets both)
   Signals:   you | selected — the yellow of "addressed to you" and of the
              selected sticker, with their own value so no theme grays them.
   Washes:    ink-{alpha%} (2..40) — neutral overlays, hairlines, hover fills.
   Opacity rule: layer tokens are opaque in every theme, except the two
   backdrops and the veil (overlays by contract: a scrim under a modal
   surface, a cover over something busy in place); among fills only the
   hover tiers (fill-subtle, fill-medium, fill-frame-medium) are translucent.
   Interaction fills: transparent resting → ink-N directly; solid family fill →
   the family's -hover/-active pair; neutral or tinted surface → step up its ladder.
   Escape hatches: ink ramp for one-off washes; inline oklch() literals for
   one-off precision values (tokenize on the third repeat). */
`;

function main(argv) {
  const tokens = JSON.parse(readFileSync(tokensPath, "utf8"));
  const outputs = [
    [foundationPath, renderFoundation(tokens)],
    [resolvedPath, renderResolved(tokens)],
  ];
  if (argv.includes("--check")) {
    const stale = outputs.filter(
      ([file, text]) => !existsSync(file) || readFileSync(file, "utf8") !== text,
    );
    for (const [file] of stale) {
      console.error(
        `src/${path.basename(file)} is out of date with src/tokens.json. Run \`vp run @botiverse/raft-ui#build:tokens\`.`,
      );
    }
    if (stale.length > 0) process.exit(1);
    return;
  }
  for (const [file, text] of outputs) writeFileSync(file, text);
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2));
