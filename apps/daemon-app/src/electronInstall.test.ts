import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { buildElectronInstallError, inspectElectronInstall } from "../scripts/electron-install.mjs";

test("inspectElectronInstall detects missing path.txt", () => {
  const inspection = inspectElectronInstall("/repo/node_modules/electron", {
    existsSync(targetPath) {
      return targetPath !== path.join("/repo/node_modules/electron", "path.txt");
    },
    readFileSync() {
      return "";
    },
  });

  assert.deepEqual(inspection, {
    ok: false,
    problem: "missing-path-file",
    pathFile: "/repo/node_modules/electron/path.txt",
  });
});

test("inspectElectronInstall detects missing binary from path.txt", () => {
  const inspection = inspectElectronInstall("/repo/node_modules/electron", {
    existsSync(targetPath) {
      return targetPath === path.join("/repo/node_modules/electron", "path.txt");
    },
    readFileSync() {
      return "Electron.app/Contents/MacOS/Electron";
    },
  });

  assert.deepEqual(inspection, {
    ok: false,
    problem: "missing-binary",
    pathFile: "/repo/node_modules/electron/path.txt",
    executablePath: "/repo/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron",
    relativeExecutablePath: "Electron.app/Contents/MacOS/Electron",
  });
});

test("inspectElectronInstall resolves a valid executable path", () => {
  const executablePath = "/repo/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron";
  const inspection = inspectElectronInstall("/repo/node_modules/electron", {
    existsSync(targetPath) {
      return (
        targetPath === path.join("/repo/node_modules/electron", "path.txt") || targetPath === executablePath
      );
    },
    readFileSync() {
      return "Electron.app/Contents/MacOS/Electron";
    },
  });

  assert.deepEqual(inspection, {
    ok: true,
    pathFile: "/repo/node_modules/electron/path.txt",
    executablePath,
    relativeExecutablePath: "Electron.app/Contents/MacOS/Electron",
  });
});

test("buildElectronInstallError gives actionable recovery steps", () => {
  const message = buildElectronInstallError({
    ok: false,
    problem: "missing-binary",
    pathFile: "/repo/node_modules/electron/path.txt",
    executablePath: "/repo/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron",
    relativeExecutablePath: "Electron.app/Contents/MacOS/Electron",
  });

  assert.match(message, /Electron is not installed correctly in this workspace\./);
  assert.match(message, /pnpm rebuild electron/);
  assert.match(message, /pnpm --filter @slock-ai\/daemon-app run start:isolated/);
  assert.match(message, /pnpm install/);
  assert.match(message, /no --ignore-scripts/);
});
