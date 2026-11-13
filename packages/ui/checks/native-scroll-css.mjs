#!/usr/bin/env node
// Finds native scrollers written in CSS files, which the lint rule
// `raft-ui/prefer-scroll-area` can't see: it reads JS and TSX only.
//
//   node node_modules/@botiverse/raft-ui/checks/native-scroll-css.mjs [<dir-file-or-glob>...] [--json]
//
// With no path it reads every .css file under the current directory. A
// directory is read recursively; node_modules, dist, build and dot folders are
// skipped, and so is raft-ui's own CSS. Exits 1 when it reports anything, 0
// when it reports nothing, 2 on a path that doesn't exist or can't be read, a
// glob that matches no file, or an unknown option, so an app can chain it into
// its lint script:
//
//   "lint": "oxlint && node node_modules/@botiverse/raft-ui/checks/native-scroll-css.mjs src"
//
// Reported:
// - a declaration of `overflow`, `overflow-x`, `overflow-y`, `overflow-inline`
//   or `overflow-block` whose value has `auto`, `scroll` or `overlay` in it
//   (`hidden auto` and `auto !important` too), in a rule at any depth
//   (`@media`, `@layer`, `@supports`, nested rules);
// - a native-scrolling Tailwind class in an `@apply`: `overflow-auto`,
//   `overflow-scroll`, their `-x-` and `-y-` forms, with any variant or `!`,
//   an arbitrary value (`overflow-[auto]`, `overflow-y-[scroll]`) or an
//   arbitrary property (`[overflow:overlay]`).
//
// Not reported: `hidden`, `visible` and `clip`, a value that is only a
// `var(--x)` with no keyword in it, a condition (`@supports (overflow: auto)`,
// `@media (overflow-block: scroll)`), and anything in a comment or a string.
//
// Allowed with a `/* raft-ui: native-scroll <reason> */` comment: on a line of
// its own right above the declaration (or the `@apply`), or after it at the
// end of its line. One comment allows one declaration: above a line that holds
// several, only the first. The comment starts with the marker, and one without
// a reason doesn't count. The wording is
// the lint rule's (design/about/use-raft-ui.md#lint-rules).
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROPERTIES = new Set([
  "overflow",
  "overflow-x",
  "overflow-y",
  "overflow-inline",
  "overflow-block",
]);
const SCROLLING_VALUE = /(?<![\w-])(?:auto|scroll|overlay)(?![\w-])/i;
// A class (group 1 a keyword, 2 an arbitrary value) or an arbitrary property (group 3 its value).
const OVERFLOW_CLASS =
  /(?<![\w-])overflow(?:-[xy])?-(?:(auto|scroll)|\[([^\]\s]+)\])(?![\w-])|\[overflow(?:-(?:[xy]|inline|block))?:([^\]\s]+)\]/g;
// The comment starts with the marker, and a reason follows it: a word, not the
// `*` of a decorated comment.
const OPT_OUT = /^[\s*]*raft-ui:\s*native-scroll\s+[^\s*]/;

export const DOCS_URL = "https://raft-design.botiverse.build/components/scroll-area.md";
export const MESSAGE = [
  "A native scroller shows the platform's own scrollbar. The element each of these rules styles",
  "should be a ScrollArea from @botiverse/raft-ui instead: the size stays on its className, grid,",
  'flex, gap and padding go on contentClassName, with orientation="horizontal" for overflow-x and',
  '"both" for overflow, and the overflow declaration is removed. For an element another component',
  "renders, bind it with useScrollAreaContainer and render <ScrollAreaGutters> as its first child.",
  "Where it must scroll natively (one of the allowed cases in the docs), say why in",
  "/* raft-ui: native-scroll <reason> */ on the line above the declaration.",
  `Docs: ${DOCS_URL}`,
].join("\n");

const collapse = (text) => text.replace(/\s+/g, " ").trim();

/**
 * The native scrollers in a CSS source: `{ line, column, selector, declaration,
 * property, value }` for each, 1-based, in source order. `optOut: false` also
 * returns the ones a `raft-ui: native-scroll <reason>` comment allows.
 */
