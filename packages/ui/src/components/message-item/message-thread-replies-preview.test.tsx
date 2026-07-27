import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import {
  MessageItemInlineRepliesSummary,
  MessageItemInlineRepliesTrigger,
  MessageItemInlineReplyRow,
  MessageItemInlineReplyTime,
  MessageItemThreadRepliesPreview,
} from "./index";

describe("MessageItemThreadRepliesPreview", () => {
  it("composes one interactive thread preview surface from semantic parts", () => {
    const markup = renderToStaticMarkup(
      <MessageItemThreadRepliesPreview>
        <MessageItemThreadRepliesPreview.Trigger>
          <MessageItemThreadRepliesPreview.Summary>
            30 earlier replies
          </MessageItemThreadRepliesPreview.Summary>
          <MessageItemThreadRepliesPreview.Reply>
            <MessageItemThreadRepliesPreview.Avatar>Avatar</MessageItemThreadRepliesPreview.Avatar>
            <MessageItemThreadRepliesPreview.Sender>Tyler</MessageItemThreadRepliesPreview.Sender>
            <MessageItemThreadRepliesPreview.Preview>
              Latest reply
            </MessageItemThreadRepliesPreview.Preview>
            <MessageItemThreadRepliesPreview.Time dateTime="2026-07-27T14:30:00Z">
              2:30 PM
            </MessageItemThreadRepliesPreview.Time>
          </MessageItemThreadRepliesPreview.Reply>
        </MessageItemThreadRepliesPreview.Trigger>
      </MessageItemThreadRepliesPreview>,
    );

    expect(markup).toMatch(/^<div\b/);
    expect(markup.match(/<button\b/g)).toHaveLength(1);
    expect(markup).toContain('data-slot="message-item-thread-replies-preview"');
    expect(markup).toContain('data-slot="message-item-thread-replies-preview-trigger"');
    expect(markup).toContain('data-slot="message-item-thread-replies-preview-summary"');
    expect(markup).toContain('data-slot="message-item-thread-reply"');
    expect(markup).toContain('data-slot="message-item-thread-reply-avatar"');
    expect(markup).toContain('data-slot="message-item-thread-reply-sender"');
    expect(markup).toContain('data-slot="message-item-thread-reply-preview"');
    expect(markup).toContain('data-slot="message-item-thread-reply-time"');
  });

  it("retains the legacy granular API and data slots", () => {
    const markup = renderToStaticMarkup(
      <MessageItemInlineRepliesTrigger>
        <MessageItemInlineRepliesSummary>2 replies</MessageItemInlineRepliesSummary>
        <MessageItemInlineReplyRow render={<span />}>
          Latest reply
          <MessageItemInlineReplyTime dateTime="2026-07-27T14:30:00Z">
            2:30 PM
          </MessageItemInlineReplyTime>
        </MessageItemInlineReplyRow>
      </MessageItemInlineRepliesTrigger>,
    );

    expect(markup).toMatch(/^<button\b/);
    expect(markup.match(/<button\b/g)).toHaveLength(1);
    expect(markup).toContain('data-slot="message-item-inline-replies-trigger"');
    expect(markup).toContain('data-slot="message-item-inline-replies-summary"');
    expect(markup).toContain('data-slot="message-item-inline-reply-row"');
    expect(markup).toContain('data-slot="message-item-inline-reply-time"');
  });
});
