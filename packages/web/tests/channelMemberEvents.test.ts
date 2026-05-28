import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  notifyChannelMembersChanged,
  subscribeChannelMembersChanged,
} from "../src/hooks/channelMemberEvents.js";

const repoRoot = resolve(import.meta.dirname, "..");

test("channel member change notifications fan out by channel id", () => {
  const seen: string[] = [];
  const unsubscribe = subscribeChannelMembersChanged((channelId) => {
    seen.push(channelId);
  });

  notifyChannelMembersChanged("channel-a");
  notifyChannelMembersChanged("channel-b");
  unsubscribe();
  notifyChannelMembersChanged("channel-c");

  assert.deepEqual(seen, ["channel-a", "channel-b"]);
});

test("useChannelMembers locally invalidates sibling hook instances after membership writes", () => {
  const source = readFileSync(resolve(repoRoot, "src/hooks/useChannelMembers.ts"), "utf8");

  assert.match(
    source,
    /subscribeChannelMembersChanged\(\(changedChannelId\) => \{\s*if \(changedChannelId === channelId\) \{\s*loadMembers\(\);/s,
    "MessageInput and ChannelMembers use separate hook instances; all same-channel instances must reload after a local mutation",
  );
  assert.match(
    source,
    /api\.post\(`\/channels\/\$\{channelId\}\/members`, \{ userId \}\);\s*notifyChannelMembersChanged\(channelId\);/s,
    "adding a human member must invalidate mention autocomplete without waiting for a server socket round-trip",
  );
  assert.match(
    source,
    /api\.post\(`\/channels\/\$\{channelId\}\/members`, \{ agentId \}\);\s*notifyChannelMembersChanged\(channelId\);/s,
    "adding an agent member must invalidate mention autocomplete without waiting for a server socket round-trip",
  );
});

test("useChannelMembers hydrates agent activity snapshots returned by channel members API", () => {
  const source = readFileSync(resolve(repoRoot, "src/hooks/useChannelMembers.ts"), "utf8");

  assert.match(
    source,
    /function hydrateChannelAgentActivities\(agents: ChannelAgent\[\]\) \{[\s\S]*useAgentStore\.getState\(\)\.updateActivity/s,
    "remote joint agents are not present in the local /agents snapshot, so channel member snapshots must seed agentActivities",
  );
  assert.match(
    source,
    /const agents = \(data\.agents \?\? \[\]\) as ChannelAgent\[\];\s*hydrateChannelAgentActivities\(agents\);\s*setChannelAgents\(agents\);/s,
    "activity hydration must happen when /channels/:id/members refreshes",
  );
});
