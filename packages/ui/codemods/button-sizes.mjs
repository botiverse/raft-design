#!/usr/bin/env node
// Renames Button's duplicate sizes to the one they always rendered as.
//
//   node node_modules/@botiverse/raft-ui/codemods/button-sizes.mjs <dir-or-file>... [--dry] [--components=MyButton,…]
//
// `xs` and `sm` render exactly as `md`, and `icon-xs` and `icon-sm` exactly as
// `icon-md`, so nothing on screen changes: xs, sm -> md; icon-xs, icon-sm ->
// icon-md. The old names keep working as deprecated aliases until raft-ui 1.0,
// so the rewrite can land at any time after upgrading.
//
// Needs @babel/parser, an optional peer dependency of raft-ui: install it
// in the project you migrate (`pnpm add -D @babel/parser`).
//
// Each file is parsed as TypeScript and JSX (@babel/parser), so comments,
// strings and JSX text never confuse it, and a Button anywhere is found: as a
// child, in another component's prop (`actions={<Button …/>}`,
// `render={<Button …/>}`), in a callback. It rewrites:
// - the `size` of `<Button>`, of the raft-ui parts that pass `size` to a
//   Button (BUTTON_COMPONENTS), and of the components named with
//   `--components`, for your own wrappers: a string (`size="sm"`,
//   `size={"sm"}`) or the strings in an expression (`size={inHead ? "sm" :
//   "lg"}`);
// - `icon-sm` and `icon-xs` in the `size` of any JSX element: only Button has
//   those names;
// - `size: "sm"` in a `buttonVariants({…})` call.
// `sm` and `xs` are names other components use too (Dialog, Banner, Avatar,
// Spinner …), so nothing else is touched. It then lists every `sm`, `xs`,
// `icon-sm` and `icon-xs` string it left, with the element it belongs to, for
// review by hand: a size kept in a variable, a wrapper you didn't name, a test.
import { readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

let babelParse;

/**
 * @babel/parser is an optional peer dependency of raft-ui: only this codemod
 * uses it. Look in the project being migrated first, then beside raft-ui.
 */
function loadParser() {
  if (babelParse) return babelParse;
  for (const from of [path.join(process.cwd(), "package.json"), import.meta.url]) {
    try {
      babelParse = createRequire(from)("@babel/parser").parse;
      return babelParse;
    } catch {
      // Try the next place.
    }
  }
  throw new Error(
    "install @babel/parser to run this codemod (it parses your TSX): pnpm add -D @babel/parser",
  );
}

/** Deprecated Button size -> the size it renders as. */
export const BUTTON_SIZE_RENAMES = {
  xs: "md",
  sm: "md",
  "icon-xs": "icon-md",
  "icon-sm": "icon-md",
};

/** raft-ui components whose `size` is a Button size. */
export const BUTTON_COMPONENTS = [
  "Button",
  "AlertDialogAction",
  "AlertDialogCancel",
  "AlertDialogClose",
  "AnnouncementDialogAction",
  "AnnouncementDialogSecondaryAction",
  "ComposerSubmit",
  "CopyableCodeAction",
  "DialogClose",
  "DrawerClose",
  "FileAction",
  "SidebarSectionControl",
];

const ICON_ONLY = new Set(["icon-xs", "icon-sm"]);
const OLD = new Set(Object.keys(BUTTON_SIZE_RENAMES));

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

/** The string literals a `size` value can resolve to, without entering nested functions or JSX. */
function sizeStrings(node, out = []) {
  if (!node) return out;
  switch (node.type) {
    case "StringLiteral":
      out.push(node);
      break;
    case "TemplateLiteral":
      if (node.expressions.length === 0 && node.quasis.length === 1) out.push(node);
      break;
    case "JSXExpressionContainer":
    case "ParenthesizedExpression":
    case "TSAsExpression":
    case "TSSatisfiesExpression":
    case "TSNonNullExpression":
      sizeStrings(node.expression, out);
      break;
    case "ConditionalExpression":
      sizeStrings(node.consequent, out);
      sizeStrings(node.alternate, out);
      break;
    case "LogicalExpression":
      sizeStrings(node.left, out);
      sizeStrings(node.right, out);
      break;
    default:
      break;
  }
  return out;
}

const literalValue = (node) =>
  node.type === "StringLiteral" ? node.value : node.quasis[0].value.cooked;

function lineOf(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (source.charCodeAt(i) === 10) line += 1;
  return line;
}

/**
 * Renames the deprecated sizes in one file. Returns the new source and the
 * strings it left, as `{ line, value, where }`.
 */
export function migrateButtonSizes(
  source,
  { file = "file.tsx", components = BUTTON_COMPONENTS } = {},
) {
  const buttons = new Set(components);
  const ast = parseSource(source, file);
  const edits = new Map();
  const rename = (literal) => {
    const value = literalValue(literal);
    const quote = source[literal.start];
    edits.set(literal.start, {
      end: literal.end,
      text: `${quote}${BUTTON_SIZE_RENAMES[value]}${quote}`,
    });
  };
  const handled = new Set();

  walk(ast.program, (node) => {
    if (node.type === "JSXOpeningElement") {
      const name = elementName(node.name);
      const isButton = buttons.has(name);
      for (const attribute of node.attributes) {
        if (attribute.type !== "JSXAttribute" || attribute.name.name !== "size") continue;
        for (const literal of sizeStrings(attribute.value)) {
          const value = literalValue(literal);
          if (!OLD.has(value)) continue;
          handled.add(literal.start);
          if (isButton || ICON_ONLY.has(value)) rename(literal);
        }
      }
    }
    if (
      node.type === "CallExpression" &&
      node.callee.type === "Identifier" &&
      node.callee.name === "buttonVariants"
    ) {
      for (const argument of node.arguments) {
        if (argument.type !== "ObjectExpression") continue;
        for (const property of argument.properties) {
          if (property.type !== "ObjectProperty") continue;
          const key = property.key.type === "Identifier" ? property.key.name : property.key.value;
          if (key !== "size") continue;
          for (const literal of sizeStrings(property.value)) {
            if (!OLD.has(literalValue(literal))) continue;
            handled.add(literal.start);
            rename(literal);
          }
        }
      }
    }
  });

  // Every deprecated name still standing, and what it belongs to.
  const left = [];
  walk(ast.program, (node, parents) => {
    // A test that matches the source (`/size="sm"/`) has to change with it.
    if (node.type === "RegExpLiteral") {
      const name = /["'](icon-)?(sm|xs)["']/.exec(node.pattern);
      if (name) {
        left.push({
          line: lineOf(source, node.start),
          value: name[0].slice(1, -1),
          where: "a regular expression",
        });
      }
      return;
    }
    const isString =
      node.type === "StringLiteral" ||
      (node.type === "TemplateLiteral" &&
        node.expressions.length === 0 &&
        node.quasis.length === 1);
    if (!isString || !OLD.has(literalValue(node)) || edits.has(node.start)) return;
    let where = "a string";
    let prop = "";
    for (let i = parents.length - 1; i >= 0; i -= 1) {
      const parent = parents[i];
      if (parent.type === "JSXAttribute" && !prop) prop = ` ${parent.name.name}`;
      if (parent.type === "JSXOpeningElement") {
        where = `<${elementName(parent.name)}${prop}>`;
        break;
      }
      if (parent.type === "JSXElement" || parent.type === "JSXFragment") break;
    }
    left.push({ line: lineOf(source, node.start), value: literalValue(node), where });
  });

  let out = source;
  for (const start of [...edits.keys()].sort((a, b) => b - a)) {
    const { end, text } = edits.get(start);
    out = out.slice(0, start) + text + out.slice(end);
  }
  return { source: out, left };
}

/** The source with the deprecated sizes renamed (see migrateButtonSizes). */
export function renameButtonSizes(source, components = BUTTON_COMPONENTS, file = "file.tsx") {
  return migrateButtonSizes(source, { file, components }).source;
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

function main(argv) {
  const dry = argv.includes("--dry");
  const option = argv.find((arg) => arg.startsWith("--components="));
  const components = option
    ? [...BUTTON_COMPONENTS, ...option.slice("--components=".length).split(",").filter(Boolean)]
    : BUTTON_COMPONENTS;
  const targets = argv.filter((arg) => !arg.startsWith("--"));
  if (targets.length === 0) {
    console.error("usage: button-sizes.mjs <dir-or-file>... [--dry] [--components=MyButton,…]");
    process.exit(1);
  }
  let changed = 0;
  const review = [];
  try {
    loadParser();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  const groups = new Map();
  for (const target of targets) {
    for (const file of walkFiles(target)) {
      const before = readFileSync(file, "utf8");
      if (!/["'`](?:icon-)?(?:sm|xs)["'`]/.test(before)) continue;
      let result;
      try {
        result = migrateButtonSizes(before, { file, components });
      } catch (error) {
        review.push(`${file}: could not parse (${error.message}); not changed`);
        continue;
      }
      for (const { line, value, where } of result.left) {
        review.push(`${file}:${line}  "${value}" in ${where}`);
        groups.set(where, (groups.get(where) ?? 0) + 1);
      }
      if (result.source === before) continue;
      changed += 1;
      console.log(`${dry ? "would update" : "updated"} ${file}`);
      if (!dry) writeFileSync(file, result.source);
    }
  }
  console.log(`${changed} file${changed === 1 ? "" : "s"} ${dry ? "to update" : "updated"}`);
  if (review.length > 0) {
    console.log(
      "\nLeft as they are; check each by hand (another component's size, a variable, your own wrapper).",
    );
    console.log("\nBy element and prop:");
    for (const [where, count] of [...groups].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(count).padStart(4)}  ${where}`);
    }
    console.log("\nEach one:");
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
