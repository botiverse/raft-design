import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(pkg.name === "@slock-ai/cli", "package name must remain @slock-ai/cli");
assert(pkg.private !== true, "package must not be private");
assert(pkg.publishConfig?.access === "public", "publishConfig.access must be public");
assert(pkg.bin?.slock === "dist/index.js", "slock bin must point at dist/index.js");
assert(Array.isArray(pkg.files) && pkg.files.includes("dist"), "published package must include dist/");
assert(!pkg.dependencies?.["@slock-ai/shared"], "@slock-ai/shared is not published; keep it bundled from devDependencies");
assert(pkg.devDependencies?.["@slock-ai/shared"] === "workspace:*", "@slock-ai/shared must remain a workspace build input");

console.log("@slock-ai/cli publish package metadata is valid.");
