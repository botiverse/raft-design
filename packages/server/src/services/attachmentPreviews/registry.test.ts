import assert from "node:assert/strict";
import test from "node:test";
import { attachmentPreviewProviders } from "./registry.js";

test("attachment preview providers are ordered and declare resource/trust contract", () => {
  assert.deepEqual(attachmentPreviewProviders.map((provider) => provider.kind), ["diff", "csv", "markdown", "pdf", "text"]);
  for (const provider of attachmentPreviewProviders) {
    assert.ok(provider.trustLevel === "data" || provider.trustLevel === "sandbox");
    assert.ok(provider.streamByteCap > 0);
    assert.ok(provider.payloadByteCap > 0);
  }
});
