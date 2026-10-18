// Emits the Markdown twin of the docs site into the built client assets:
//   /<page>.md     one file per documentation page
//   /llms.txt      index of those pages (https://llmstxt.org)
//   /llms-full.txt every page concatenated
// Runs after `vp build`; the pages are rendered from the same React routes as
// the HTML, with `markdown-mode` switching off the interactive chrome.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const sections = [
  ["Foundations", "/foundations/"],
  ["Components", "/components/"],
  ["Patterns", "/patterns/"],
  ["Products", "/products/"],
  ["Decisions", "/decisions/"],
  ["Guides", "/guides/"],
  ["Tokens", "/tokens/"],
];

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = join(root, "dist/client");
const origin = "https://raft-design.botiverse.build";

const server = await createServer({
  root,
  configFile: join(root, "vite.llms.config.ts"),
  logLevel: "warn",
  appType: "custom",
  server: { middlewareMode: true, hmr: false, ws: false },
});
let pages;
try {
  const { renderMarkdownPages } = await server.ssrLoadModule("/src/llms/render.tsx");
  // Section order, so llms-full.txt reads in the same order as llms.txt.
  const rank = (page) => sections.findIndex(([, prefix]) => page.path.startsWith(prefix));
  pages = (await renderMarkdownPages()).sort((a, b) => rank(a) - rank(b));
} finally {
  await server.close();
}

for (const page of pages) {
  const file = join(outDir, `${page.path}.md`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${page.markdown}\n`);
}

/** First prose paragraph after the title, used as the link description. */
function summaryOf(markdown) {
  const paragraph = markdown
    .split(/\n{2,}/)
    .slice(1)
    .find((block) => /^[A-Za-z`*_]/.test(block.trim()));
  return paragraph?.replace(/\s+/g, " ").trim();
}

const index = [
  "# Raft Design System",
  "",
  "> raft-ui: the React implementation of the Raft Design System, built on Base UI and styled with tailwind-variants. " +
    "Every page below is also served as HTML at the same path without `.md`.",
  "",
];
for (const [heading, prefix] of sections) {
  const entries = pages.filter((page) => page.path.startsWith(prefix));
  if (entries.length === 0) continue;
  index.push(`## ${heading}`, "");
  for (const page of entries) {
    const summary = page.summary ?? summaryOf(page.markdown);
    index.push(`- [${page.title}](${origin}${page.path}.md)${summary ? `: ${summary}` : ""}`);
  }
  index.push("");
}

await writeFile(join(outDir, "llms.txt"), index.join("\n"));
await writeFile(
  join(outDir, "llms-full.txt"),
  `${pages.map((page) => `<!-- ${origin}${page.path} -->\n\n${page.markdown}`).join("\n\n---\n\n")}\n`,
);

console.log(`llms: wrote ${pages.length} Markdown pages, llms.txt and llms-full.txt`);
