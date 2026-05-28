import assert from "node:assert/strict";
import test from "node:test";
import { parseSlockPermalink } from "./slockPermalinks.js";

test("parseSlockPermalink parses standard app.slock.ai permalinks", () => {
  const parsed = parseSlockPermalink(
    "https://app.slock.ai/s/botiverse/channel/89dce17f-1cd3-4db8-b08f-7b4141004b5a?msg=7556f881-a5f8-4b0d-88dc-8b5af28e8f05"
  );
  assert.deepEqual(parsed, {
    routeKind: "channel",
    serverSlug: "botiverse",
    channelId: "89dce17f-1cd3-4db8-b08f-7b4141004b5a",
    messageId: "7556f881-a5f8-4b0d-88dc-8b5af28e8f05",
    threadParentMessageId: null,
  });
});

test("parseSlockPermalink parses DM permalinks", () => {
  const parsed = parseSlockPermalink(
    "https://app.slock.ai/s/botiverse/dm/89dce17f-1cd3-4db8-b08f-7b4141004b5a?msg=7556f881-a5f8-4b0d-88dc-8b5af28e8f05"
  );
  assert.deepEqual(parsed, {
    routeKind: "dm",
    serverSlug: "botiverse",
    channelId: "89dce17f-1cd3-4db8-b08f-7b4141004b5a",
    messageId: "7556f881-a5f8-4b0d-88dc-8b5af28e8f05",
    threadParentMessageId: null,
  });
});

test("parseSlockPermalink parses thread permalinks", () => {
  const parsed = parseSlockPermalink(
    "https://app.slock.ai/s/botiverse/channel/89dce17f-1cd3-4db8-b08f-7b4141004b5a?thread=89dce17f-1cd3-4db8-b08f-7b4141004b5a%3A11111111-2222-3333-4444-555555555555&msg=7556f881-a5f8-4b0d-88dc-8b5af28e8f05"
  );
  assert.deepEqual(parsed, {
    routeKind: "channel",
    serverSlug: "botiverse",
    channelId: "89dce17f-1cd3-4db8-b08f-7b4141004b5a",
    messageId: "7556f881-a5f8-4b0d-88dc-8b5af28e8f05",
    threadParentMessageId: "11111111-2222-3333-4444-555555555555",
  });
});

test("parseSlockPermalink accepts the current host for self-hosted deployments", () => {
  const parsed = parseSlockPermalink(
    "https://chat.example.com/s/botiverse/channel/89dce17f-1cd3-4db8-b08f-7b4141004b5a?msg=7556f881-a5f8-4b0d-88dc-8b5af28e8f05",
    "chat.example.com",
  );
  assert.equal(parsed?.serverSlug, "botiverse");
});

test("parseSlockPermalink resolves thread-only URLs (no msg) to the thread parent", () => {
  const parsed = parseSlockPermalink(
    "https://app.slock.ai/s/botiverse/channel/89dce17f-1cd3-4db8-b08f-7b4141004b5a?thread=89dce17f-1cd3-4db8-b08f-7b4141004b5a%3A11111111-2222-3333-4444-555555555555"
  );
  assert.deepEqual(parsed, {
    routeKind: "channel",
    serverSlug: "botiverse",
    channelId: "89dce17f-1cd3-4db8-b08f-7b4141004b5a",
    messageId: "11111111-2222-3333-4444-555555555555",
    threadParentMessageId: "11111111-2222-3333-4444-555555555555",
  });
});

test("parseSlockPermalink rejects URLs without a message id", () => {
  assert.equal(
    parseSlockPermalink("https://app.slock.ai/s/botiverse/channel/89dce17f-1cd3-4db8-b08f-7b4141004b5a"),
    null
  );
});
