import assert from "node:assert/strict";
import test from "node:test";
import { formatIntegrationLogin } from "./_format.js";

test("formatIntegrationLogin makes agent login completion explicit", () => {
  const output = formatIntegrationLogin({
    status: "logged_in",
    service: {
      id: "client-1",
      clientId: "orbital-notes-demo",
      name: "Orbital Notes",
      description: null,
      homepageUrl: "https://orbital.example",
      returnUrl: "https://orbital.example/login/callback",
      createdAt: "2026-05-15T00:00:00.000Z",
      updatedAt: "2026-05-15T00:00:00.000Z",
    },
    scopes: ["identity", "openid", "profile"],
    requestId: "internal-request-id",
  });

  assert.match(output, /Agent login ready: Orbital Notes/);
  assert.match(output, /complete: this agent login is configured in Slock; no human OAuth is required/);
  assert.match(output, /identity: run `slock profile show`/);
  assert.match(output, /app URL: https:\/\/orbital\.example\/login\/callback\?code=internal-request-id/);
  assert.match(output, /next: open the app URL/);
  assert.doesNotMatch(output, /agent_request_id/);
  assert.doesNotMatch(output, /request id:/);
});
