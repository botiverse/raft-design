import path from "node:path";
import { createRequire } from "node:module";
import { buildElectronInstallError, inspectElectronInstall } from "./electron-install.mjs";

const require = createRequire(import.meta.url);

function main() {
  let electronPackageDir;
  try {
    electronPackageDir = path.dirname(require.resolve("electron/package.json"));
  } catch {
    throw new Error(
      [
        "Electron is not installed in this workspace.",
        "Run `pnpm install` from the repo root, then retry `pnpm --filter @slock-ai/daemon-app run start:isolated`.",
      ].join("\n"),
    );
  }

  const inspection = inspectElectronInstall(electronPackageDir);
  if (!inspection.ok) {
    throw new Error(buildElectronInstallError(inspection));
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
