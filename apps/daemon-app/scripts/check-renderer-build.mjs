import { promises as fs } from "node:fs";
import path from "node:path";

const rendererAssetsDir = path.resolve("dist/renderer/assets");
const unresolvedDirectives = [/[@]apply\b/, /[@]tailwind\b/, /@import\s+["']tailwindcss["']/];

async function main() {
  const entries = await fs.readdir(rendererAssetsDir, { withFileTypes: true });
  const cssFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".css"));

  if (cssFiles.length === 0) {
    throw new Error(`No renderer CSS bundle found under ${rendererAssetsDir}.`);
  }

  for (const file of cssFiles) {
    const filePath = path.join(rendererAssetsDir, file.name);
    const content = await fs.readFile(filePath, "utf8");
    const match = unresolvedDirectives.find((pattern) => pattern.test(content));
    if (match) {
      throw new Error(`Renderer CSS bundle still contains unresolved Tailwind directives: ${file.name}`);
    }
  }
}

await main();
