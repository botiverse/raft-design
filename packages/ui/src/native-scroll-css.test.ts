import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, expect, test } from "vite-plus/test";
// @ts-expect-error -- a plain ESM script shipped in the package, without types.
import * as check from "../checks/native-scroll-css.mjs";

interface Finding {
  line: number;
  column: number;
  selector: string;
  declaration: string;
  property: string;
  value: string;
}
const scanCss = check.scanCss as (source: string, options?: { optOut?: boolean }) => Finding[];
const globToRegExp = check.globToRegExp as (glob: string) => RegExp;
const run = check.run as (
  argv: string[],
  cwd?: string,
) => { code: number; stdout: string; stderr: string };

const SCRIPT = fileURLToPath(new URL("../checks/native-scroll-css.mjs", import.meta.url));
const declarations = (source: string) => scanCss(source).map((finding) => finding.declaration);

test("reports every overflow property set to auto, scroll or overlay", () => {
  for (const property of [
    "overflow",
    "overflow-x",
    "overflow-y",
    "overflow-inline",
    "overflow-block",
  ]) {
    for (const value of ["auto", "scroll", "overlay"]) {
      expect(declarations(`.a { ${property}: ${value}; }`)).toEqual([`${property}: ${value}`]);
    }
  }
  expect(declarations(".a { OVERFLOW-Y: AUTO }")).toEqual(["overflow-y: AUTO"]);
});

test("reports two values, !important and a keyword in a var() fallback", () => {
  expect(declarations(".a { overflow: hidden auto; }")).toEqual(["overflow: hidden auto"]);
  expect(declarations(".a { overflow: scroll hidden; }")).toEqual(["overflow: scroll hidden"]);
  expect(declarations(".a { overflow-y: auto !important; }")).toEqual([
    "overflow-y: auto !important",
  ]);
  expect(declarations(".a{overflow-y:scroll!important}")).toEqual(["overflow-y: scroll!important"]);
  expect(declarations(".a { overflow: var(--o, auto); }")).toEqual(["overflow: var(--o, auto)"]);
});

test("leaves hidden, visible and clip, other properties and look-alikes alone", () => {
  const valid = [
    ".a { overflow: hidden; }",
    ".a { overflow: visible; overflow-x: clip; overflow-y: hidden !important; }",
    ".a { overflow: hidden clip; }",
    ".a { overflow: var(--scroll); }",
    ".a { overflow: var(--auto-flow); }",
    ".a { overflow-wrap: anywhere; overflow-anchor: auto; overflow-clip-margin: 4px; }",
    ".a { text-overflow: ellipsis; scroll-behavior: auto; margin: auto; }",
    ".a { -webkit-overflow-scrolling: auto; }",
    ".a { --overflow: auto; --overflow-y: scroll; }",
    ".overflow-auto, .scroll { color: red; }",
    'a[data-overflow="auto"] { color: red; }',
  ];
  for (const source of valid) expect(scanCss(source), source).toEqual([]);
});

test("reads no declaration in a comment, a string, a url() or a condition", () => {
  const valid = [
    "/* .a { overflow: auto; } */",
    ".a { /* overflow: auto; */ color: red; }",
    ".a { color: red; /* overflow-y: scroll */ }",
    '.a::after { content: "overflow: auto;"; }',
    ".a::after { content: '} .b { overflow: auto; }'; }",
    '.a::after { content: "\\"; overflow: auto;"; }',
    ".a { background: url(data:image/svg+xml;overflow:auto;base64,AAAA); }",
    "@supports (overflow: auto) { .a { color: red; } }",
    "@supports not (overflow-y: overlay) { .a { color: red; } }",
    "@media (overflow-block: scroll) { .a { color: red; } }",
    '@import url("a.css") supports(overflow: auto);',
    "@container (overflow-inline: scroll) { .a { color: red; } }",
  ];
  for (const source of valid) expect(scanCss(source), source).toEqual([]);
});

