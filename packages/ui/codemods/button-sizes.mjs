#!/usr/bin/env node
// Renames Button's duplicate sizes to the one they always rendered as.
//
//   node node_modules/@botiverse/raft-ui/codemods/button-sizes.mjs <dir-or-file>... [--dry] [--components=Button,MyButton]
//
// `xs` and `sm` render exactly as `md`, and `icon-xs` and `icon-sm` exactly as
// `icon-md`, so nothing on screen changes: xs, sm -> md; icon-xs, icon-sm ->
// icon-md. The old names keep working as deprecated aliases until raft-ui 1.0,
// so the rewrite can land at any time after upgrading.
//
// It rewrites the `size` of `<Button>` and of the raft-ui parts that pass
// `size` to a Button (DialogClose, ComposerSubmit, … see BUTTON_COMPONENTS),
// plus any component named with `--components`, for your own wrappers: a
// string (`size="sm"`, `size={"sm"}`), the strings in an expression
// (`size={inHead ? "sm" : "lg"}`), and `size: "sm"` in a `buttonVariants({…})`
// call. `icon-sm` and `icon-xs` are Button's alone, so they are renamed in the
// `size` of any JSX tag. `sm` and `xs` are names other components use too
// (Dialog, Banner, Avatar …), so they are renamed only in those places.
//
// Review by hand afterwards: a size passed through a variable, or to a
// wrapper you didn't list, keeps the old name; the script lists the lines
// that still say `icon-sm` or `icon-xs`, which only Button uses.
import { readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  "SidebarSectionControl",
];

const OLD = "(xs|sm|icon-xs|icon-sm)";
const OLD_ICON = "(icon-xs|icon-sm)";

/** The end of a JSX opening tag that starts at `start` (just after its name). */
function openingTagEnd(source, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === "\\") i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    else if (ch === ">" && depth === 0) return i + 1;
  }
  return source.length;
}

/** The end of the balanced `{…}` or `(…)` that opens at `start`. */
function balancedEnd(source, start) {
  const open = source[start];
  const close = open === "{" ? "}" : ")";
  let depth = 0;
  let quote = null;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === "\\") i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }
  return source.length;
}

const renameLiterals = (text, names = OLD) =>
  text.replace(
    new RegExp(`(["'])${names}\\1`, "g"),
    (_, q, name) => `${q}${BUTTON_SIZE_RENAMES[name]}${q}`,
  );

/** Rewrites the `size` attribute inside one JSX opening tag. */
function renameInTag(tag, names = OLD) {
  let out = "";
  let i = 0;
  const attr = /(?<![\w-])size\s*=\s*/g;
  let match;
  while ((match = attr.exec(tag))) {
    const valueStart = match.index + match[0].length;
    out += tag.slice(i, valueStart);
    const first = tag[valueStart];
    let valueEnd = valueStart;
    if (first === '"' || first === "'") valueEnd = tag.indexOf(first, valueStart + 1) + 1;
    else if (first === "{") valueEnd = balancedEnd(tag, valueStart);
    out += renameLiterals(tag.slice(valueStart, valueEnd), names);
    i = valueEnd;
    attr.lastIndex = valueEnd;
  }
  return out + tag.slice(i);
}

export function renameButtonSizes(source, components = BUTTON_COMPONENTS) {
  const buttons = new Set(components);
  let out = source;
  // Every JSX opening tag: a Button's takes all four names, any other tag only
  // the two that are Button's alone.
  const tagStart = /<([A-Z][\w$]*(?:\.[\w$]+)*)(?![\w.$-])/g;
  let result = "";
  let last = 0;
  let match;
  while ((match = tagStart.exec(out))) {
    const end = openingTagEnd(out, match.index + match[0].length);
    const names = buttons.has(match[1]) ? OLD : OLD_ICON;
    result += out.slice(last, match.index) + renameInTag(out.slice(match.index, end), names);
    last = end;
    tagStart.lastIndex = end;
  }
  out = result + out.slice(last);

  // buttonVariants({ variant: "ghost", size: "icon-sm" })
  result = "";
  last = 0;
  const call = /\bbuttonVariants\s*\(/g;
  while ((match = call.exec(out))) {
    const open = match.index + match[0].length - 1;
    const end = balancedEnd(out, open);
    const args = out
      .slice(open, end)
      .replace(new RegExp(`(\\bsize\\s*:\\s*)(["'])${OLD}\\2`, "g"), (_, key, q, name) => {
        return `${key}${q}${BUTTON_SIZE_RENAMES[name]}${q}`;
      });
    result += out.slice(last, open) + args;
    last = end;
    call.lastIndex = end;
  }
  return result + out.slice(last);
}

/** Lines that still name a size only Button has, for review by hand. */
export function leftovers(source) {
  const lines = [];
  source.split("\n").forEach((line, index) => {
    if (/(["'])icon-(?:xs|sm)\1/.test(line)) lines.push(index + 1);
  });
  return lines;
}

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const SKIP = new Set(["node_modules", "dist", "build", ".git"]);

function* walk(target) {
  const stat = statSync(target);
  if (stat.isFile()) {
    if (EXTENSIONS.has(path.extname(target))) yield target;
    return;
  }
  for (const name of readdirSync(target)) {
    if (SKIP.has(name) || name.startsWith(".")) continue;
    yield* walk(path.join(target, name));
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
    console.error(
      "usage: button-sizes.mjs <dir-or-file>... [--dry] [--components=Button,MyButton]",
    );
    process.exit(1);
  }
  let changed = 0;
  const review = [];
  for (const target of targets) {
    for (const file of walk(target)) {
      const before = readFileSync(file, "utf8");
      const after = renameButtonSizes(before, components);
      for (const line of leftovers(after)) review.push(`${file}:${line}`);
      if (after === before) continue;
      changed += 1;
      console.log(`${dry ? "would update" : "updated"} ${file}`);
      if (!dry) writeFileSync(file, after);
    }
  }
  console.log(`${changed} file${changed === 1 ? "" : "s"} ${dry ? "to update" : "updated"}`);
  if (review.length > 0) {
    console.log(
      `\nStill naming icon-sm or icon-xs (a variable, a wrapper, a test); check by hand:`,
    );
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
