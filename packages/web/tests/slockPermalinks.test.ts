import assert from "node:assert/strict";
import test from "node:test";
import { parseSlockPermalink } from "@slock-ai/shared";
import { buildMessagePermalink } from "../src/hooks/useAppNavigate";

test("parses app.slock.ai message permalinks", () => {
  const parsed = parseSlockPermalink(
    "https://app.slock.ai/s/botiverse/channel/89dce17f-1cd3-4db8-b08f-7b4141004b5a?msg=7556f881-a5f8-4b0d-88dc-8b5af28e8f05",
    "app.slock.ai"
  );

  assert.deepEqual(parsed, {
    routeKind: "channel",
    serverSlug: "botiverse",
    channelId: "89dce17f-1cd3-4db8-b08f-7b4141004b5a",
    messageId: "7556f881-a5f8-4b0d-88dc-8b5af28e8f05",
    threadParentMessageId: null,
  });
});

test("buildMessagePermalink preserves DM routes", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: "https://app.slock.ai" } } as Window & typeof globalThis;
  try {
    assert.equal(
      buildMessagePermalink(
        "botiverse",
        "89dce17f-1cd3-4db8-b08f-7b4141004b5a",
        "7556f881-a5f8-4b0d-88dc-8b5af28e8f05",
        { routeKind: "dm" }
      ),
      "https://app.slock.ai/s/botiverse/dm/89dce17f-1cd3-4db8-b08f-7b4141004b5a?msg=7556f881-a5f8-4b0d-88dc-8b5af28e8f05"
    );
  } finally {
    globalThis.window = previousWindow;
  }
});

test("buildMessagePermalink preserves thread params", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { origin: "https://app.slock.ai" } } as Window & typeof globalThis;
  try {
    assert.equal(
      buildMessagePermalink(
        "botiverse",
        "89dce17f-1cd3-4db8-b08f-7b4141004b5a",
        "7556f881-a5f8-4b0d-88dc-8b5af28e8f05",
        {
          routeKind: "channel",
          threadParentMessageId: "11111111-2222-3333-4444-555555555555",
        }
      ),
      "https://app.slock.ai/s/botiverse/channel/89dce17f-1cd3-4db8-b08f-7b4141004b5a?msg=7556f881-a5f8-4b0d-88dc-8b5af28e8f05&thread=89dce17f-1cd3-4db8-b08f-7b4141004b5a%3A11111111-2222-3333-4444-555555555555"
    );
  } finally {
    globalThis.window = previousWindow;
  }
});

test("rejects non-slock hosts and missing msg ids", () => {
  assert.equal(
    parseSlockPermalink(
      "https://example.com/s/botiverse/channel/89dce17f-1cd3-4db8-b08f-7b4141004b5a?msg=7556f881-a5f8-4b0d-88dc-8b5af28e8f05",
      "app.slock.ai"
    ),
    null
  );
  assert.equal(
    parseSlockPermalink(
      "https://app.slock.ai/s/botiverse/channel/89dce17f-1cd3-4db8-b08f-7b4141004b5a",
      "app.slock.ai"
    ),
    null
  );
});
