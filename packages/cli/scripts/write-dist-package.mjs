import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(
  join(root, "dist", "package.json"),
  JSON.stringify({ name: pkg.name, version: pkg.version, type: pkg.type }, null, 2) + "\n",
);
