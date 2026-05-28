import assert from "node:assert/strict";
import test from "node:test";
import { wrapBareUrlsBeforeCjkPunctuation } from "../src/utils/markdownAutolink";

test("wraps bare URL before CJK comma without absorbing following Chinese text", () => {
  assert.equal(
    wrapBareUrlsBeforeCjkPunctuation("slock 深度用户 https://x.com/Trader_Pheneck，给了些反馈，在"),
    "slock 深度用户 <https://x.com/Trader_Pheneck>，给了些反馈，在",
  );
});

test("wraps URL before CJK punctuation inside a quoted sentence", () => {
  assert.equal(
    wrapBareUrlsBeforeCjkPunctuation("比如 “https://x.com/Trader_Pheneck，给了些反馈”"),
    "比如 “<https://x.com/Trader_Pheneck>，给了些反馈”",
  );
});

test("wraps bare URLs before ASCII comma followed by CJK text", () => {
  assert.equal(
    wrapBareUrlsBeforeCjkPunctuation("https://cua.ai, 稍后输出机会评分卡。"),
    "<https://cua.ai>, 稍后输出机会评分卡。",
  );
});

test("keeps URL-internal ASCII punctuation while splitting on CJK punctuation", () => {
  assert.equal(
    wrapBareUrlsBeforeCjkPunctuation("see https://example.com/a,b?x=1&y=2，后续"),
    "see <https://example.com/a,b?x=1&y=2>，后续",
  );
});

test("does not rewrite URLs already wrapped as markdown autolinks", () => {
  assert.equal(
    wrapBareUrlsBeforeCjkPunctuation("see <https://x.com/Trader_Pheneck>，给了些反馈"),
    "see <https://x.com/Trader_Pheneck>，给了些反馈",
  );
});

test("wraps bare URL before CJK opening punctuation", () => {
  assert.equal(
    wrapBareUrlsBeforeCjkPunctuation("see https://example.com/path（中文） 后面"),
    "see <https://example.com/path>（中文） 后面",
  );
});

test("consumes leading `<` instead of double-wrapping when URL is preceded by an unmatched open bracket (#proj-message task #25)", () => {
  // Without this, downstream HTML escape protects the inner <URL> autolink
  // and escapes the outer `<` to `&lt;`, leaking a literal `<` next to the
  // rendered link/card.
  assert.equal(
    wrapBareUrlsBeforeCjkPunctuation("在这里<https://app.slock.ai/s/foo/channel/abc?msg=97de81f8，做到一半"),
    "在这里<https://app.slock.ai/s/foo/channel/abc?msg=97de81f8>，做到一半",
  );
});

test("consumes leading `<` for the ASCII-comma + CJK form too", () => {
  assert.equal(
    wrapBareUrlsBeforeCjkPunctuation("see <https://cua.ai, 稍后输出"),
    "see <https://cua.ai>, 稍后输出",
  );
});
