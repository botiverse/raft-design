import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const packagePath = resolve(process.cwd(), "../../packages/ui");
const repositoryPath = resolve(process.cwd(), "../..");
const temporaryConsumers: string[] = [];

function run(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with status ${result.status}\n${result.error ?? ""}\n${result.stdout}\n${result.stderr}`,
    );
  }
  return result;
}

function createTrackedPackageRepository() {
  const artifactDirectory = mkdtempSync(`${tmpdir()}/raft-ui-git-artifact-`);
  temporaryConsumers.push(artifactDirectory);
  run("git", ["diff", "--quiet", "HEAD", "--", "packages/ui"], repositoryPath);
  const trackedFiles = run("git", ["ls-files", "-z", "--", "packages/ui"], repositoryPath)
    .stdout.split("\0")
    .filter(Boolean);

  for (const file of trackedFiles) {
    const destination = resolve(artifactDirectory, file);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(resolve(repositoryPath, file), destination);
  }

  run("git", ["init", "--quiet"], artifactDirectory);
  run("git", ["config", "user.name", "raft-ui contract"], artifactDirectory);
  run("git", ["config", "user.email", "raft-ui-contract@example.invalid"], artifactDirectory);
  run("git", ["add", "--force", "packages/ui"], artifactDirectory);
  run("git", ["commit", "--quiet", "-m", "export tracked raft-ui artifact"], artifactDirectory);

  return {
    artifactDirectory,
    commit: run("git", ["rev-parse", "HEAD"], artifactDirectory).stdout.trim(),
  };
}

afterEach(() => {
  for (const directory of temporaryConsumers.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("raft-ui source package", () => {
  it("generates an external consumer lockfile without workspace catalog support", () => {
    const consumerDirectory = mkdtempSync(`${tmpdir()}/raft-ui-source-consumer-`);
    temporaryConsumers.push(consumerDirectory);
    writeFileSync(
      `${consumerDirectory}/package.json`,
      JSON.stringify({
        name: "raft-ui-source-consumer",
        private: true,
        dependencies: { "raft-ui": `file:${packagePath}` },
      }),
    );

    run(
      "pnpm",
      ["install", "--lockfile-only", "--ignore-scripts", "--dir", consumerDirectory],
      repositoryPath,
    );

    const lockfile = readFileSync(`${consumerDirectory}/pnpm-lock.yaml`, "utf8");
    expect(lockfile).toContain(`specifier: file:${packagePath}`);
    expect(lockfile).not.toContain("catalog:");
  });

  it("builds and imports from a clean Git artifact without ignored dist files", () => {
    const consumerDirectory = mkdtempSync(`${tmpdir()}/raft-ui-git-consumer-`);
    temporaryConsumers.push(consumerDirectory);
    const { artifactDirectory, commit } = createTrackedPackageRepository();
    const gitSpecifier = `git+file://${artifactDirectory}#${commit}&path:/packages/ui`;

    writeFileSync(
      `${consumerDirectory}/package.json`,
      JSON.stringify({
        name: "raft-ui-git-consumer",
        private: true,
        type: "module",
        dependencies: { "raft-ui": gitSpecifier },
      }),
    );

    run(
      "pnpm",
      ["install", "--lockfile-only", "--ignore-scripts", "--dir", consumerDirectory],
      repositoryPath,
    );
    run("pnpm", ["install", "--frozen-lockfile", "--dir", consumerDirectory], repositoryPath);

    const packageDirectory = `${consumerDirectory}/node_modules/raft-ui`;
    expect(existsSync(`${packageDirectory}/dist/index.mjs`)).toBe(true);
    run(
      "node",
      [
        "--input-type=module",
        "--eval",
        'const ui = await import("raft-ui"); if (typeof ui.resolveThemePreset !== "function") process.exit(1);',
      ],
      consumerDirectory,
    );
    expect(readFileSync(`${packageDirectory}/package.json`, "utf8")).toContain('"dist"');
  }, 30_000);
});
