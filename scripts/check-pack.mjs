// @env node
// Fails when a packed tarball's package.json still names a `workspace:` or
// `catalog:` range: npm can't install those, and pnpm pack is what rewrites
// them (raft-ui's `@botiverse/ricons: workspace:^` becomes `^<version>`), so a
// change in how a pnpm major packs would otherwise reach npm unseen.
//
//   node scripts/check-pack.mjs <tarball.tgz>...

import { execFileSync } from "node:child_process";
import process from "node:process";

const tarballs = process.argv.slice(2);
if (tarballs.length === 0) {
  throw new Error("Usage: node scripts/check-pack.mjs <tarball.tgz>...");
}

const FIELDS = ["dependencies", "peerDependencies", "optionalDependencies", "devDependencies"];
let failed = false;
for (const tarball of tarballs) {
  const manifest = JSON.parse(
    execFileSync("tar", ["-xOzf", tarball, "package/package.json"], { encoding: "utf8" }),
  );
  const unresolved = FIELDS.flatMap((field) =>
    Object.entries(manifest[field] ?? {})
      .filter(([, range]) => /^(workspace|catalog):/.test(range))
      .map(([name, range]) => `${field}.${name}: ${range}`),
  );
  if (unresolved.length) {
    failed = true;
    console.error(`${tarball} was packed with unresolved ranges:\n  ${unresolved.join("\n  ")}`);
  } else {
    const ricons = manifest.dependencies?.["@botiverse/ricons"];
    console.log(
      `${manifest.name}@${manifest.version}: ranges resolved${ricons ? ` (@botiverse/ricons ${ricons})` : ""}`,
    );
  }
}
if (failed) process.exit(1);
