import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(repoRoot, path), "utf8");

test("regular channel header uses PanelHeader title/subtitle priority instead of inline description", () => {
  const chatPanel = read("src/components/message/ChatPanel.tsx");

  assert.match(chatPanel, /title=\{isRegularChannel \? channel\.name : undefined\}/);
  assert.match(chatPanel, /const channelSubtitle =\s*isRegularChannel/);
  assert.match(chatPanel, /subtitle=\{channelSubtitle\}/);
  assert.match(chatPanel, /const channelHeaderIcon = isRegularChannel \? <ChannelKindIcon type=\{channel\.type\} \/> : undefined;/);
  assert.match(chatPanel, /icon=\{channelHeaderIcon\}/);
  assert.match(chatPanel, /titleSuffix=\{\s*isRegularChannel && isArchived \?/);
  assert.doesNotMatch(
    chatPanel,
    /— \{channel\.description\}|<span className="truncate text-sm text-black\/60 leading-tight">[\s\S]*channel\.description/,
    "channel description must not render inline with the channel name",
  );
});

test("PanelHeader keeps title/subtitle in a shrinkable column and actions fixed", () => {
  const panelHeader = read("src/components/ui/PanelHeader.tsx");

  assert.match(panelHeader, /<div[\s\S]{0,120}\{\.\.\.titleClickProps\}[\s\S]{0,120}className=\{`min-w-0 flex-1 \$\{titleClickProps\?\.className \?\? ""\}`\}/);
  assert.match(panelHeader, /<h2 className="truncate font-bold text-base leading-tight text-black">/);
  assert.match(panelHeader, /<p\s+className=\{`text-xs text-black\/50 font-mono \$\{/);
  assert.match(panelHeader, /<div className="flex shrink-0 items-center gap-1\.5">\{actions\}<\/div>/);
});
