import { readFileSync } from "node:fs";

const FALLBACK_VERSION = "0.0.0";

function readVersionFrom(candidate: URL): string | null {
  try {
    const pkg = JSON.parse(readFileSync(candidate, "utf8"));
    return typeof pkg.version === "string" && pkg.version ? pkg.version : null;
  } catch {
    return null;
  }
}

export function readCliVersion(baseUrl: string = import.meta.url): string {
  return (
    // Built package and daemon-bundled CLI: dist/package.json travels with dist/index.js.
    readVersionFrom(new URL("./package.json", baseUrl))
    // Source-run CLI: package.json is one level above src/.
    ?? readVersionFrom(new URL("../package.json", baseUrl))
    ?? FALLBACK_VERSION
  );
}
