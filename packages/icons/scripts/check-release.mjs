#!/usr/bin/env node
// Fails a release whose ricons code changed while its version did not: the
// publish step skips a version already on npm, so the change would ship under
// that stale version with no error (.github/workflows/publish.yml).
//
//   node packages/icons/scripts/check-release.mjs <tag>
//
// It compares the tag with the previous `v*` tag: the files that go into
// ricons' package (packages/icons/src, minus tests and docs), and the version
// in packages/icons/package.json.
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const SOURCE = "packages/icons/src/";
const MANIFEST = "packages/icons/package.json";

/** A file under src that is built into dist, not a test or a doc. */
export function shipped(file) {
  return file.startsWith(SOURCE) && !/\.test\.[cm]?[jt]sx?$/.test(file) && !file.endsWith(".md");
}

/**
 * Why the release must stop, or null when it may go on.
 *
 * @param {object} release
 * @param {string[]} release.changed files changed since the previous tag
 * @param {string} release.version ricons' version at this tag
 * @param {string | null} release.previousVersion its version at the previous tag (null: no ricons there)
 * @param {boolean} release.published whether `version` is already on npm
 */
export function releaseError({ changed, version, previousVersion, published }) {
  const files = changed.filter(shipped);
  if (files.length === 0 || version !== previousVersion || !published) return null;
  return [
    `@botiverse/ricons@${version} is already on npm, but its code changed since the previous release:`,
    ...files.map((file) => `  ${file}`),
    "The publish step would skip it, so these changes would not ship.",
    `Fix: bump "version" in ${MANIFEST} and add an entry for it to packages/icons/CHANGELOG.md, then cut the release again.`,
  ].join("\n");
}

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

function versionAt(ref) {
  try {
    return JSON.parse(git("show", `${ref}:${MANIFEST}`)).version;
  } catch {
    return null;
  }
}

/** Whether npm has the version; any answer but "not found" stops the check. */
function onNpm(version) {
  try {
    execFileSync("npm", ["view", `@botiverse/ricons@${version}`, "version"], { stdio: "pipe" });
    return true;
  } catch (error) {
    if (/E404|404 Not Found/.test(String(error.stderr ?? ""))) return false;
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const tag = process.argv[2];
  if (!tag) {
    console.error("usage: check-release.mjs <tag>");
    process.exit(2);
  }
  // The previous tag the way publish.yml picks it for the release notes.
  const previous = git("tag", "--list", "v*", "--sort=-v:refname")
    .split("\n")
    .find((name) => name && name !== tag);
  if (!previous) {
    console.log("No previous v* tag; nothing to compare.");
    process.exit(0);
  }
  const version = versionAt(tag);
  if (!version) {
    console.log(`No ${MANIFEST} at ${tag}; nothing to check.`);
    process.exit(0);
  }
  const error = releaseError({
    changed: git("diff", "--name-only", previous, tag, "--", SOURCE).split("\n").filter(Boolean),
    version,
    previousVersion: versionAt(previous),
    published: onNpm(version),
  });
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(`ricons ${version}: no unreleased change since ${previous}.`);
}