test("a comment, a string or a url() next to a declaration doesn't hide it", () => {
  expect(declarations(".a { /* why */ overflow: auto; }")).toEqual(["overflow: auto"]);
  expect(declarations(".a { overflow/* x */: /* y */ auto /* z */; }")).toEqual(["overflow: auto"]);
  expect(declarations('.a::after { content: "}"; overflow: auto; }')).toEqual(["overflow: auto"]);
  expect(declarations('.a { content: "\\""; overflow: scroll }')).toEqual(["overflow: scroll"]);
  expect(declarations(".a { background: url(a.png;b); overflow-x: auto }")).toEqual([
    "overflow-x: auto",
  ]);
  expect(declarations('[data-a="{"] { overflow: auto }')).toEqual(["overflow: auto"]);
  expect(declarations(".a\\{b { overflow: auto }")).toEqual(["overflow: auto"]);
  // An unclosed comment hides the rest of the file, as a browser reads it.
  expect(declarations(".a { overflow: auto } /* .b { overflow: scroll }")).toEqual([
    "overflow: auto",
  ]);
});

test("gives each report its line, column and selector", () => {
  const source = [
    ".log,",
    ".list > li {",
    "  color: red;",
    "  overflow-y: auto;",
    "}",
    "",
    "pre { overflow-x: scroll }",
  ].join("\n");
  expect(scanCss(source)).toEqual([
    {
      line: 4,
      column: 3,
      selector: ".log, .list > li",
      declaration: "overflow-y: auto",
      property: "overflow-y",
      value: "auto",
    },
    {
      line: 7,
      column: 7,
      selector: "pre",
      declaration: "overflow-x: scroll",
      property: "overflow-x",
      value: "scroll",
    },
  ]);
  // The same positions with Windows line ends.
  expect(scanCss(source.replaceAll("\n", "\r\n")).map((f) => [f.line, f.column])).toEqual([
    [4, 3],
    [7, 7],
  ]);
});

test("reads minified CSS on one line", () => {
  const source =
    '.a{color:red;overflow:auto}.b{overflow:hidden}@media (min-width:1px){.c{overflow-x:scroll!important;content:"}"}.d:hover{overflow:hidden auto}}';
  expect(scanCss(source).map((f) => [f.line, f.column, f.selector, f.declaration])).toEqual([
    [1, 14, ".a", "overflow: auto"],
    [1, 73, ".c", "overflow-x: scroll!important"],
    [1, 122, ".d:hover", "overflow: hidden auto"],
  ]);
});

test("reads rules inside @media, @layer, @supports and nested rules", () => {
  const source = `
@layer components {
  @media (min-width: 768px) {
    @supports (overflow: clip) {
      .panel { overflow-y: auto; }
    }
  }
}
@layer base { html { overflow: hidden; } }
.card {
  overflow: hidden;
  & .body { overflow-y: scroll; }
  &:hover { .inner { overflow: overlay } }
}
@utility scroller { overflow-x: auto; }
`;
  expect(scanCss(source).map((f) => [f.line, f.selector, f.declaration])).toEqual([
    [5, ".panel", "overflow-y: auto"],
    [12, ".card & .body", "overflow-y: scroll"],
    [13, ".card &:hover .inner", "overflow: overlay"],
    [15, "@utility scroller", "overflow-x: auto"],
  ]);
});

