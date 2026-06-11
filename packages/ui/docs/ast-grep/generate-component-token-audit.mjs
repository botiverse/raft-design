#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const UI_ROOT = path.resolve(import.meta.dirname, "../..");
const RULE_FILE = path.join(import.meta.dirname, "token-migration-audit.yml");
const OUTPUT = path.join(UI_ROOT, "docs/component-token-usage-audit.md");

const SCOPES = [
  {
    title: "packages/ui/src/components",
    paths: [path.join(UI_ROOT, "src/components")],
    extensions: [".tsx"],
  },
  {
    title: "packages/ui/src/style entrypoints",
    paths: [path.join(UI_ROOT, "src/styles.css"), path.join(UI_ROOT, "src/styles-v2.css")],
    extensions: [".css"],
  },
];

function listFiles(entryPath, extensions) {
  if (fs.statSync(entryPath).isFile()) {
    return extensions.some((ext) => entryPath.endsWith(ext)) ? [entryPath] : [];
  }

  const out = [];
  for (const name of fs.readdirSync(entryPath).sort()) {
    const full = path.join(entryPath, name);
    if (fs.statSync(full).isDirectory()) out.push(...listFiles(full, extensions));
    else if (extensions.some((ext) => name.endsWith(ext))) out.push(full);
  }
  return out;
}

function rel(filePath) {
  return `packages/ui/${path.relative(UI_ROOT, filePath).replaceAll("\\", "/")}`;
}

