#!/usr/bin/env node
// Finds native scrollers written in CSS files, which the lint rule
// `raft-ui/prefer-scroll-area` can't see: it reads JS and TSX only.
//
//   node node_modules/@botiverse/raft-ui/checks/native-scroll-css.mjs [<dir-file-or-glob>...] [--json]
//
// Delegates single-pass CSS lexical scanning and target resolution to
// `@botiverse/lint/css` (`scanCssSource`, `resolveCssTargets`, `globToRegExp`),
// while keeping raft-ui's CLI flags, own-CSS exclusion, and remediation output.

import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globToRegExp, resolveCssTargets, scanCssSource } from "@botiverse/lint/css";

export { globToRegExp };

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

/**
 * The native scrollers in a CSS source: `{ line, column, selector, declaration,
 * property, value }` for each, 1-based, in source order. `optOut: false` also
 * returns the ones a `raft-ui: native-scroll <reason>` comment allows.
 */
export function scanCss(source, { optOut = true } = {}) {
  return scanCssSource(source, {
    rules: ["no-native-scroll"],
    escapePrefixes: ["raft-ui"],
    optOut,
  }).map(({ rule: _rule, message: _message, ...finding }) => finding);
}

/** The CSS files a path names: the file, every .css file under a directory, or a glob's matches. */
export function cssFiles(target, cwd = process.cwd()) {
  return resolveCssTargets(target, cwd);
}

const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const toPosix = (file) => file.split(path.sep).join("/");
const PACKAGE_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/** raft-ui's own CSS, which scrolls natively where its docs say: read by mistake, never reported. */
function isOwnCss(file) {
  if (toPosix(file).includes("/node_modules/@botiverse/raft-ui/")) return true;
  try {
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
  const flags = argv.filter((arg) => arg.startsWith("-"));
  const targets = argv.filter((arg) => !arg.startsWith("-"));
  if (flags.includes("--help") || flags.includes("-h")) {
    return { code: 0, stdout: `${USAGE}\n`, stderr: "" };
  }
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
    if (found.length === 0 && !existsSync(path.resolve(cwd, target))) {
      return { code: 2, stdout: "", stderr: `no CSS files match: ${target}\n` };
    }
    for (const file of found) {
      if (!isOwnCss(file)) files.add(file);
    }
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