test("reports a native-scrolling class in @apply", () => {
  expect(declarations(".a { @apply min-h-0 overflow-y-auto p-2; }")).toEqual([
    "@apply overflow-y-auto",
  ]);
  expect(
    declarations(
      ".a { @apply overflow-auto md:overflow-x-scroll overflow-scroll! !overflow-y-scroll; }",
    ),
  ).toEqual([
    "@apply overflow-auto",
    "@apply overflow-x-scroll",
    "@apply overflow-scroll",
    "@apply overflow-y-scroll",
  ]);
  expect(
    declarations(
      ".a { @apply overflow-[auto] overflow-y-[scroll] overflow-[hidden_auto] [overflow:overlay] [overflow-x:auto]; }",
    ),
  ).toEqual([
    "@apply overflow-[auto]",
    "@apply overflow-y-[scroll]",
    "@apply overflow-[hidden_auto]",
    "@apply [overflow:overlay]",
    "@apply [overflow-x:auto]",
  ]);
  // The last statement of a rule, with no semicolon, and each class at its own place.
  const [first, second] = scanCss(
    ".a {\n  @apply flex\n    overflow-x-auto\n    overflow-y-auto\n}",
  );
  expect([first?.line, first?.column, second?.line, second?.column]).toEqual([3, 5, 4, 5]);
});

test("leaves the other classes of an @apply alone", () => {
  const valid = [
    ".a { @apply overflow-hidden overflow-x-clip overflow-y-visible; }",
    ".a { @apply overflow-[hidden] overflow-y-[clip] [overflow:hidden]; }",
    ".a { @apply text-ellipsis scroll-auto overscroll-auto my-overflow-auto overflow-auto-x; }",
    ".a { @apply overflow-(--x) overflow-[var(--scroll)]; }",
    "/* @apply overflow-auto; */",
    // A class is a class only in an @apply.
    '@source inline("overflow-auto");',
    ".overflow-y-auto { color: red; }",
  ];
  for (const source of valid) expect(scanCss(source), source).toEqual([]);
});

test("a native-scroll comment with a reason on the line above allows the declaration", () => {
  expect(
    scanCss(`
pre {
  /* raft-ui: native-scroll a <pre> holds phrasing content only */
  overflow-x: auto;
}
.a {
  /* raft-ui: native-scroll the diagram library's own element */
  @apply p-2 overflow-auto;
}
.b {
  /*
   * raft-ui: native-scroll a comment over
   * several lines
   */
  overflow: scroll;
}`),
  ).toEqual([]);
  // It covers that declaration only, not the next one.
  expect(
    declarations(`
.a {
  /* raft-ui: native-scroll a one-line strip */
  overflow-x: auto;
  overflow-y: auto;
}
.b { overflow: auto; }`),
  ).toEqual(["overflow-y: auto", "overflow: auto"]);
});

test("a native-scroll comment at the end of the line allows the declaration before it", () => {
  expect(
    scanCss(`
.a { overflow-x: auto; /* raft-ui: native-scroll a one-line strip */ }
.b { overflow-x: auto; } /* raft-ui: native-scroll a one-line strip */
.c {
  overflow: auto /* raft-ui: native-scroll a one-line strip */;
  @apply overflow-y-auto; /* raft-ui: native-scroll the library's element */
}`),
  ).toEqual([]);
  // Only the declaration right before it, and never the next line's.
  expect(
    declarations(
      ".a{overflow:auto}.b{overflow:scroll} /* raft-ui: native-scroll one */\n.c { overflow: overlay }",
    ),
  ).toEqual(["overflow: auto", "overflow: overlay"]);
  expect(
    declarations(".a { overflow: auto; color: red; /* raft-ui: native-scroll too far */ }"),
  ).toEqual(["overflow: auto"]);
  // A comment in the middle of a line allows nothing after it on that line.
  expect(
    declarations(".a{overflow:auto}/* raft-ui: native-scroll one */.b{overflow:scroll}"),
  ).toEqual(["overflow: auto", "overflow: scroll"]);
});

