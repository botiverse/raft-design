// @env node

import { readFile } from "node:fs/promises";
import process from "node:process";

const [, , tag, changelogPath = "packages/ui/CHANGELOG.md"] = process.argv;

if (!tag) {
  throw new Error("Usage: node scripts/release-notes.mjs <tag> [changelog-path]");
}

const version = tag.replace(/^v/, "");
const changelog = await readFile(changelogPath, "utf8");
const headingPattern = new RegExp(
  `^## \\[?${version.replaceAll(".", "\\.")}\\]?(?:\\([^\\n]+\\))?(?: \\([^\\n]+\\))?\\s*$`,
  "m",
);
const heading = headingPattern.exec(changelog);

if (!heading) {
  process.stdout.write("No stable public changes.\n");
  process.exit(0);
}

const bodyStart = heading.index + heading[0].length;
const nextHeading = changelog.slice(bodyStart).search(/^## /m);
const bodyEnd = nextHeading === -1 ? changelog.length : bodyStart + nextHeading;
const releaseNotes = changelog.slice(bodyStart, bodyEnd).trim();

process.stdout.write(`${releaseNotes || "No stable public changes."}\n`);
