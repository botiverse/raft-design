import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  parseChannel,
  readChannel,
  writeChannel,
  runChannelShow,
  runChannelSet,
  DEFAULT_CHANNEL,
} from "./channel.js";
import { channelPath } from "./paths.js";
import { CliExit } from "./output.js";

// PR-E §2.1 regression guard — release channel state.

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-pr-e-channel-"));
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
  const sink = ((c: unknown) => {
    buf += String(c);
    return true;
  });
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

test("parseChannel: latest / alpha accepted", () => {
  assert.equal(parseChannel("latest"), "latest");
  assert.equal(parseChannel("alpha"), "alpha");
  assert.equal(parseChannel("  latest  "), "latest"); // trims
});

test("parseChannel: pinned:<semver> accepted for valid semver", () => {
  assert.equal(parseChannel("pinned:0.52.2"), "pinned:0.52.2");
  assert.equal(parseChannel("pinned:1.0.0-alpha"), "pinned:1.0.0-alpha");
  assert.equal(parseChannel("pinned:1.0.0-beta.1"), "pinned:1.0.0-beta.1");
});

test("parseChannel: invalid values rejected → null", () => {
  assert.equal(parseChannel(""), null);
  assert.equal(parseChannel("staging"), null);
  assert.equal(parseChannel("PINNED:1.2.3"), null); // case-sensitive
  assert.equal(parseChannel("pinned:not-a-version"), null);
  assert.equal(parseChannel("pinned:1.2"), null); // incomplete semver
  assert.equal(parseChannel("latest@1.0"), null);
});

test("readChannel: missing file → returns DEFAULT_CHANNEL (latest)", async () => {
  await withHome(async (home) => {
    assert.equal(await readChannel(home), DEFAULT_CHANNEL);
    assert.equal(DEFAULT_CHANNEL, "latest");
  });
});

test("readChannel: corrupt content → falls back to DEFAULT_CHANNEL (lenient read)", async () => {
  await withHome(async (home) => {
    await mkdir(join(home, "computer"), { recursive: true });
    await writeFile(channelPath(home), "garbage-value");
    assert.equal(await readChannel(home), DEFAULT_CHANNEL);
  });
});

test("writeChannel: persists + readChannel round-trip", async () => {
  await withHome(async (home) => {
    await writeChannel(home, "alpha");
    assert.equal(await readChannel(home), "alpha");
    await writeChannel(home, "pinned:0.52.2");
    assert.equal(await readChannel(home), "pinned:0.52.2");
    await writeChannel(home, "latest");
    assert.equal(await readChannel(home), "latest");
  });
});

test("writeChannel: writes file with mode 0600", async () => {
  await withHome(async (home) => {
    await writeChannel(home, "alpha");
    const { stat } = await import("node:fs/promises");
    const s = await stat(channelPath(home));
    assert.equal(s.mode & 0o777, 0o600);
  });
});

test("runChannelShow: prints current channel", async () => {
  await withHome(async (home) => {
    await writeChannel(home, "alpha");
    const cap = captureOut();
    try {
      await runChannelShow(home);
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /alpha/);
  });
});

test("runChannelShow: prints default when unset", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await runChannelShow(home);
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /latest/);
  });
});

test("runChannelSet: valid channel persisted + success message", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await runChannelSet(home, "alpha");
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /Channel set to alpha/);
    assert.equal(await readChannel(home), "alpha");
    // Verify file contents persisted correctly
    const raw = (await readFile(channelPath(home), "utf8")).trim();
    assert.equal(raw, "alpha");
  });
});

test("runChannelSet: invalid channel → CHANNEL_INVALID + CliExit", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () => runChannelSet(home, "staging"),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /CHANNEL_INVALID/);
    // File must NOT be written on failure
    assert.equal(await readChannel(home), DEFAULT_CHANNEL);
  });
});
