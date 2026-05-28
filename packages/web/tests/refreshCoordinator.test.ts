import assert from "node:assert/strict";
import test from "node:test";
import { createRefreshCoordinator } from "../src/utils/refreshCoordinator.js";

test("concurrent refresh callers share one rotated refresh request", async () => {
  let storedRefreshToken = "rt_1";
  let callCount = 0;

  const coordinator = createRefreshCoordinator({
    readRefreshToken: () => storedRefreshToken,
    writeTokens: (tokens) => {
      storedRefreshToken = tokens.refreshToken;
    },
    requestRefresh: async (refreshToken) => {
      callCount += 1;
      assert.equal(refreshToken, "rt_1");
      await Promise.resolve();
      return {
        accessToken: "at_2",
        refreshToken: "rt_2",
      };
    },
  });

  const [first, second] = await Promise.all([
    coordinator.refresh(),
    coordinator.refresh(),
  ]);

  assert.equal(callCount, 1);
  assert.deepEqual(first, {
    accessToken: "at_2",
    refreshToken: "rt_2",
  });
  assert.deepEqual(second, first);
  assert.equal(storedRefreshToken, "rt_2");
});

test("a later refresh call uses the newly rotated token", async () => {
  let storedRefreshToken = "rt_1";
  const seenTokens: string[] = [];

  const coordinator = createRefreshCoordinator({
    readRefreshToken: () => storedRefreshToken,
    writeTokens: (tokens) => {
      storedRefreshToken = tokens.refreshToken;
    },
    requestRefresh: async (refreshToken) => {
      seenTokens.push(refreshToken);
      if (refreshToken === "rt_1") {
        return {
          accessToken: "at_2",
          refreshToken: "rt_2",
        };
      }
      return {
        accessToken: "at_3",
        refreshToken: "rt_3",
      };
    },
  });

  await coordinator.refresh();
  await coordinator.refresh();

  assert.deepEqual(seenTokens, ["rt_1", "rt_2"]);
});

test("refresh coordinator publishes token rotation to other tabs", async () => {
  let storedRefreshToken = "rt_1";
  const published: Array<{ accessToken: string; refreshToken: string }> = [];

  const coordinator = createRefreshCoordinator({
    readRefreshToken: () => storedRefreshToken,
    writeTokens: (tokens) => {
      storedRefreshToken = tokens.refreshToken;
    },
    onTokensRefreshed: (tokens) => {
      published.push(tokens);
    },
    requestRefresh: async () => ({
      accessToken: "at_2",
      refreshToken: "rt_2",
    }),
  });

  await coordinator.refresh();

  assert.deepEqual(published, [{ accessToken: "at_2", refreshToken: "rt_2" }]);
});

test("separate tab coordinators recover when another tab rotated the refresh token first", async () => {
  let storedRefreshToken = "rt_1";
  const seenTokens: string[] = [];
  let firstRequestReleased = false;

  async function waitForFirstRequestRelease() {
    while (!firstRequestReleased) {
      await Promise.resolve();
    }
  }

  function makeCoordinator() {
    return createRefreshCoordinator({
      readRefreshToken: () => storedRefreshToken,
      writeTokens: (tokens) => {
        storedRefreshToken = tokens.refreshToken;
      },
      requestRefresh: async (refreshToken) => {
        seenTokens.push(refreshToken);
        if (seenTokens.length === 1) {
          firstRequestReleased = true;
        } else if (refreshToken === "rt_1") {
          await waitForFirstRequestRelease();
          await Promise.resolve();
        }
        if (refreshToken !== storedRefreshToken) {
          const error: any = new Error("Invalid or expired refresh token");
          error.response = { status: 401 };
          throw error;
        }
        const version = Number(refreshToken.slice("rt_".length)) + 1;
        return {
          accessToken: `at_${version}`,
          refreshToken: `rt_${version}`,
        };
      },
    });
  }

  const firstTab = makeCoordinator();
  const secondTab = makeCoordinator();

  const [first, second] = await Promise.all([
    firstTab.refresh(),
    secondTab.refresh(),
  ]);

  assert.deepEqual(first, {
    accessToken: "at_2",
    refreshToken: "rt_2",
  });
  assert.deepEqual(second, {
    accessToken: "at_3",
    refreshToken: "rt_3",
  });
  assert.equal(storedRefreshToken, "rt_3");
  assert.deepEqual(seenTokens, ["rt_1", "rt_1", "rt_2"]);
});

test("separate tab coordinators wait for a just-rotated token before logging out", async () => {
  let storedRefreshToken = "rt_1";
  const seenTokens: string[] = [];
  let releaseFirstRotation!: () => void;
  const firstRotationWritten = new Promise<void>((resolve) => {
    releaseFirstRotation = resolve;
  });

  const firstTab = createRefreshCoordinator({
    readRefreshToken: () => storedRefreshToken,
    writeTokens: (tokens) => {
      storedRefreshToken = tokens.refreshToken;
      releaseFirstRotation();
    },
    requestRefresh: async (refreshToken) => {
      seenTokens.push(`first:${refreshToken}`);
      assert.equal(refreshToken, "rt_1");
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { accessToken: "at_2", refreshToken: "rt_2" };
    },
  });

  const secondTab = createRefreshCoordinator({
    readRefreshToken: () => storedRefreshToken,
    writeTokens: (tokens) => {
      storedRefreshToken = tokens.refreshToken;
    },
    requestRefresh: async (refreshToken) => {
      seenTokens.push(`second:${refreshToken}`);
      if (refreshToken === "rt_1") {
        const error: any = new Error("Invalid or expired refresh token");
        error.response = { status: 401 };
        return Promise.reject(error);
      }
      assert.equal(refreshToken, "rt_2");
      return { accessToken: "at_3", refreshToken: "rt_3" };
    },
  });

  const [first, second] = await Promise.all([
    firstTab.refresh(),
    secondTab.refresh(),
  ]);
  await firstRotationWritten;

  assert.deepEqual(first, { accessToken: "at_2", refreshToken: "rt_2" });
  assert.deepEqual(second, { accessToken: "at_3", refreshToken: "rt_3" });
  assert.equal(storedRefreshToken, "rt_3");
  assert.deepEqual(seenTokens, ["first:rt_1", "second:rt_1", "second:rt_2"]);
});
