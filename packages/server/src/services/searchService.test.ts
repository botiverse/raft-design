import test from "node:test";
import assert from "node:assert/strict";
import { buildSearchText, preprocessSearchContent, tokenizeSearchText } from "./searchService.js";

test("preprocessSearchContent preserves markdown link text and inline code while removing URLs", () => {
  const input = "参考 [Neon 文档](https://neon.com/docs) 然后运行 `npm install express`";
  const output = preprocessSearchContent(input);
  assert.match(output, /Neon 文档/);
  assert.match(output, /npm install express/);
  assert.doesNotMatch(output, /https:\/\/neon\.com/);
});

test("tokenizeSearchText keeps English words intact while segmenting Chinese", () => {
  const tokens = tokenizeSearchText("部署到staging环境并执行 npm install express");
  assert.deepEqual(tokens, ["部署", "到", "staging", "环境", "并", "执行", "npm", "install", "express"]);
});

test("buildSearchText removes markdown noise from rich text", () => {
  const searchText = buildSearchText("**部署方案** 已写好，见 `config.ts` 和 https://example.com");
  assert.equal(searchText, "部署 方案 已写 好 见 config ts 和");
});
