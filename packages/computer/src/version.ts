import { createRequire } from "node:module";

export function readComputerVersion(moduleUrl: string = import.meta.url): string {
  try {
    const require = createRequire(moduleUrl);
    const pkg = require("../package.json") as { version?: unknown };
    return typeof pkg.version === "string" && pkg.version.length > 0 ? pkg.version : "0.0.0-dev";
  } catch {
    return "0.0.0-dev";
  }
}

export const COMPUTER_VERSION = readComputerVersion();
