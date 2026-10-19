// Emits the agent surfaces of the docs site into the built client assets:
//   /<page>.md        one file per documentation page, from its Markdown source
//   /llms.txt         index of those pages (https://llmstxt.org), by section
//   /llms-full.txt    every page concatenated, in the same order
//   /components.json  every component with its status, names and URLs
// Runs after `vp build` (src/llms/render.tsx, apps/doc/DESIGN.md §7).
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

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
let components;
let sections;
const inSection = (page, path) => page.path === path || page.path.startsWith(`${path}/`);
try {
  const { renderMarkdownPages, renderComponentIndex, llmsSections } =
    await server.ssrLoadModule("/src/llms/render.tsx");
  // The site's section order (src/lib/content/pages.ts), so llms-full.txt
  // reads in the same order as llms.txt.
  sections = llmsSections();
  const rank = (page) => sections.findIndex((section) => inSection(page, section.path));
  pages = (await renderMarkdownPages()).sort((a, b) => rank(a) - rank(b));
  components = renderComponentIndex();
} finally {
  await server.close();
}

for (const page of pages) {
  const file = join(outDir, `${page.path}.md`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${page.markdown}\n`);
}

const index = [
  "# Raft Design System",
  "",
  "> The design language of every Raft product, and raft-ui, its React implementation (Base UI and tailwind-variants). " +
    "Every page below is also served as HTML at the same path without `.md`; " +
    `${origin}/components.json lists every component with its status, other names and URLs.`,
  "",
];
for (const { heading, path } of sections) {
  const entries = pages.filter((page) => inSection(page, path));
  if (entries.length === 0) continue;
  index.push(`## ${heading}`, "");
  let group;
  for (const page of entries) {
    if (page.group && page.group !== group) {
      if (index.at(-1) !== "") index.push("");
      index.push(`### ${page.group}`, "");
      group = page.group;
    }
    index.push(`- [${page.title}](${origin}${page.path}.md): ${page.summary}`);
  }
  index.push("");
}

await writeFile(join(outDir, "llms.txt"), index.join("\n"));
await writeFile(
  join(outDir, "llms-full.txt"),
  `${pages.map((page) => `<!-- ${origin}${page.path} -->\n\n${page.markdown}`).join("\n\n---\n\n")}\n`,
);

await writeFile(join(outDir, "components.json"), `${JSON.stringify(components, null, 2)}\n`);

console.log(
  `llms: wrote ${pages.length} Markdown pages, llms.txt, llms-full.txt and components.json (${components.length} components)`,
);
