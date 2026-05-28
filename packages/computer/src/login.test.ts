import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runLogin } from "./login.js";

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-computer-login-"));
  const old = process.env.SLOCK_HOME;
  process.env.SLOCK_HOME = home;
  try {
    return await fn(home);
  } finally {
    if (old === undefined) delete process.env.SLOCK_HOME;
    else process.env.SLOCK_HOME = old;
    await rm(home, { recursive: true, force: true });
  }
}

function captureOut(): { restore: () => void; text: () => string } {
  const oo = process.stdout.write.bind(process.stdout);
  const oe = process.stderr.write.bind(process.stderr);
  let buf = "";
  const sink = (c: unknown) => {
    buf += String(c);
    return true;
  };
  process.stdout.write = sink as typeof process.stdout.write;
  process.stderr.write = sink as typeof process.stderr.write;
  return {
    restore: () => {
      process.stdout.write = oo;
      process.stderr.write = oe;
    },
    text: () => buf,
  };
}

test("login prints verificationUriComplete from the web origin when provided", async () => {
  await withHome(async () => {
    let tokenPolls = 0;
    const server = await new Promise<Server>((resolve) => {
      const s = createServer((req, res) => {
        res.setHeader("content-type", "application/json");
        if (req.url === "/api/auth/device/authorize") {
          res.statusCode = 201;
          res.end(JSON.stringify({
            deviceCode: "dvc_test",
            userCode: "ABCD-1234",
            verificationUri: "https://slock-app-staging.botiverse.dev/login/device",
            verificationUriComplete: "https://slock-app-staging.botiverse.dev/login/device?user_code=ABCD-1234",
            expiresIn: 30,
            interval: 1,
          }));
          return;
        }
        if (req.url === "/api/auth/device/token") {
          tokenPolls += 1;
          res.statusCode = 200;
          res.end(JSON.stringify({
            accessToken: "access",
            refreshToken: "refresh",
            userId: "user-1",
          }));
          return;
        }
        res.statusCode = 404;
        res.end("{}");
      });
      s.listen(0, "127.0.0.1", () => resolve(s));
    });

    const address = server.address();
    assert.ok(address && typeof address === "object");
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const cap = captureOut();
    try {
      await runLogin({ serverUrl: baseUrl });
    } finally {
      cap.restore();
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }

    assert.equal(tokenPolls, 1);
    assert.match(cap.text(), /https:\/\/slock-app-staging\.botiverse\.dev\/login\/device\?user_code=ABCD-1234/);
    assert.doesNotMatch(cap.text(), new RegExp(`${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/login/device`));
  });
});

// --- v8.3.3 PR-2c Slice 3: DEVICE_AUTHORIZE_FAILED friendlier message ---
//
// Field motivation: raw transport errors (`fetch failed`, `ECONNREFUSED`)
// surfaced to users with no diagnostic context. Slice 3 wraps the
// underlying error with server URL + reachability hint while preserving
// the error code (DEVICE_AUTHORIZE_FAILED stays stable for callers/tests)
// and the raw reason as a substring (operator-side diagnosis still works).

test("runLogin: device-authorize transport failure → DEVICE_AUTHORIZE_FAILED with server URL + actionable hint", async () => {
  await withHome(async () => {
    // Point at an unreachable port to force a transport failure.
    const baseUrl = "http://127.0.0.1:1"; // port 1 — guaranteed unreachable
    const cap = captureOut();
    try {
      await assert.rejects(
        () => runLogin({ serverUrl: baseUrl }),
        (e) => (e as { name?: string }).name === "CliExit",
      );
    } finally {
      cap.restore();
    }
    const out = cap.text();
    // Error code MUST remain stable (regression guard against accidental rename).
    assert.match(out, /DEVICE_AUTHORIZE_FAILED/);
    // Slice 3 enrichment: server URL embedded + actionable hint.
    assert.match(out, /Could not start device login at/);
    assert.match(out, /http:\/\/127\.0\.0\.1:1/);
    assert.match(out, /Check that the server URL is correct and reachable/);
  });
});

test("runLogin: DEVICE_AUTHORIZE_FAILED preserves underlying transport reason as substring (operator diagnosis)", async () => {
  await withHome(async () => {
    const baseUrl = "http://127.0.0.1:1";
    const cap = captureOut();
    try {
      await assert.rejects(() => runLogin({ serverUrl: baseUrl }));
    } finally {
      cap.restore();
    }
    const out = cap.text();
    // The error message is rendered as a JSON object on stderr; extract
    // the `message` field and assert the underlying transport reason
    // (ECONNREFUSED / fetch failed / network error) is preserved.
    const errLine = out.split("\n").find((l) => l.includes("DEVICE_AUTHORIZE_FAILED"));
    assert.ok(errLine, "expected a DEVICE_AUTHORIZE_FAILED stderr line");
    const parsed = JSON.parse(errLine);
    assert.equal(parsed.code, "DEVICE_AUTHORIZE_FAILED");
    // The transport reason appears between the URL prefix and the hint suffix.
    assert.match(parsed.message, /Could not start device login at http:\/\/127\.0\.0\.1:1: .+\. Check that the server URL/);
  });
});