export function scanCss(source, { optOut = true } = {}) {
  const text = source.replace(/^﻿/, " ");
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") lineStarts.push(i + 1);
  const lineOf = (offset) => {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (lineStarts[mid] <= offset) low = mid;
      else high = mid - 1;
    }
    return low;
  };
  const lineEnd = (line) => (line + 1 < lineStarts.length ? lineStarts[line + 1] - 1 : text.length);

  const comments = [];
  const findings = [];
  // The preludes of the open blocks, outermost first.
  const blocks = [];
  // The statement being read: what it holds with comments left out, the offset
  // of each character kept, and the depth of the brackets open in it.
  let buffer = "";
  let offsets = [];
  let depth = 0;
  const reset = () => {
    buffer = "";
    offsets = [];
    depth = 0;
  };

  function selector() {
    const rules = blocks.filter((prelude) => prelude !== "" && !prelude.startsWith("@"));
    if (rules.length > 0) return rules.join(" ");
    return blocks.findLast((prelude) => prelude !== "") ?? "";
  }

  function allowed(start, end) {
    if (!optOut) return false;
    const startLine = lineOf(start);
    return comments.some((comment) => {
      if (!OPT_OUT.test(comment.value)) return false;
      const first = lineOf(comment.start);
      const last = lineOf(comment.end - 1);
      const alone =
        text.slice(lineStarts[first], comment.start).trim() === "" &&
        text.slice(comment.end, lineEnd(last)).trim() === "";
      // On the line above, it allows the first statement of the next line
      // only: nothing ends before it there (`.a { overflow: auto }`, not the
      // second rule or declaration of a line, so not a minified file).
      if (alone) {
        if (last !== startLine - 1) return false;
        const before = text.slice(lineStarts[startLine], start).replace(/\/\*[\s\S]*?\*\//g, "");
        return !/[;}]/.test(before);
      }
      // At the end of the statement's own line: nothing but the end of the
      // statement and of its rule between the two, and nothing after it.
      if (comment.start < end || first !== lineOf(end - 1)) return false;
      const between = text.slice(end, comment.start).replace(/\/\*[\s\S]*?\*\//g, "");
      return /^[\s;}]*$/.test(between) && /^[\s;}]*$/.test(text.slice(comment.end, lineEnd(last)));
    });
  }

  function report(offset, declaration, property, value, start, end) {
    const line = lineOf(offset);
    findings.push({
      start,
      end,
      line: line + 1,
      column: offset - lineStarts[line] + 1,
      selector: selector(),
      declaration: collapse(declaration),
      property,
      value,
    });
  }

  function statement() {
    const lead = buffer.length - buffer.trimStart().length;
    const body = buffer.trim();
    if (body === "") return;
    const start = offsets[lead];
    const end = offsets[lead + body.length - 1] + 1;
    const apply = /^@apply(?=[\s![]|$)/i.exec(body);
    if (apply) {
      for (const match of body.matchAll(OVERFLOW_CLASS)) {
        const value = match[1] ?? (match[2] ?? match[3]).replaceAll("_", " ");
        if (!SCROLLING_VALUE.test(value)) continue;
        report(offsets[lead + match.index], `@apply ${match[0]}`, "@apply", match[0], start, end);
      }
      return;
    }
    const declaration = /^([-\w]+)\s*:([\s\S]*)$/.exec(body);
    if (!declaration) return;
    const property = declaration[1].toLowerCase();
    if (!PROPERTIES.has(property)) return;
    const value = collapse(declaration[2]);
    if (!SCROLLING_VALUE.test(value)) return;
    report(start, `${property}: ${value}`, property, value, start, end);
  }

  const push = (char, offset) => {
    buffer += char;
    offsets.push(offset);
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "/" && text[i + 1] === "*") {
      const close = text.indexOf("*/", i + 2);
      const end = close === -1 ? text.length : close + 2;
      comments.push({ start: i, end, value: text.slice(i + 2, close === -1 ? end : close) });
      // A comment separates what is on its two sides, as a space does.
      push(" ", i);
      i = end - 1;
    } else if (char === '"' || char === "'") {
      // A string is kept whole: a brace or a semicolon in it ends nothing.
      // An unclosed one ends with its line, as CSS reads it.
      push(char, i);
      for (i++; i < text.length && text[i] !== char && text[i] !== "\n"; i++) {
        if (text[i] === "\\" && i + 1 < text.length) push(text[i], i++);
        push(text[i], i);
      }
      if (text[i] === char) push(char, i);
    } else if (char === "\\" && i + 1 < text.length) {
      // An escaped character is never a delimiter: `.a\{b`, `.sm\:flex`.
      push(char, i);
      push(text[i + 1], ++i);
    } else if (char === "(" || char === "[") {
      depth++;
      push(char, i);
    } else if (char === ")" || char === "]") {
      depth = Math.max(0, depth - 1);
      push(char, i);
    } else if (depth > 0 && char !== "}") {
      // Inside brackets: `url(data:image/png;base64,…)` ends no declaration.
      push(char, i);
    } else if (char === "{") {
      blocks.push(collapse(buffer));
      reset();
    } else if (char === "}") {
      // The last declaration of a rule needs no semicolon.
      statement();
      reset();
      blocks.pop();
    } else if (char === ";") {
      statement();
      reset();
    } else {
      push(char, i);
    }
  }
  statement();
  // Once every comment is known: one at the end of a line comes after its statement.
  return findings
    .filter(({ start, end }) => !allowed(start, end))
    .map(({ start: _start, end: _end, ...finding }) => finding);
}

