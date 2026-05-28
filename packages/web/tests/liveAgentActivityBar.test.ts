import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LiveAgentActivityBarPresentation } from "../src/components/layout/LiveAgentActivityBar";

test("LiveAgentActivityBar matches agent header status typography and hides when inactive", () => {
  const inactive = renderToStaticMarkup(
    React.createElement(LiveAgentActivityBarPresentation, { latest: null }),
  );

  assert.equal(inactive, "");

  const active = renderToStaticMarkup(
    React.createElement(LiveAgentActivityBarPresentation, {
      latest: {
        id: "activity-1",
        kind: "activity",
        agentId: "agent-1",
        agentName: "Runner",
        agentAvatarUrl: null,
        text: "Running tests",
        context: null,
        activity: "working",
        createdAt: 123,
      },
    }),
  );

  assert.match(active, /gap-1\.5/);
  assert.match(active, /text-sm text-black\/60 font-mono/);
  assert.match(active, /flex min-h-8 items-center gap-2/);
  assert.doesNotMatch(active, /transition-transform/);
  assert.match(active, /Running tests/);
  assert.doesNotMatch(active, /Agent activity will appear here/);
});

test("live activity state is isolated from MainLayout render state", () => {
  const mainLayout = readRepoFile("src/components/layout/MainLayout.tsx");
  const bar = readRepoFile("src/components/layout/LiveAgentActivityBar.tsx");

  assert.match(mainLayout, /useLiveAgentActivityStore\.getState\(\)\.recordStatusActivity/);
  assert.match(
    mainLayout,
    /useLayoutEffect\(\(\) => \{\s*useLiveAgentActivityStore\.getState\(\)\.clear\(\);\s*\}, \[currentServerId\]\);/s,
    "server switch must synchronously clear the old server's live agent progress",
  );
  assert.doesNotMatch(mainLayout, /useState<LiveAgentActivityItem\[\]>/);
  assert.doesNotMatch(mainLayout, /setLiveAgentActivityItems/);
  assert.doesNotMatch(mainLayout, /latestLiveAgentActivity/);
  assert.match(bar, /useLiveAgentActivityStore\(\(state\) => state\.items\[0\] \?\? null\)/);
});

test("mobile live activity bar sits flush above the mobile tab bar", () => {
  const mainLayout = readRepoFile("src/components/layout/MainLayout.tsx");

  assert.match(mainLayout, /<div className="md:hidden shrink-0">\s*<LiveAgentActivityBar variant="mobile" \/>/);
  assert.doesNotMatch(
    mainLayout,
    /fixed inset-x-0 bottom-/,
    "mobile live activity must stay in flow above MobileTabBar instead of guessing a fixed bottom offset",
  );
  assert.doesNotMatch(
    mainLayout,
    /bottom:\s*"calc\(3\.5rem \+ env\(safe-area-inset-bottom, 0px\)\)"/,
    "mobile live activity must not double-count safe-area inset and leave a transparent gap",
  );
});

function readRepoFile(path: string): string {
  return readFileSync(resolve(import.meta.dirname, "..", path), "utf8");
}
