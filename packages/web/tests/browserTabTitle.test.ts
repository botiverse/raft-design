import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("server routes put the server label first in the browser tab title", () => {
  const appSource = readFileSync(resolve(repoRoot, "src/App.tsx"), "utf8");

  assert.match(appSource, /const APP_DOCUMENT_TITLE = "Slock";/);
  assert.match(appSource, /function getServerDocumentTitle\(server: Pick<Server, "name" \| "slug">\): string/);
  assert.match(appSource, /const serverLabel = server\.name\.trim\(\) \|\| server\.slug;/);
  assert.match(
    appSource,
    /return `\$\{serverLabel\} \| \$\{APP_DOCUMENT_TITLE\}`;/,
    "server label should come before Slock so narrow browser tabs differ",
  );
  assert.match(
    appSource,
    /document\.title = server \? getServerDocumentTitle\(server\) : APP_DOCUMENT_TITLE;/,
    "server routes should update the browser tab title from current server context",
  );
  assert.match(
    appSource,
    /return \(\) => \{\s*document\.title = APP_DOCUMENT_TITLE;\s*\};/,
    "leaving a server route should restore the generic app title",
  );
});
