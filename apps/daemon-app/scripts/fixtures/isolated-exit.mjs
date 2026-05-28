import { writeFile } from "node:fs/promises";
import path from "node:path";

const userDataDir = process.env.DAEMON_APP_USER_DATA_DIR;

if (!userDataDir) {
  console.error("Missing DAEMON_APP_USER_DATA_DIR");
  process.exit(1);
}

await writeFile(path.join(userDataDir, "fixture-exit.txt"), "ok", "utf8");
console.log(`ISOLATED_USER_DATA_DIR=${userDataDir}`);
