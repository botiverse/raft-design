import { defineConfig } from "bumpp";
import { execFile } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);

export default defineConfig({
  files: ["packages/ui/package.json"],
  all: true,
  commit: "chore(release): v%s",
  tag: "v%s",
  push: true,
  async execute() {
    const rootDir = process.cwd();
    const uiDir = join(rootDir, "packages/ui");
    const { stdout } = await exec(
      "vp",
      [
        "exec",
        "conventional-changelog",
        "-p",
        "conventionalcommits",
        "--pkg",
        "packages/ui/package.json",
        "--commit-path",
        "packages/ui",
        "--stdout",
      ],
      { cwd: rootDir, maxBuffer: 1024 * 1024 * 10 },
    );
    const changelogPath = join(uiDir, "CHANGELOG.md");

    await writeFile(changelogPath, stdout);
    await exec("git", ["add", "packages/ui/CHANGELOG.md"], { cwd: rootDir });
  },
});
