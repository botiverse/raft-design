#!/usr/bin/env node
// Renames the raft-ui parts and props that the HelperText release renamed.
//
//   node node_modules/@botiverse/raft-ui/codemods/helper-text-renames.mjs <dir-or-file>... [--dry]
//
// Only renames, which change nothing on screen. The new HelperText type is
// not migrated by this codemod: each explanatory sentence is wrapped in
// helperText(content, { why, about }), cut, or moved to a data part by hand,
// since only a person can say why it is there (the type check lists them).
//
// It rewrites:
// - the data parts renamed to `*Subtitle`, and their props types:
//   SearchEntityResultDescription, PreviewCardDescription, TaskCardDescription,
//   MobileNavServerPopoverRowDescription (imports, JSX, any identifier);
// - `<Step description=…>` to `<Step subtitle=…>`;
// - `variant="placeholder"` on Text (Text.Sans, Text.Mono, Text.Heading,
//   TextSans, TextMono, TextHeading) to `variant="note"`, the strings in an
//   expression included (`variant={done ? "placeholder" : "default"}`).
// It then lists every `"placeholder"` variant it left on another element, for
// review by hand: a wrapper of your own that passes it to Text.
//
// Needs @babel/parser, an optional peer dependency of raft-ui: install it
// in the project you migrate (`pnpm add -D @babel/parser`).
import { readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

let babelParse;

/**
 * @babel/parser is an optional peer dependency of raft-ui: only this codemod
 * uses it. Look in the project being migrated first, then beside raft-ui.
 * Only a parser that is not there asks to install it: one that is there but
 * fails to load (Babel 8 is ESM only, and a Node without require(esm) can't
 * load it) reports its own error.
 */
function loadParser() {
  if (babelParse) return babelParse;
  let loadError;
  for (const from of [path.join(process.cwd(), "package.json"), import.meta.url]) {
    try {
      babelParse = createRequire(from)("@babel/parser").parse;
      return babelParse;
    } catch (error) {
      const missing =
        error?.code === "MODULE_NOT_FOUND" && String(error.message).includes("'@babel/parser'");
      if (!missing) loadError ??= error;
    }
  }
  if (loadError) {
    throw new Error(
      `@babel/parser is installed but failed to load: ${loadError.message ?? loadError}`,
      { cause: loadError },
    );
  }
  throw new Error(
    "install @babel/parser to run this codemod (it parses your TSX): pnpm add -D @babel/parser",
  );
}

/** Former name -> current name, for the parts and their props types. */
export const PART_RENAMES = {
  SearchEntityResultDescription: "SearchEntityResultSubtitle",
  SearchEntityResultDescriptionProps: "SearchEntityResultSubtitleProps",
  PreviewCardDescription: "PreviewCardSubtitle",
  PreviewCardDescriptionProps: "PreviewCardSubtitleProps",
  TaskCardDescription: "TaskCardSubtitle",
  TaskCardDescriptionProps: "TaskCardSubtitleProps",
  MobileNavServerPopoverRowDescription: "MobileNavServerPopoverRowSubtitle",
  MobileNavServerPopoverRowDescriptionProps: "MobileNavServerPopoverRowSubtitleProps",
};

/** The Text components whose `placeholder` tone is now `note`. */
export const TEXT_COMPONENTS = [
  "Text.Sans",
  "Text.Mono",
  "Text.Heading",
  "TextSans",
  "TextMono",
  "TextHeading",
];

function parseSource(source, file) {
  const ext = path.extname(file);
  const plugins =
    ext === ".ts" || ext === ".mts" || ext === ".cts" ? ["typescript"] : ["typescript", "jsx"];
  return loadParser()(source, {
    sourceType: "unambiguous",
    plugins,
    errorRecovery: true,
    allowReturnOutsideFunction: true,
  });
}

/** Depth-first walk over a Babel AST, with each node's parent chain. */
function walk(node, visit, parents = []) {
  if (!node || typeof node.type !== "string") return;
  visit(node, parents);
  const next = [...parents, node];
  for (const key of Object.keys(node)) {
    if (key === "loc" || key === "start" || key === "end" || key === "extra") continue;
    const value = node[key];
    if (Array.isArray(value)) for (const child of value) walk(child, visit, next);
    else if (value && typeof value.type === "string") walk(value, visit, next);
  }
}

function elementName(name) {
  if (!name) return "";
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXMemberExpression")
    return `${elementName(name.object)}.${name.property.name}`;
  if (name.type === "JSXNamespacedName") return `${name.namespace.name}:${name.name.name}`;
  return "";
}

function variantStrings(node, out = []) {
  if (!node) return out;
  switch (node.type) {
    case "StringLiteral":
      out.push(node);
      break;
    case "JSXExpressionContainer":
    case "ParenthesizedExpression":
    case "TSAsExpression":
    case "TSSatisfiesExpression":
      variantStrings(node.expression, out);
      break;
    case "ConditionalExpression":
      variantStrings(node.consequent, out);
      variantStrings(node.alternate, out);
      break;
    case "LogicalExpression":
      variantStrings(node.left, out);
      variantStrings(node.right, out);
      break;
    default:
      break;
  }
  return out;
}

function lineOf(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (source.charCodeAt(i) === 10) line += 1;
  return line;
}

/** Renames in one file. Returns the new source and the `placeholder` variants it left. */
export function migrateHelperTextRenames(source, { file = "file.tsx" } = {}) {
  const ast = parseSource(source, file);
  const text = new Set(TEXT_COMPONENTS);
  const edits = new Map();
  const left = [];
  walk(ast.program, (node) => {
    if (
      (node.type === "Identifier" || node.type === "JSXIdentifier") &&
      Object.hasOwn(PART_RENAMES, node.name)
    ) {
      edits.set(node.start, { end: node.end, text: PART_RENAMES[node.name] });
      return;
    }
    if (node.type !== "JSXOpeningElement") return;
    const name = elementName(node.name);
    for (const attribute of node.attributes) {
      if (attribute.type !== "JSXAttribute") continue;
      const prop = attribute.name.name;
      if (name === "Step" && prop === "description") {
        edits.set(attribute.name.start, { end: attribute.name.end, text: "subtitle" });
      }
      if (prop !== "variant") continue;
      for (const literal of variantStrings(attribute.value)) {
        if (literal.value !== "placeholder") continue;
        if (text.has(name)) {
          const quote = source[literal.start];
          edits.set(literal.start, { end: literal.end, text: `${quote}note${quote}` });
        } else {
          left.push({ line: lineOf(source, literal.start), where: `<${name} variant>` });
        }
      }
    }
  });
  let out = source;
  for (const start of [...edits.keys()].sort((a, b) => b - a)) {
    const { end, text: replacement } = edits.get(start);
    out = out.slice(0, start) + replacement + out.slice(end);
  }
  return { source: out, left };
}

/** The source with the renames applied (see migrateHelperTextRenames). */
export function renameHelperTextParts(source, file = "file.tsx") {
  return migrateHelperTextRenames(source, { file }).source;
}

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts"]);
const SKIP = new Set(["node_modules", "dist", "build", ".git"]);

function* walkFiles(target) {
  const stat = statSync(target);
  if (stat.isFile()) {
    if (EXTENSIONS.has(path.extname(target))) yield target;
    return;
  }
  for (const name of readdirSync(target)) {
    if (SKIP.has(name) || name.startsWith(".")) continue;
    yield* walkFiles(path.join(target, name));
  }
}

const MENTIONS = new RegExp(
  `${Object.keys(PART_RENAMES).join("|")}|description=|["'\`]placeholder["'\`]`,
);

function main(argv) {
  const dry = argv.includes("--dry");
  const targets = argv.filter((arg) => !arg.startsWith("--"));
  if (targets.length === 0) {
    console.error("usage: helper-text-renames.mjs <dir-or-file>... [--dry]");
    process.exit(1);
  }
  try {
    loadParser();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  let changed = 0;
  const review = [];
  for (const target of targets) {
    for (const file of walkFiles(target)) {
      const before = readFileSync(file, "utf8");
      if (!MENTIONS.test(before)) continue;
      let result;
      try {
        result = migrateHelperTextRenames(before, { file });
      } catch (error) {
        review.push(`${file}: could not parse (${error.message}); not changed`);
        continue;
      }
      for (const { line, where } of result.left)
        review.push(`${file}:${line}  "placeholder" in ${where}`);
      if (result.source === before) continue;
      changed += 1;
      console.log(`${dry ? "would update" : "updated"} ${file}`);
      if (!dry) writeFileSync(file, result.source);
    }
  }
  console.log(`${changed} file${changed === 1 ? "" : "s"} ${dry ? "to update" : "updated"}`);
  if (review.length > 0) {
    console.log("\nLeft as they are; check each by hand (a wrapper that passes it to Text):");
    for (const where of review) console.log(`  ${where}`);
  }
}

// Run only when invoked directly (see token-names.mjs: pnpm installs through
// symlinks, so compare real paths).
function isInvokedDirectly() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}
if (isInvokedDirectly()) main(process.argv.slice(2));
