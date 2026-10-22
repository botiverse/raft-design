// Writes /sitemap.xml from the prerendered pages in `dist/client`.
//
// TanStack Start's built-in `sitemap` option is not used: it lists every
// crawled link verbatim, so it emits query-string and #fragment variants of the
// same page, omits the trailing slash the site redirects to (every entry would
// be a 307), and declares the urlset namespace as https:// where the protocol
// requires http://.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const origin = "https://raft-design.botiverse.build";
const outDir = fileURLToPath(new URL("../dist/client", import.meta.url));

/**
 * The site's sections in reading order (SECTIONS in src/lib/content/pages.ts,
 * then the changelog). The home page comes first; any path outside them comes
 * last.
 */
const SECTION_ORDER = [
  "principles",
  "people-and-agents",
  "foundations",
  "content",
  "patterns",
  "components",
  "products",
  "about",
  "decisions",
  "changelog",
];

function rank(path) {
  if (path === "/") return -1;
  const index = SECTION_ORDER.indexOf(path.split("/")[1]);
  return index === -1 ? SECTION_ORDER.length : index;
}

/** Test fixtures for embedded demos, not pages anyone should land on. */
const EXCLUDED_PREFIXES = ["/iframe/"];

const entries = await readdir(outDir, { recursive: true, withFileTypes: true });
const paths = entries
  .filter((entry) => entry.isFile() && entry.name === "index.html")
  .map((entry) => {
    const dir = relative(outDir, entry.parentPath).split(sep).join("/");
    return dir ? `/${dir}/` : "/";
  })
  .filter((path) => !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix)));

/**
 * A page under another language's prefix that still shows the English text
 * says `noindex` (src/routes/__root.tsx); it is not that language's page.
 */
const NOINDEX = /<meta name="robots" content="noindex"/;
const indexed = [];
for (const path of paths) {
  const html = await readFile(join(outDir, path, "index.html"), "utf8");
  if (!NOINDEX.test(html)) indexed.push(path);
}

/** `/zh/foundations/` ranks as `/foundations/`, after it. */
const LANGUAGE_PREFIX = /^\/zh(?=\/)/;
const unprefixed = (path) => path.replace(LANGUAGE_PREFIX, "");
indexed.sort(
  (a, b) =>
    rank(unprefixed(a)) - rank(unprefixed(b)) ||
    unprefixed(a).localeCompare(unprefixed(b)) ||
    a.localeCompare(b),
);

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...indexed.map((path) => `  <url><loc>${origin}${path}</loc></url>`),
  "</urlset>",
  "",
].join("\n");

await writeFile(join(outDir, "sitemap.xml"), xml);
console.log(`sitemap: wrote ${indexed.length} URLs`);
