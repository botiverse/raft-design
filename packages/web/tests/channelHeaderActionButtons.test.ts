import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("channel header icon-only actions stay square while matching text action height", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/ChatPanel.tsx"),
    "utf8",
  );
  const buttonSource = readFileSync(
    resolve(repoRoot, "src/components/ui/Button.tsx"),
    "utf8",
  );

  assert.match(source, /<Button[\s\S]*?shape="icon"[\s\S]*?title="Stop all agents in this channel"/);
  assert.match(source, /<Button[\s\S]*?shape="icon"[\s\S]*?title="Edit channel"/);
  assert.doesNotMatch(source, /size-8/);
  assert.match(buttonSource, /icon: "size-7 text-xs"/);
});

test("channel header text and count actions use the shared button size contract", () => {
  const chatPanel = readFileSync(
    resolve(repoRoot, "src/components/message/ChatPanel.tsx"),
    "utf8",
  );
  const channelMembers = readFileSync(
    resolve(repoRoot, "src/components/agent/ChannelMembers.tsx"),
    "utf8",
  );

  assert.match(
    chatPanel,
    /<Button[\s\S]*?shape="icon"[\s\S]*?className="sm:w-auto sm:gap-1\.5 sm:px-2\.5"[\s\S]*?title="Leave channel"/,
  );
  assert.match(
    channelMembers,
    /<Button[\s\S]*?shape="iconText"[\s\S]*?className="min-w-7 gap-1 px-1\.5"/,
  );
  assert.match(channelMembers, /text-\[11px\][^"]*tabular-nums/);
  assert.doesNotMatch(channelMembers, /h-8 min-w-8/);
  assert.doesNotMatch(channelMembers, /badge=/);
  const buttonSource = readFileSync(resolve(repoRoot, "src/components/ui/Button.tsx"), "utf8");
  assert.match(buttonSource, /iconText: "h-7 gap-1\.5 px-2\.5 text-xs"/);
  assert.doesNotMatch(buttonSource, /\bcount:/);
});

test("#all hides the header members button for ordinary members when human directory is hidden", () => {
  const chatPanel = readFileSync(
    resolve(repoRoot, "src/components/message/ChatPanel.tsx"),
    "utf8",
  );

  assert.match(
    chatPanel,
    /const hideAllChannelMembersButton = isAllChannel\s*&&\s*currentServer\?\.role === "member"\s*&&\s*currentServer\.hideHumansFromMembers;/,
  );
  assert.match(
    chatPanel,
    /!\{?hideAllChannelMembersButton[\s\S]*?<ChannelMembers channelId=\{channel\.id\} \/>/,
  );
});