const SKIP = new Set(["node_modules", "dist", "build"]);
const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const toPosix = (file) => file.split(path.sep).join("/");

function* walk(dir, seen = new Set()) {
  // A folder is read once: a symlink back to one already read is a loop.
  const real = realpathSync(dir);
  if (seen.has(real)) return;
  seen.add(real);
  for (const name of readdirSync(dir).sort(byName)) {
    if (SKIP.has(name) || name.startsWith(".")) continue;
    const full = path.join(dir, name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue; // a dangling symlink
    }
    if (stat.isDirectory()) yield* walk(full, seen);
    else if (name.endsWith(".css")) yield full;
  }
}

/** A glob as a RegExp over a posix path: `**`, `*`, `?`, `{a,b}` and `[abc]`. */
export function globToRegExp(glob) {
  let out = "";
  let braces = 0;
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i];
    if (char === "*") {
      if (glob[i + 1] === "*") {
        i++;
        // `**/` is any number of folders, none included.
        if (glob[i + 1] === "/") {
          i++;
          out += "(?:[^/]+/)*";
        } else out += ".*";
      } else out += "[^/]*";
    } else if (char === "?") out += "[^/]";
    else if (char === "{") {
      braces++;
      out += "(?:";
    } else if (char === "}" && braces > 0) {
      braces--;
      out += ")";
    } else if (char === "," && braces > 0) out += "|";
    else if (char === "[") {
      const close = glob.indexOf("]", i + 2);
      if (close === -1) out += "\\[";
      else {
        const body = glob.slice(i + 1, close).replace(/\\/g, "\\\\");
        out += `[${body.startsWith("!") ? `^${body.slice(1)}` : body}]`;
        i = close;
      }
    } else out += char.replace(/[.+^$()|\\\]}]/g, "\\$&");
  }
  return new RegExp(`^${out}$`);
}

