import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const appSource = readFileSync(resolve(import.meta.dirname, "../src/App.tsx"), "utf8");

test("server resolver shows no-access feedback before redirecting away", () => {
  assert.match(appSource, /function ServerAccessDeniedPage\(\)/);
  assert.match(appSource, /const SERVER_SELECTION_REQUESTED_KEY = "slock_server_selection_requested";/);
  assert.match(appSource, /export function requestServerSelection\(\)/);
  assert.match(appSource, /function consumeServerSelectionRequest\(\): boolean/);
  assert.match(appSource, /Server not found/);
  assert.match(appSource, /Redirecting to[\s\S]*in 3 seconds/);
  assert.match(appSource, /window\.setTimeout\([\s\S]*3000\)/);
  assert.doesNotMatch(appSource, /requestedSlug/);
  assert.doesNotMatch(appSource, /invite link/);
  assert.doesNotMatch(appSource, /You do not have access to this server/);
  assert.match(appSource, /if \(consumeServerSelectionRequest\(\)\) \{\s*setShowServerSelector\(true\);\s*navigate\("\/", \{ replace: true \}\);/);
  assert.match(appSource, /if \(showServerSelector\) \{[\s\S]*<ServerSelector/);
  assert.match(appSource, /return <ServerAccessDeniedPage \/>;/);
  assert.doesNotMatch(
    appSource,
    /if \(!server\) \{\s*return <Navigate to="\/" replace \/>;\s*\}/,
    "missing server slug must not silently redirect to the user's existing server",
  );
});

test("deliberate leave and delete flows request server selection instead of no-access fallback", () => {
  const settingsSource = readFileSync(resolve(import.meta.dirname, "../src/components/settings/SettingsPanel.tsx"), "utf8");

  assert.match(settingsSource, /import \{ requestServerSelection \} from "\.\.\/\.\.\/App";/);
  assert.match(settingsSource, /requestServerSelection\(\);\s*await deleteServer\(\);/);
  assert.match(settingsSource, /requestServerSelection\(\);\s*await leaveServer\(\);/);
});
