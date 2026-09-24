// Writes /sitemap.xml from the prerendered pages in `dist/client`.
//
// TanStack Start's built-in `sitemap` option is not used: it lists every
// crawled link verbatim, so it emits query-string and #fragment variants of the
// same page, omits the trailing slash the site redirects to (every entry would
// be a 307), and declares the urlset namespace as https:// where the protocol
// requires http://.
import { readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const origin = "https://rui.botiverse.build";
const outDir = fileURLToPath(new URL("../dist/client", import.meta.url));

/** Test fixtures for embedded demos, not pages anyone should land on. */
const EXCLUDED_PREFIXES = ["/iframe/"];

const entries = await readdir(outDir, { recursive: true, withFileTypes: true });
const paths = entries
  .filter((entry) => entry.isFile() && entry.name === "index.html")
  .map((entry) => {
    const dir = relative(outDir, entry.parentPath).split(sep).join("/");
    return dir ? `/${dir}/` : "/";
  })
  .filter((path) => !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix)))
  .sort();

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>${origin}${path}</loc></url>`),
  "</urlset>",
  "",
].join("\n");

await writeFile(join(outDir, "sitemap.xml"), xml);
console.log(`sitemap: wrote ${paths.length} URLs`);