const IS_GLOB = /[*?{[]/;

/** The CSS files a path names: the file, every .css file under a directory, or a glob's matches. */
export function cssFiles(target, cwd = process.cwd()) {
  const full = path.resolve(cwd, target);
  if (existsSync(full)) return statSync(full).isDirectory() ? [...walk(full)] : [full];
  if (!IS_GLOB.test(target)) return undefined;
  // Walk from the folders the glob names before its first wildcard.
  const parts = toPosix(target).split("/");
  const fixed = [];
  while (parts.length > 1 && !IS_GLOB.test(parts[0])) fixed.push(parts.shift());
  const base = path.resolve(cwd, fixed.join("/") || ".");
  if (!existsSync(base) || !statSync(base).isDirectory()) return [];
  const pattern = globToRegExp(parts.join("/"));
  return [...walk(base)].filter((file) => pattern.test(toPosix(path.relative(base, file))));
}

const PACKAGE_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/** raft-ui's own CSS, which scrolls natively where its docs say: read by mistake, never reported. */
function isOwnCss(file) {
  if (toPosix(file).includes("/node_modules/@botiverse/raft-ui/")) return true;
  try {
    // A symlinked install (pnpm, a workspace) resolves to the package's folder.
    const real = realpathSync(file);
    const own = realpathSync(PACKAGE_DIR) + path.sep;
    return real.startsWith(own) && toPosix(real.slice(own.length)).startsWith("dist/");
  } catch {
    return false;
  }
}

const USAGE =
  "usage: native-scroll-css.mjs [<dir-file-or-glob>...] [--json]\n" +
  "Reports native scrollers (overflow: auto | scroll | overlay) in CSS files.\n" +
  "With no path, reads every .css file under the current directory.";

/** Runs the check: `{ code, stdout, stderr }`, without printing or exiting. */
export function run(argv, cwd = process.cwd()) {
  const flags = argv.filter((arg) => arg.startsWith("--"));
  const targets = argv.filter((arg) => !arg.startsWith("--"));
  if (flags.includes("--help")) return { code: 0, stdout: `${USAGE}\n`, stderr: "" };
  const unknown = flags.filter((flag) => flag !== "--json");
  if (unknown.length > 0) {
    return { code: 2, stdout: "", stderr: `unknown option ${unknown.join(", ")}\n${USAGE}\n` };
  }
  const json = flags.includes("--json");

  const files = new Set();
  for (const target of targets.length > 0 ? targets : ["."]) {
    let found;
    try {
      found = cssFiles(target, cwd);
    } catch (error) {
      return {
        code: 2,
        stdout: "",
        stderr: `can't read ${target}: ${error.code ?? error.message}\n`,
      };
    }
    if (found === undefined) {
      return { code: 2, stdout: "", stderr: `no such file or directory: ${target}\n` };
    }
    // A glob that matches nothing is a mistyped path, as a missing one is: a
    // lint script must not stay green on it.
    if (found.length === 0 && !existsSync(path.resolve(cwd, target))) {
      return { code: 2, stdout: "", stderr: `no CSS files match: ${target}\n` };
    }
    for (const file of found) if (!isOwnCss(file)) files.add(file);
  }

  const findings = [];
  for (const file of [...files].sort(byName)) {
    const shown = toPosix(path.relative(cwd, file)) || toPosix(file);
    let source;
    try {
      source = readFileSync(file, "utf8");
    } catch (error) {
      return {
        code: 2,
        stdout: "",
        stderr: `can't read ${shown}: ${error.code ?? error.message}\n`,
      };
    }
    for (const finding of scanCss(source)) {
      findings.push({ file: shown, ...finding });
    }
  }

  const code = findings.length > 0 ? 1 : 0;
  if (json) {
    const report = { files: files.size, findings, message: code ? MESSAGE : "", docs: DOCS_URL };
    return { code, stdout: `${JSON.stringify(report, null, 2)}\n`, stderr: "" };
  }
  const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
  if (code === 0) {
    return {
      code,
      stdout: `No native scrollers in ${plural(files.size, "CSS file")}.\n`,
      stderr: "",
    };
  }
  const lines = findings.map(
    ({ file, line, column, selector, declaration }) =>
      `${file}:${line}:${column}  ${selector ? `${selector} ` : ""}{ ${declaration} }`,
  );
  const reported = new Set(findings.map((finding) => finding.file)).size;
  const summary = `${plural(findings.length, "native scroller")} in ${plural(reported, "CSS file")}.`;
  return { code, stdout: `${lines.join("\n")}\n\n${summary}\n${MESSAGE}\n`, stderr: "" };
}

// Run only when invoked directly. Compare real paths: pnpm installs packages
// through symlinks, so `process.argv[1]` (the path typed) and this module's
// URL (the resolved file) differ.
function isInvokedDirectly() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}
if (isInvokedDirectly()) {
  const { code, stdout, stderr } = run(process.argv.slice(2));
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  process.exitCode = code;
}