test("a native-scroll comment without a reason, or anywhere else, allows nothing", () => {
  const invalid = [
    ".a {\n  /* raft-ui: native-scroll */\n  overflow: auto;\n}",
    ".a {\n  /* raft-ui: native-scroll   */\n  overflow: auto;\n}",
    ".a { overflow: auto; /* raft-ui: native-scroll */ }",
    ".a {\n  /* native-scroll: a reason */\n  overflow: auto;\n}",
    // Two lines above.
    ".a {\n  /* raft-ui: native-scroll a reason */\n\n  overflow: auto;\n}",
    // On the line below.
    ".a {\n  overflow: auto;\n  /* raft-ui: native-scroll a reason */\n}",
    // At the end of the line above: it belongs to that line.
    ".a { /* raft-ui: native-scroll a reason */\n  overflow: auto;\n}",
    // Before the declaration on its own line.
    ".a { /* raft-ui: native-scroll a reason */ overflow: auto; }",
    // Not a comment.
    '.a {\n  --note: "raft-ui: native-scroll a reason";\n  overflow: auto;\n}',
  ];
  for (const source of invalid) expect(declarations(source), source).toEqual(["overflow: auto"]);
});

test("optOut: false returns what a comment allows as well", () => {
  const source = ".a {\n  /* raft-ui: native-scroll a reason */\n  overflow: auto;\n}";
  expect(scanCss(source)).toEqual([]);
  expect(scanCss(source, { optOut: false }).map((f) => f.declaration)).toEqual(["overflow: auto"]);
});

test("globToRegExp matches paths as a shell glob does", () => {
  expect(globToRegExp("**/*.css").test("a.css")).toBe(true);
  expect(globToRegExp("**/*.css").test("a/b/c.css")).toBe(true);
  expect(globToRegExp("**/*.css").test("a/b/c.scss")).toBe(false);
  expect(globToRegExp("*.css").test("a/b.css")).toBe(false);
  expect(globToRegExp("{app,pages}/**/*.css").test("pages/x/y.css")).toBe(true);
  expect(globToRegExp("{app,pages}/**/*.css").test("lib/y.css")).toBe(false);
  expect(globToRegExp("styles/[ab]?.css").test("styles/a1.css")).toBe(true);
  expect(globToRegExp("styles/[ab]?.css").test("styles/c1.css")).toBe(false);
  expect(globToRegExp("a.css").test("abcss")).toBe(false);
});

const root = mkdtempSync(join(tmpdir(), "raft-ui-native-scroll-css-"));
afterAll(() => rmSync(root, { recursive: true, force: true }));

function project(name: string, files: Record<string, string>): string {
  const dir = join(root, name);
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), content);
  }
  return dir;
}

const cli = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: "utf8" });

test("the CLI exits 1 with each report and what to do, and 0 with nothing to report", () => {
  const dirty = project("dirty", {
    "src/mermaid.css": ".mermaid {\n  overflow-x: auto;\n}\n",
    "src/pages/feedback/styles.css": ".log{max-height:10rem;overflow:hidden auto}",
    "src/clean.css": ".a { overflow: hidden; }\n",
    "src/notes.txt": ".a { overflow: auto; }\n",
  });
  const failed = cli(dirty, "src");
  expect(failed.status).toBe(1);
  expect(failed.stdout).toContain("src/mermaid.css:2:3  .mermaid { overflow-x: auto }");
  expect(failed.stdout).toContain(
    "src/pages/feedback/styles.css:1:23  .log { overflow: hidden auto }",
  );
  expect(failed.stdout).toContain("2 native scrollers in 2 CSS files.");
  expect(failed.stdout).toContain("ScrollArea");
  expect(failed.stdout).toContain("useScrollAreaContainer");
  expect(failed.stdout).toContain("<ScrollAreaGutters>");
  expect(failed.stdout).toContain("/* raft-ui: native-scroll <reason> */");
  expect(failed.stdout).toContain(
    "Docs: https://raft-design.botiverse.build/components/scroll-area.md",
  );
  expect(failed.stdout).not.toContain("clean.css");
  expect(failed.stdout).not.toContain("notes.txt");

  const clean = project("clean", {
    "src/a.css": ".a { overflow: hidden; }\n",
    "src/b.css": "pre {\n  /* raft-ui: native-scroll a <pre> of code */\n  overflow-x: auto;\n}\n",
  });
  const passed = cli(clean, "src");
  expect(passed.status).toBe(0);
  expect(passed.stdout).toBe("No native scrollers in 2 CSS files.\n");
});

