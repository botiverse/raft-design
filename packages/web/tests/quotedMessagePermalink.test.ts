import assert from "node:assert/strict";
import test from "node:test";
import {
  buildQuotedMessageAttachmentLabel,
  extractFirstQuotedMessagePermalink,
} from "../src/components/message/quotedMessagePermalink";

const CURRENT_HOSTNAME = "app.slock.ai";
const CURRENT_SERVER_SLUG = "botiverse";
const FIRST_PERMALINK =
  "https://app.slock.ai/s/botiverse/channel/11111111-1111-1111-1111-111111111111?msg=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const SECOND_PERMALINK =
  "https://app.slock.ai/s/botiverse/dm/22222222-2222-2222-2222-222222222222?msg=bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

test("extracts only the first slock permalink without mutating message content", () => {
  const extracted = extractFirstQuotedMessagePermalink(
    `before ${FIRST_PERMALINK} middle ${SECOND_PERMALINK} after`,
    CURRENT_HOSTNAME,
    CURRENT_SERVER_SLUG,
  );

  assert.ok(extracted);
  assert.equal(extracted.rawUrl, FIRST_PERMALINK);
  assert.equal(extracted.parsed.routeKind, "channel");
});

test("ignores permalinks inside inline and fenced code blocks", () => {
  const extracted = extractFirstQuotedMessagePermalink(
    [
      `inline \`${FIRST_PERMALINK}\``,
      "```ts",
      SECOND_PERMALINK,
      "```",
      "outside text",
    ].join("\n"),
    CURRENT_HOSTNAME,
    CURRENT_SERVER_SLUG,
  );

  assert.equal(extracted, null);
});

test("skips markdown link targets and keeps them in content", () => {
  const extracted = extractFirstQuotedMessagePermalink(
    `[quoted message](${FIRST_PERMALINK}) and plain text`,
    CURRENT_HOSTNAME,
    CURRENT_SERVER_SLUG,
  );

  assert.equal(extracted, null);
});

test("extracts autolink-wrapped permalinks without needing to rewrite the original text", () => {
  const extracted = extractFirstQuotedMessagePermalink(
    `see <${FIRST_PERMALINK}> now`,
    CURRENT_HOSTNAME,
    CURRENT_SERVER_SLUG,
  );

  assert.ok(extracted);
  assert.equal(extracted.rawUrl, FIRST_PERMALINK);
});

test("extracts permalinks followed by CJK punctuation and latin text", () => {
  const extracted = extractFirstQuotedMessagePermalink(
    `谁做一下 ${FIRST_PERMALINK}，Kevin 不适合做这个`,
    CURRENT_HOSTNAME,
    CURRENT_SERVER_SLUG,
  );

  assert.ok(extracted);
  assert.equal(extracted.rawUrl, FIRST_PERMALINK);
  assert.equal(extracted.parsed.messageId, "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
});

test("buildQuotedMessageAttachmentLabel summarizes image and file counts", () => {
  assert.equal(buildQuotedMessageAttachmentLabel(undefined), null);
  assert.equal(
    buildQuotedMessageAttachmentLabel([
      {
        id: "1",
        filename: "a.png",
        mimeType: "image/png",
        sizeBytes: 1,
      },
    ]),
    "1 image",
  );
  assert.equal(
    buildQuotedMessageAttachmentLabel([
      {
        id: "1",
        filename: "a.png",
        mimeType: "image/png",
        sizeBytes: 1,
      },
      {
        id: "2",
        filename: "b.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 1,
      },
    ]),
    "2 images",
  );
  assert.equal(
    buildQuotedMessageAttachmentLabel([
      {
        id: "1",
        filename: "a.png",
        mimeType: "image/png",
        sizeBytes: 1,
      },
      {
        id: "2",
        filename: "doc.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1,
      },
    ]),
    "2 attachments",
  );
});
