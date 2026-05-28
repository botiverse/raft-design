import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import MarkdownContent from "../src/components/markdown/MarkdownContent";
import {
  escapeUserRawHtmlForMessageMarkdown,
  messageMarkdownSanitizeSchema,
} from "../src/components/message/messageMarkdownSecurity";

function renderMessageMarkdown(source: string) {
  return renderToStaticMarkup(
    React.createElement(ReactMarkdown, {
      children: source,
      rehypePlugins: [rehypeRaw, [rehypeSanitize, messageMarkdownSanitizeSchema]],
    }),
  );
}

function renderStyledMessageMarkdown(source: string) {
  return renderToStaticMarkup(
    React.createElement(MarkdownContent, {
      source,
      rehypePlugins: [rehypeRaw, [rehypeSanitize, messageMarkdownSanitizeSchema]],
    }),
  );
}

function renderEscapedUserMarkdown(source: string) {
  return renderStyledMessageMarkdown(escapeUserRawHtmlForMessageMarkdown(source));
}

test("message markdown renders incomplete raw HTML tags as visible text", () => {
  assert.match(renderEscapedUserMarkdown("<s"), /&lt;s/);
  assert.match(renderEscapedUserMarkdown("<script"), /&lt;script/);
});

test("message markdown renders user raw HTML as text instead of DOM", () => {
  const html = renderEscapedUserMarkdown([
    '<button onclick="alert(1)">Start audio call</button>',
    '<iframe src="https://evil.example"></iframe>',
    '<a href="javascript:alert(1)">bad link</a>',
    '<img src=x onerror="alert(1)">',
  ].join("\n"));

  assert.match(html, /&lt;button/);
  assert.match(html, /Start audio call/);
  assert.match(html, /&lt;iframe/);
  assert.match(html, /&lt;a href=&quot;javascript:alert\(1\)&quot;&gt;bad link&lt;\/a&gt;/);
  assert.match(html, /&lt;img/);
  assert.doesNotMatch(html, /<button\b/);
  assert.doesNotMatch(html, /<iframe\b/);
  assert.doesNotMatch(html, /<img\b/);
  assert.doesNotMatch(html, /href="javascript:/);
  assert.doesNotMatch(html, /<[^>]+\sonerror=/);
  assert.doesNotMatch(html, /<[^>]+\sonclick=/);
});

test("message markdown keeps normal markdown links", () => {
  const html = renderEscapedUserMarkdown("[Slock](https://slock.ai)");

  assert.match(html, /<a href="https:\/\/slock\.ai"/);
  assert.match(html, />Slock<\/a>/);
});

test("message markdown preserves CommonMark autolinks while escaping raw HTML", () => {
  const html = renderEscapedUserMarkdown("see <https://slock.ai> now");

  assert.match(html, /<a href="https:\/\/slock\.ai"/);
  assert.match(html, />https:\/\/slock\.ai<\/a>/);
  assert.doesNotMatch(html, />&lt;https:\/\/slock\.ai/);
  assert.doesNotMatch(html, /https:\/\/slock\.ai&gt;/);
});

test("message markdown autolink boundary excludes trailing CJK punctuation", () => {
  const html = renderEscapedUserMarkdown("测试，<https://slock.ai>，再见");

  assert.match(html, /<a href="https:\/\/slock\.ai"/);
  assert.match(html, />https:\/\/slock\.ai<\/a>，再见/);
  assert.doesNotMatch(html, /href="https:\/\/slock\.ai&gt;/);
  assert.doesNotMatch(html, /href="https:\/\/slock\.ai，/);
});

test("message markdown supports email autolinks", () => {
  const html = renderEscapedUserMarkdown("contact <user@example.com>");

  assert.match(html, /<a href="mailto:user@example\.com"/);
  assert.match(html, />user@example\.com<\/a>/);
});

test("message markdown keeps invalid angle-bracket text visible", () => {
  const html = renderEscapedUserMarkdown("<not-a-url>");

  assert.match(html, /&lt;not-a-url&gt;/);
  assert.doesNotMatch(html, /<a href=/);
});

test("message markdown keeps controlled injected message anchors", () => {
  const mention = renderMessageMarkdown('<a data-mention="kasei" data-mention-type="user" data-mention-id="user-1">@Kasei</a>');
  assert.match(mention, /data-mention="kasei"/);
  assert.match(mention, /data-mention-type="user"/);
  assert.match(mention, /data-mention-id="user-1"/);

  const channel = renderMessageMarkdown('<a data-channel="general">#general</a>');
  assert.match(channel, /data-channel="general"/);

  const thread = renderMessageMarkdown('<a data-thread-ref="abc123" data-thread-parent="channel-1">#general:abc123</a>');
  assert.match(thread, /data-thread-ref="abc123"/);
  assert.match(thread, /data-thread-parent="channel-1"/);
});

test("message markdown schema does not allow extra raw HTML tags", () => {
  assert.equal(messageMarkdownSanitizeSchema.tagNames?.includes("button"), false);
  assert.equal(messageMarkdownSanitizeSchema.tagNames?.includes("iframe"), false);
  assert.equal(messageMarkdownSanitizeSchema.tagNames?.includes("section"), false);
  assert.equal(messageMarkdownSanitizeSchema.tagNames?.includes("b"), false);
});