test("the CLI reads the current directory by default, without node_modules, dist and build", () => {
  const dir = project("default", {
    "styles.css": ".a { overflow: auto; }\n",
    "node_modules/pkg/styles.css": ".b { overflow: auto; }\n",
    "dist/out.css": ".c { overflow: auto; }\n",
    "build/out.css": ".d { overflow: auto; }\n",
    "packages/x/node_modules/y/y.css": ".e { overflow: auto; }\n",
    ".cache/z.css": ".f { overflow: auto; }\n",
  });
  const result = cli(dir);
  expect(result.status).toBe(1);
  expect(result.stdout).toContain("styles.css:1:6  .a { overflow: auto }");
  expect(result.stdout).toContain("1 native scroller in 1 CSS file.");
});

test("the CLI takes files, directories and globs, each file once", () => {
  const dir = project("targets", {
    "app/a.css": ".a { overflow: auto; }\n",
    "app/deep/b.css": ".b { overflow: auto; }\n",
    "pages/c.css": ".c { overflow: auto; }\n",
    "pages/c.scss": ".s { overflow: auto; }\n",
    "lib/d.css": ".d { overflow: auto; }\n",
  });
  const files = (...args: string[]) =>
    (JSON.parse(cli(dir, "--json", ...args).stdout) as { findings: { file: string }[] }).findings
      .map((finding) => finding.file)
      .sort();
  expect(files("app/a.css")).toEqual(["app/a.css"]);
  expect(files("app", "lib")).toEqual(["app/a.css", "app/deep/b.css", "lib/d.css"]);
  expect(files("app/**/*.css")).toEqual(["app/a.css", "app/deep/b.css"]);
  expect(files("app/*.css")).toEqual(["app/a.css"]);
  expect(files("{app,pages}/**/*.css")).toEqual(["app/a.css", "app/deep/b.css", "pages/c.css"]);
  expect(files("**/*.css", "app")).toEqual([
    "app/a.css",
    "app/deep/b.css",
    "lib/d.css",
    "pages/c.css",
  ]);
  // A glob that matches nothing is an error, as a path that doesn't exist is.
  expect(cli(dir, "missing/**/*.css").status).toBe(2);
});

test("the CLI's --json gives the reports to a program, with the same exit code", () => {
  const dir = project("json", { "a.css": ".a {\n  @apply overflow-y-auto;\n}\n" });
  const result = cli(dir, "--json");
  expect(result.status).toBe(1);
  expect(JSON.parse(result.stdout)).toMatchObject({
    files: 1,
    docs: "https://raft-design.botiverse.build/components/scroll-area.md",
    findings: [
      {
        file: "a.css",
        line: 2,
        column: 10,
        selector: ".a",
        declaration: "@apply overflow-y-auto",
        property: "@apply",
        value: "overflow-y-auto",
      },
    ],
  });
  const clean = project("json-clean", { "a.css": ".a { color: red; }\n" });
  const passed = cli(clean, "--json");
  expect(passed.status).toBe(0);
  expect(JSON.parse(passed.stdout)).toMatchObject({ files: 1, findings: [], message: "" });
});

test("the CLI exits 2 on a path that doesn't exist and on an unknown option", () => {
  const dir = project("errors", { "a.css": ".a { overflow: auto; }\n" });
  const missing = cli(dir, "srcc");
  expect(missing.status).toBe(2);
  expect(missing.stderr).toContain("no such file or directory: srcc");
  const option = cli(dir, "--fix");
  expect(option.status).toBe(2);
  expect(option.stderr).toContain("unknown option --fix");
  expect(execFileSync(process.execPath, [SCRIPT, "--help"], { encoding: "utf8" })).toContain(
    "usage: native-scroll-css.mjs",
  );
});

