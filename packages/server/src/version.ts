import { createRequire } from "node:module";

// Read the server's own semver from `packages/server/package.json` at runtime
// so traces / logs / future API responses can attribute themselves to a
// concrete release. Pattern mirrors `readDaemonVersion()` in
// `packages/daemon/src/core.ts`.
//
// The convention (per #engineering:3525a4de 2026-05-03):
// - server + web share one semver, bumped together in each release-notes PR.
// - independent of daemon — daemon ships out-of-band on its own tags.
// - starts at 0.1.0; not yet surfaced to users (single deployment), but the
//   server itself needs the version for tracing.

export function readServerVersion(moduleUrl: string = import.meta.url): string {
  try {
    const require = createRequire(moduleUrl);
    return require("../package.json").version as string;
  } catch {
    return "0.0.0-dev";
  }
}

export const SERVER_VERSION = readServerVersion();
