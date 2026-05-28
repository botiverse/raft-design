import assert from "node:assert/strict";
import test from "node:test";
import {
  CHINESE_COMMUNITY_SERVER_SLUG,
  DEFAULT_COMMUNITY_SERVER_SLUG,
  languageListPrefersChineseCommunity,
  recommendedCommunitySlugForLanguages,
} from "../src/utils/communityServers";

test("community recommendation detects Chinese browser language", () => {
  assert.equal(languageListPrefersChineseCommunity(["en-US", "zh-CN"]), true);
  assert.equal(languageListPrefersChineseCommunity(["zh-Hans-CN"]), true);
  assert.equal(languageListPrefersChineseCommunity(["en-US", "ja-JP"]), false);
});

test("community recommendation prefers Chinese community only when not already joined", () => {
  assert.equal(recommendedCommunitySlugForLanguages([], ["zh-CN"]), CHINESE_COMMUNITY_SERVER_SLUG);
  assert.equal(
    recommendedCommunitySlugForLanguages([{ slug: CHINESE_COMMUNITY_SERVER_SLUG }], ["zh-CN"]),
    DEFAULT_COMMUNITY_SERVER_SLUG,
  );
  assert.equal(recommendedCommunitySlugForLanguages([], ["en-US"]), DEFAULT_COMMUNITY_SERVER_SLUG);
});
