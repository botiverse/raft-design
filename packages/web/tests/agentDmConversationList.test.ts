import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AgentDMConversationList } from "../src/components/agent/AgentDMConversationList";

test("agent DM conversation rows render as activity-only cards without navigation affordance", () => {
  const html = renderToStaticMarkup(
    React.createElement(AgentDMConversationList, {
      items: [
        {
          id: "dm-agent-1",
          createdAt: "2026-04-24T00:00:00.000Z",
          peerId: "agent-2",
          peerName: "helper",
          peerDisplayName: "Helper",
          peerAvatarUrl: null,
          lastMessageAt: "2026-04-24T01:00:00.000Z",
          lastMessagePreview: "Can you check this?",
        },
      ]
    })
  );

  assert.match(html, /Agent DM/);
  assert.match(html, /Helper/);
  assert.match(html, /Can you check this\?/);
  assert.match(html, /aria-label="Helper agent DM activity"/);
  assert.match(html, /title="Agent DM activity"/);
  assert.match(html, /Activity only/);
  assert.doesNotMatch(html, /<button/);
});