function scanFiles(files) {
  if (!files.length) return [];

  const raw = execFileSync("sg", ["scan", `--rule=${RULE_FILE}`, "--json=stream", ...files], {
    cwd: path.join(UI_ROOT, "..", ".."),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

  const matches = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    matches.push({
      file: row.file,
      line: row.range.start.line + 1,
      text: row.text.trim(),
    });
  }

  return matches;
}

function groupByFile(matches) {
  const map = new Map();
  for (const hit of matches) {
    if (!map.has(hit.file)) map.set(hit.file, []);
    const list = map.get(hit.file);
    if (!list.some((item) => item.line === hit.line && item.text === hit.text)) {
      list.push(hit);
    }
  }

  for (const list of map.values()) {
    list.sort((a, b) => a.line - b.line || a.text.localeCompare(b.text));
  }
  return map;
}

function escapeCell(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .join("<br>")
    .replaceAll("|", "\\|");
}

function formatFileSection(filePath, hits) {
  const displayPath = rel(filePath);
  if (!hits.length) {
    return `### \`${displayPath}\` (0 hits)\n- No direct old-token/style-token migration hits.\n\n`;
  }

  let out = `### \`${displayPath}\` (${hits.length} hits)\n`;
  out += "| Line | Current code |\n| ---: | --- |\n";
  for (const hit of hits) {
    out += `| ${hit.line} | \`${escapeCell(hit.text)}\` |\n`;
  }
  out += "\n";
  return out;
}

function scopeStats(files, grouped) {
  let hits = 0;
  let withHits = 0;
  for (const file of files) {
    const count = grouped.get(file)?.length ?? 0;
    hits += count;
    if (count) withHits++;
  }
  return { files: files.length, withHits, hits };
}

const grouped = groupByFile(
  SCOPES.flatMap((scope) => scanFiles(scope.paths.flatMap((p) => listFiles(p, scope.extensions)))),
);

let md = `# Component Token Usage Audit

Generated with [ast-grep](https://ast-grep.github.io/) from current source. This is the completion gate for the migration plan in [token-theme-architecture.md](./token-theme-architecture.md).

**Scope:** \`packages/ui/src/components\`, \`packages/ui/src/styles.css\`, and \`packages/ui/src/styles-v2.css\` only. \`packages/ui/src/legacy\` and \`packages/ui/src/themes\` are intentionally excluded because \`styles.css\` is now the official entrypoint and \`styles-v2.css\` remains an explicit alias.

**Rules:** \`packages/ui/docs/ast-grep/token-migration-audit.yml\`

**Detection:** AST string literals in TSX (tailwind-variants / \`className\` recipe strings) and CSS declarations/comments that reference old semantic aliases, component-scoped CSS variables, brutal hardcoded utilities, arbitrary shadow bridges, hex/HSL colors, or old unsuffixed semantic utilities.

**Regenerate:**

\`\`\`sh
node packages/ui/docs/ast-grep/generate-component-token-audit.mjs
\`\`\`

`;

const scopeRows = [];

for (const scope of SCOPES) {
  const files = scope.paths.flatMap((p) => listFiles(p, scope.extensions));
  md += `## ${scope.title}\n\n`;
  for (const file of files) {
    md += formatFileSection(file, grouped.get(file) ?? []);
  }
  scopeRows.push({ label: `\`${scope.title}\``, ...scopeStats(files, grouped) });
}

const total = scopeRows.reduce(
  (acc, row) => ({
    files: acc.files + row.files,
    withHits: acc.withHits + row.withHits,
    hits: acc.hits + row.hits,
  }),
  { files: 0, withHits: 0, hits: 0 },
);

md += `## Summary\n\n`;
md += `| Scope | Files scanned | Files with hits | Total hits |\n| --- | ---: | ---: | ---: |\n`;
for (const row of scopeRows) {
  md += `| ${row.label} | ${row.files} | ${row.withHits} | ${row.hits} |\n`;
}
md += `| **Total** | ${total.files} | ${total.withHits} | ${total.hits} |\n\n`;

md += `### Hit categories\n\n`;
md += `- **Hardcoded brutal shade utilities** (\`border-black\`, \`text-black\`, \`bg-white\`, \`bg-black/*\`, \`bg-brutal-*-400\`, etc.): replace with \`line-*\`, \`foreground-*\`, \`layer-*\`, \`primary/accent/secondary-*\`, \`info/success/warning/danger-*\`, or unsuffixed brutal base aliases where the component contract is intentionally palette-specific.\n`;
md += `- **Legacy semantic Tailwind aliases** (\`surface-*\`, \`action-*\`, \`information-*\`, \`destructive-*\`, \`neutral-*\`, \`muted-foreground\`, \`border-border\`): not allowed in components or style entrypoints.\n`;
md += `- **Component-scoped CSS variables** (\`--input-*\`, \`--dropdown-*\`, \`--tabs-*\`, \`--badge-*\`, \`--checkbox-*\`, \`--button-*\`, \`--list-item-*\`, \`--kbd-*\`, \`--banner-*\`): not allowed in components.\n`;
md += `- **Arbitrary shadow bridges** (\`shadow-[var(--shadow*)]\`, \`[box-shadow:var(--surface-shadow*)]\`): replace with unified \`shadow-*\` scale.\n`;
md += `- **Non-OKLCH authored colors** (hex and \`hsl/hsla\`): remove from CSS and component recipes.\n\n`;

md += `### Completeness status\n\n`;
md +=
  total.hits === 0
    ? `This audit currently has **0 hits** in the migration scope. Static old-token usage is clean for \`styles.css\`, \`styles-v2.css\`, and current component recipes.\n\n`
    : `This audit is **not clean enough to declare the migration done**. Resolve every hit in this file, then rerun the generator.\n\n`;
md += `What this file proves:\n\n`;
md += `- Every listed hit is a migration blocker in the scanned scope.\n`;
md += `- A zero-hit result means component recipes and style entrypoints no longer depend on old alias utilities or component-scoped token variables.\n\n`;
md += `What this file does **not** prove by itself:\n\n`;
md += `- It does not prove brutal visual parity by itself; Browser source comparison is still required.\n`;
md += `- It does not prove every variant/state is represented in docs.\n`;
md += `- It does not prove old aliases are unused by external package consumers.\n`;
md += `- It does not prove elegant parity; elegant may intentionally remain partially degraded while the new token contract stabilizes.\n\n`;

md += `### Brutal parity gate\n\n`;
md += `Brutal is the source-faithful theme. A component is not done until these are true:\n\n`;
md += `- All brutal hardcoded values are replaced by the new token utilities or theme values.\n`;
md += `- Default, hover, active/pressed, focus-visible, disabled, selected/checked, invalid, and loading states match the legacy/source appearance where the component supports those states.\n`;
md += `- Borders, offset shadows, fills, foreground opacity, focus rings, radius, and spacing are checked against the source comparison for that component.\n`;
md += `- Any intentional API difference is documented in the component docs, but visual differences in brutal require an explicit exception.\n`;
md += `- The docs app is checked in \`theme=brutal\` after the component is migrated.\n\n`;

md += `### Elegant tolerance gate\n\n`;
md += `Elegant can lag behind brutal, but its gaps must be explicit:\n\n`;
md += `- Elegant must use the same public token contract as brutal.\n`;
md += `- Elegant may use approximate values where there is no approved design source yet.\n`;
md += `- Any missing elegant polish should be recorded as WIP/Todo instead of keeping old component aliases alive.\n`;
md += `- Elegant dark-mode regressions should be documented if not fixed in the same phase.\n\n`;

md += `### Suggested migration order (components only)\n\n`;
md += `1. **Phase 1** — create \`styles-v2.css\` as the pure token contract.\n`;
md += `2. **Phase 2** — migrate component recipes to token utilities.\n`;
md += `3. **Phase 3** — switch docs to the token contract for Browser comparison.\n`;
md += `4. **Phase 4** — promote \`@slock/ui/styles.css\` to the official entrypoint.\n`;
md += `5. **Phase 5** — run Browser source/current checks for brutal component pages.\n\n`;

md += `### Post-migration verification (ast-grep)\n\n`;
md += `\`\`\`sh\n`;
md += `sg scan --rule packages/ui/docs/ast-grep/token-migration-audit.yml packages/ui/src/components packages/ui/src/styles.css packages/ui/src/styles-v2.css\n`;
md += `rg -n "surface-|action-|information-|destructive-|muted-foreground|neutral-|border-border|ring-ring|shadow-\\\\[var\\\\(--|\\\\[box-shadow:var\\\\(--" packages/ui/src/components packages/ui/src/styles.css packages/ui/src/styles-v2.css\n`;
md += `\`\`\`\n`;

fs.writeFileSync(OUTPUT, md);
console.log(`Wrote ${OUTPUT} (${total.hits} hits across ${total.files} files)`);
