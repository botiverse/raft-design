import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";

async function collectTestFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectTestFiles(entryPath);
    }
    if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      return [entryPath];
    }
    return [];
  }));
  return files.flat();
}

function runNodeTests(testFiles) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--import", "tsx", "--test", ...testFiles],
      {
        cwd: process.cwd(),
        stdio: "inherit",
        env: process.env,
      },
    );

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Node test runner terminated by signal ${signal}.`));
        return;
      }
      resolve(code ?? 1);
    });
  });
}

async function main() {
  const testFiles = (await collectTestFiles(path.join(process.cwd(), "src"))).sort((left, right) => left.localeCompare(right));
  if (testFiles.length === 0) {
    console.error("No daemon-app unit tests were found under src/.");
    process.exit(1);
  }
  process.exitCode = await runNodeTests(testFiles);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
