import fs from "node:fs";
import path from "node:path";

export function inspectElectronInstall(
  electronPackageDir,
  { existsSync = fs.existsSync, readFileSync = fs.readFileSync } = {},
) {
  const pathFile = path.join(electronPackageDir, "path.txt");
  if (!existsSync(pathFile)) {
    return {
      ok: false,
      problem: "missing-path-file",
      pathFile,
    };
  }

  const relativeExecutablePath = readFileSync(pathFile, "utf8").trim();
  if (!relativeExecutablePath) {
    return {
      ok: false,
      problem: "empty-path-file",
      pathFile,
    };
  }

  const executablePath = path.join(electronPackageDir, "dist", relativeExecutablePath);
  if (!existsSync(executablePath)) {
    return {
      ok: false,
      problem: "missing-binary",
      pathFile,
      executablePath,
      relativeExecutablePath,
    };
  }

  return {
    ok: true,
    pathFile,
    executablePath,
    relativeExecutablePath,
  };
}

export function buildElectronInstallError(
  inspection,
  {
    rebuildCommand = "pnpm rebuild electron",
    reinstallCommand = "pnpm install",
    retryCommand = "pnpm --filter @slock-ai/daemon-app run start:isolated",
  } = {},
) {
  const details = {
    "missing-path-file": `Missing ${inspection.pathFile}. Electron's postinstall step did not finish cleanly.`,
    "empty-path-file": `Electron path file is empty at ${inspection.pathFile}.`,
    "missing-binary": `Electron binary is missing at ${inspection.executablePath}.`,
  };
  const detail = details[inspection.problem] ?? "Electron is not installed correctly in this workspace.";

  return [
    "Electron is not installed correctly in this workspace.",
    detail,
    "This is an environment/install problem, not a daemon-app runtime crash.",
    "",
    "Try from the repo root:",
    `  ${rebuildCommand}`,
    `  ${retryCommand}`,
    "",
    "If that still fails, rerun:",
    `  ${reinstallCommand}`,
    "",
    "Make sure package install scripts are enabled (no --ignore-scripts).",
  ].join("\n");
}
