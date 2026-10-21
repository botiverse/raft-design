#!/usr/bin/env node
// Generates src/foundation.css from src/tokens.json, the single source of the
// Raft Design System's color, elevation and metric tokens.
//
//   node scripts/build-tokens.mjs           write src/foundation.css
//   node scripts/build-tokens.mjs --check   exit 1 if src/foundation.css is stale
//
// tokens.json follows the Design Tokens Community Group format (2025.10). Its
// extension "build.botiverse.raft" carries what the format has no field for:
// `modes.dark` (the dark value), `desktop` (the value from 768px with a fine pointer, where the
// desktop layout begins; the token's own value is the phone's), `scope`
// ("root" for mode-independent values, "every-mode" for aliases declared again
// in each mode scope) and `css` (a value kept as a CSS expression, such as
// color-mix() or a layered shadow).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXT = "build.botiverse.raft";
const packageDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tokensPath = path.join(packageDir, "src/tokens.json");
const foundationPath = path.join(packageDir, "src/foundation.css");

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
      if (ext.desktop !== undefined) desktopRoot.push(declaration(ext.desktop));
      continue;
    }
    if (ext.scope === "every-mode") {
      everyMode.push({ line: declaration(token.$value), deprecated: false });
      continue;
    }
    described(light, "  ");
    light.push(fit(declaration(token.$value), "  "));
    if (ext.modes?.dark !== undefined) dark.push(declaration(ext.modes.dark));
    if (ext.desktop !== undefined) desktopLight.push(declaration(ext.desktop));
  }

  const block = (lines, indent) => lines.map((line) => fit(line, indent)).join("\n");
  const current = everyMode.filter((entry) => !entry.deprecated).map((entry) => entry.line);
  const deprecated = everyMode.filter((entry) => entry.deprecated).map((entry) => entry.line);

  return `${HEADER}
/* Raw brand ramps (the website palette) — variables only, no utility registration. Consumed by the
   Tailwind aliases in styles.css, the brand ramps, and state families below. */
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

  /* Deprecated names, kept until raft-ui 1.0. Run
     \`node node_modules/@botiverse/raft-ui/codemods/token-names.mjs <src>\` to move to the
     current names. */
${block(deprecated, "  ")}
}

/* Deprecated palette names (the \`brutal\` theme family no longer exists) and the
   \`secondary\` ramp, kept until raft-ui 1.0. */
:where(:root) {
${block(
  staticDeprecated.map((entry) => entry.line),
  "  ",
)}
}
${renderDesktop(desktopRoot, desktopLight)}`;
}

/* Desktop values, declared again in the scope the phone value lives in (a
   `.light` island declares its own), inside the one breakpoint. */
function renderDesktop(rootLines, lightLines) {
  if (rootLines.length === 0 && lightLines.length === 0) return "";
  const scope = (selector, lines) =>
    lines.length === 0 ? [] : [`  ${selector} {`, ...lines.map((line) => fit(line, "    ")), "  }"];
  return `
/* Desktop: from 768px (Tailwind's \`md\`, where the desktop layout begins)
   with a mouse or trackpad. The metrics that follow Feishu's PC specs. A
   phone, and a touch screen at any width, keep the values above. The same
   query as the desktop type in styles.css. */
@media (width >= 48rem) and (pointer: fine) {
${[...scope(":where(:root)", rootLines), ...scope(":where(:root),\n  .light", lightLines)].join("\n")}
}
`;
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
     opaque, the -pressed and -hover overlays are translucent ink laid over a
     surface (a row hovers with fill-row-hover or fill-message-hover, lighter
     than any selection tint; press keeps fill-pressed).
   Families:  {family}(-{slot})
     family = brand | attention | info | success | warning | danger | inactive
     slot   = -strong (deep shade: readable text, rings) > bare (solid fill)
              > -muted (strong wash) > -soft (soft wash)
              | -foreground (text on the solid)
              | -hover / -active (derived interaction pair, opt-in per family;
                an opted-in family always gets both)
   Washes:    ink-{alpha%} (2..40) — neutral overlays, hairlines, hover fills.
   Opacity rule: layer tokens are opaque in every theme, except the two
   backdrops (overlays by contract); among fills only the -pressed and -hover
   overlays are translucent.
   Interaction fills: transparent resting → ink-N directly; solid family fill →
   the family's -hover/-active pair; neutral or tinted surface → step up its ladder.
   Escape hatches: ink ramp for one-off washes; inline oklch() literals for
   one-off precision values (tokenize on the third repeat). */
`;

function main(argv) {
  const tokens = JSON.parse(readFileSync(tokensPath, "utf8"));
  const css = renderFoundation(tokens);
  if (argv.includes("--check")) {
    if (readFileSync(foundationPath, "utf8") !== css) {
      console.error(
        "src/foundation.css is out of date with src/tokens.json. Run `vp run @botiverse/raft-ui#build:tokens`.",
      );
      process.exit(1);
    }
    return;
  }
  writeFileSync(foundationPath, css);
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2));