test("raft-ui's own CSS, passed by mistake, is never reported", () => {
  const dir = project("own", {
    "node_modules/@botiverse/raft-ui/dist/styles.css": ".r { overflow: auto; }\n",
    "node_modules/other/styles.css": ".o { overflow: auto; }\n",
  });
  const own = run(["node_modules/@botiverse/raft-ui/dist"], dir);
  expect(own).toMatchObject({ code: 0, stdout: "No native scrollers in 0 CSS files.\n" });
  // Another package's CSS is read when it is named.
  expect(run(["node_modules/other/styles.css"], dir).code).toBe(1);
});

test("a comment on the line above allows only the first statement of the next line", () => {
  const marker = "/* raft-ui: native-scroll the editor scrolls itself */";
  // One rule on one line: allowed.
  expect(declarations(`${marker}\n.a { overflow: auto }`)).toEqual([]);
  expect(declarations(`${marker}\n@media (width > 1px) { .a { overflow: auto } }`)).toEqual([]);
  // Two declarations on the next line: the second is reported.
  expect(declarations(`.a {\n  ${marker}\n  overflow-x: auto; overflow-y: scroll;\n}`)).toEqual([
    "overflow-y: scroll",
  ]);
  // A minified line: one comment doesn't allow the line.
  expect(
    declarations(`${marker}\n.a{overflow:auto}.b{color:red}.c{overflow:scroll}.d{overflow-y:auto}`),
  ).toEqual(["overflow: scroll", "overflow-y: auto"]);
  expect(
    declarations(`@media (width > 1px) {\n${marker}\n.a{overflow:auto} .b{overflow:auto}\n}`),
  ).toEqual(["overflow: auto"]);
  // A comment inside an earlier rule of the same line is not "above" the next rule.
  expect(declarations(`.a{\n${marker}\n} .b { overflow: auto }`)).toEqual(["overflow: auto"]);
  expect(declarations(`.a { color: red }\n${marker}\n.b{} .c { overflow: auto }`)).toEqual([
    "overflow: auto",
  ]);
});

test("the opt-out comment starts with the marker and gives a reason in words", () => {
  expect(
    declarations("/* TODO: drop the raft-ui: native-scroll comments */\n.a { overflow: auto }"),
  ).toEqual(["overflow: auto"]);
  expect(declarations("/* raft-ui: native-scroll ***** */\n.a { overflow: auto }")).toEqual([
    "overflow: auto",
  ]);
  expect(
    declarations("/**\n * raft-ui: native-scroll a code block\n */\n.a { overflow: auto }"),
  ).toEqual([]);
});

test("a glob that matches no file exits 2, and a folder with no CSS exits 0", () => {
  const dir = mkdtempSync(join(tmpdir(), "native-scroll-css-empty-"));
  try {
    mkdirSync(join(dir, "src"));
    const missed = run(["nope/*.css"], dir);
    expect(missed.code).toBe(2);
    expect(missed.stderr).toContain("no CSS files match: nope/*.css");
    expect(run(["src/**/*.css"], dir).code).toBe(2);
    expect(run(["src"], dir).code).toBe(0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a folder linked into itself is read once", () => {
  const dir = mkdtempSync(join(tmpdir(), "native-scroll-css-loop-"));
  try {
    mkdirSync(join(dir, "src"));
    writeFileSync(join(dir, "src", "a.css"), ".a { overflow: auto }");
    symlinkSync(join(dir, "src"), join(dir, "src", "again"), "dir");
    symlinkSync(dir, join(dir, "src", "up"), "dir");
    const result = run(["--json"], dir);
    expect(result.code).toBe(1);
    expect(JSON.parse(result.stdout).findings).toHaveLength(1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
