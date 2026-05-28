import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import {
  __resetSessionServiceDbForTests,
  __setSessionServiceDbForTests,
  rotateSession,
} from "./sessionService.js";
import { sessions } from "../db/schema.js";

type DeleteCapture = { table?: unknown };
type InsertCapture = { table?: unknown; values?: Record<string, unknown> };

function makeDeleteBuilder<T>(result: T, capture?: DeleteCapture) {
  const afterWhere: any = {
    returning() {
      return afterWhere;
    },
    then(resolve: (value: T) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };

  return {
    where() {
      return afterWhere;
    },
  };
}

function makeInsertBuilder(capture?: InsertCapture) {
  const afterValues: any = {
    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(undefined).then(resolve, reject);
    },
  };

  return {
    values(values: Record<string, unknown>) {
      if (capture) capture.values = values;
      return afterValues;
    },
  };
}

function makeDb(options: {
  deleteResults: unknown[][];
  insertCaptures?: InsertCapture[];
}) {
  const deleteResults = [...options.deleteResults];
  const insertCaptures = [...(options.insertCaptures ?? [])];

  return {
    transaction: async (fn: (tx: any) => Promise<unknown>) => {
      const tx = {
        delete(table: unknown) {
          const result = deleteResults.shift();
          if (!result) throw new Error("Unexpected delete");
          return makeDeleteBuilder(result, { table });
        },
        insert(table: unknown) {
          const capture = insertCaptures.shift();
          if (capture) capture.table = table;
          return makeInsertBuilder(capture);
        },
      };

      return fn(tx);
    },
  };
}

afterEach(() => {
  __resetSessionServiceDbForTests();
});

test("rotateSession consumes a refresh token only once", async () => {
  const insertCapture: InsertCapture = {};
  const db = makeDb({
    deleteResults: [[{ userId: "user-1" }], []],
    insertCaptures: [insertCapture],
  });
  __setSessionServiceDbForTests(() => db as any);

  const first = await rotateSession("refresh-token-1", "user-1");
  const second = await rotateSession("refresh-token-1", "user-1");

  assert.ok(first?.refreshToken);
  assert.ok(first?.expiresAt instanceof Date);
  assert.equal(second, null);
  assert.equal(insertCapture.table, sessions);
  assert.equal(insertCapture.values?.userId, "user-1");
});

test("refresh interleaving cannot fork one validated token into two child sessions", async () => {
  const firstInsertCapture: InsertCapture = {};
  const secondInsertCapture: InsertCapture = {};
  const db = makeDb({
    deleteResults: [[{ userId: "user-1" }], []],
    insertCaptures: [firstInsertCapture, secondInsertCapture],
  });
  __setSessionServiceDbForTests(() => db as any);

  // This models two /auth/refresh handlers that both validated the same old
  // refresh token before either handler attempted rotation.
  const validatedUserIdFromRequestA = "user-1";
  const validatedUserIdFromRequestB = "user-1";

  const first = await rotateSession("refresh-token-1", validatedUserIdFromRequestA);
  const second = await rotateSession("refresh-token-1", validatedUserIdFromRequestB);

  assert.ok(first?.refreshToken);
  assert.equal(second, null);
  assert.equal(firstInsertCapture.table, sessions);
  assert.equal(firstInsertCapture.values?.userId, "user-1");
  assert.equal(secondInsertCapture.values, undefined);
});

test("rotateSession does not create a child token when no session row is consumed", async () => {
  const db = makeDb({
    deleteResults: [[]],
    insertCaptures: [],
  });
  __setSessionServiceDbForTests(() => db as any);

  const rotated = await rotateSession("refresh-token-1", "user-1");

  assert.equal(rotated, null);
});
