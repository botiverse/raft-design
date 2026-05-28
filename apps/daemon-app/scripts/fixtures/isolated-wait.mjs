import { writeFile } from "node:fs/promises";
import path from "node:path";

const userDataDir = process.env.DAEMON_APP_USER_DATA_DIR;

if (!userDataDir) {
  console.error("Missing DAEMON_APP_USER_DATA_DIR");
  process.exit(1);
}

await writeFile(path.join(userDataDir, "fixture-wait.txt"), "ready", "utf8");
console.log(`ISOLATED_USER_DATA_DIR=${userDataDir}`);
console.log("ISOLATED_READY");

setInterval(() => {
  // Keep the fixture alive until the wrapper forwards a signal.
}, 1_000);
