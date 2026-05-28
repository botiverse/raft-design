import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

function readSource(path: string): string {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

test("top panel tabs use the shared reorderable tab bar", () => {
  const chatPanel = readSource("src/components/message/ChatPanel.tsx");
  const agentPanel = readSource("src/components/agent/AgentDetailPanel.tsx");
  const sidebar = readSource("src/components/layout/Sidebar.tsx");
  const tabBar = readSource("src/components/ui/ReorderablePanelTabs.tsx");

  assert.match(tabBar, /PointerSensor,/);
  assert.match(tabBar, /TouchSensor,/);
  assert.match(tabBar, /horizontalListSortingStrategy/);
  assert.match(tabBar, /horizontalTransform = transform \? \{ \.\.\.transform, y: 0 \} : null/);
  assert.doesNotMatch(tabBar, /shadow-brutal-sm/);
  assert.doesNotMatch(tabBar, /localStorage/);
  assert.match(sidebar, /verticalListSortingStrategy/);
  assert.match(sidebar, /verticalTransform = transform \? \{ \.\.\.transform, x: 0 \} : null/);

  assert.match(chatPanel, /import ReorderablePanelTabs, \{ useOrderedPanelTabs/);
  assert.match(chatPanel, /sidebarOrder\.channelPanelTabOrder/);
  assert.match(chatPanel, /updateSidebarOrder\(\{ channelPanelTabOrder: nextOrder \}\)/);
  assert.match(chatPanel, /<ReorderablePanelTabs/);

  assert.match(agentPanel, /import ReorderablePanelTabs, \{ useOrderedPanelTabs/);
  assert.match(agentPanel, /sidebarOrder\.agentPanelTabOrder/);
  assert.match(agentPanel, /updateSidebarOrder\(\{ agentPanelTabOrder: nextOrder \}\)/);
  assert.match(agentPanel, /<ReorderablePanelTabs/);
});

test("panels default to the first ordered visible tab when no tab param is present", () => {
  const chatPanel = readSource("src/components/message/ChatPanel.tsx");
  const agentPanel = readSource("src/components/agent/AgentDetailPanel.tsx");

  assert.match(chatPanel, /const visibleTabs = useMemo\(/);
  assert.match(chatPanel, /const defaultTab = visibleTabs\[0\]\?\.id \?\? "chat";/);
  assert.match(chatPanel, /: defaultTab\s*\)\s*as ChatPanelTab/);
  assert.match(chatPanel, /if \(tab === defaultTab\) next\.delete\(CHAT_TAB_QUERY_PARAM\)/);

  assert.match(agentPanel, /const defaultAgentTab = orderedAgentTabs\[0\]\?\.id \?\? "profile";/);
  assert.match(agentPanel, /: defaultAgentTab;/);
  assert.match(agentPanel, /if \(tab === defaultAgentTab\) next\.delete\("agentTab"\)/);
});
