import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import {
  MessageItemInlineReplies,
  MessageItemInlineRepliesSummary,
  MessageItemInlineRepliesTrigger,
  MessageItemInlineReplyCount,
  MessageItemInlineReplyRow,
} from "./message-footer";

describe("message inline replies", () => {
  it("preserves the granular container and count button contract", () => {
    const markup = renderToStaticMarkup(
      <MessageItemInlineReplies>
        <MessageItemInlineReplyCount>2 replies</MessageItemInlineReplyCount>
      </MessageItemInlineReplies>,
    );

    expect(markup).toMatch(/^<div\b/);
    expect(markup.match(/<button\b/g)).toHaveLength(1);
  });

  it("provides an additive single-button reply surface", () => {
    const markup = renderToStaticMarkup(
      <MessageItemInlineRepliesTrigger>
        <MessageItemInlineRepliesSummary>2 replies</MessageItemInlineRepliesSummary>
        <MessageItemInlineReplyRow render={<span />}>Latest reply</MessageItemInlineReplyRow>
      </MessageItemInlineRepliesTrigger>,
    );

    expect(markup).toMatch(/^<button\b/);
    expect(markup).toContain("<span");
    expect(markup.match(/<button\b/g)).toHaveLength(1);
  });
});
