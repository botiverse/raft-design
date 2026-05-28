import assert from "node:assert/strict";
import test from "node:test";
import {
  detectClaudeSystemProvider,
  detectSystemProviders,
  parseLoggedInStatus,
  type CommandProbe,
} from "./systemProviderDetection";

function makeRunner(
  results: Record<string, { found?: boolean; exitCode?: number | null; stdout?: string; stderr?: string }>,
): CommandProbe {
  return async (command, args) => {
    const key = `${command} ${args.join(" ")}`;
    const result = results[key];
    if (!result) {
      throw new Error(`Unexpected probe: ${key}`);
    }

    return {
      found: result.found ?? true,
      exitCode: result.exitCode ?? 0,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
    };
  };
}

test("parseLoggedInStatus reads structured JSON from claude auth status", () => {
  assert.equal(parseLoggedInStatus('{"loggedIn":true,"authMethod":"oauth_token"}'), true);
  assert.equal(parseLoggedInStatus('{"loggedIn":false}'), false);
});

test("parseLoggedInStatus falls back to regex matching for defensive parsing", () => {
  assert.equal(parseLoggedInStatus('status: {"loggedIn": true}'), true);
  assert.equal(parseLoggedInStatus("loggedIn: false"), false);
  assert.equal(parseLoggedInStatus("no auth info here"), null);
});

test("detectClaudeSystemProvider returns null when the Claude binary is missing", async () => {
  const provider = await detectClaudeSystemProvider(
    makeRunner({
      "claude --version": {
        found: false,
        exitCode: null,
      },
    }),
  );

  assert.equal(provider, null);
});

test("detectClaudeSystemProvider marks logged-in Claude as a ready system provider", async () => {
  const provider = await detectClaudeSystemProvider(
    makeRunner({
      "claude --version": {
        stdout: "2.1.77 (Claude Code)",
      },
      "claude auth status": {
        stdout: '{"loggedIn":true,"authMethod":"oauth_token"}',
      },
    }),
  );

  assert.equal(provider?.credentialSource, "system");
  assert.equal(provider?.status, "connected");
  assert.equal(provider?.name, "Claude Code (system)");
});

test("detectClaudeSystemProvider marks logged-out Claude as pending", async () => {
  const provider = await detectClaudeSystemProvider(
    makeRunner({
      "claude --version": {
        stdout: "2.1.77 (Claude Code)",
      },
      "claude auth status": {
        stdout: '{"loggedIn":false}',
      },
    }),
  );

  assert.equal(provider?.status, "pending");
  assert.match(provider?.usage ?? "", /claude login/);
});

test("detectClaudeSystemProvider surfaces auth-status probe failures as verification errors", async () => {
  const provider = await detectClaudeSystemProvider(
    makeRunner({
      "claude --version": {
        stdout: "2.1.77 (Claude Code)",
      },
      "claude auth status": {
        exitCode: 1,
        stderr: "auth status failed",
      },
    }),
  );

  assert.equal(provider?.status, "error");
  assert.match(provider?.usage ?? "", /unable to verify/);
});

test("detectSystemProviders returns Claude first and only for the initial slice", async () => {
  const providers = await detectSystemProviders(
    makeRunner({
      "claude --version": {
        stdout: "2.1.77 (Claude Code)",
      },
      "claude auth status": {
        stdout: '{"loggedIn":true}',
      },
    }),
  );

  assert.equal(providers.length, 1);
  assert.equal(providers[0]?.kind, "anthropic");
});
