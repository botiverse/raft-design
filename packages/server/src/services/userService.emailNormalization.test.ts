import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { closeDatabase, getDb, initDatabase } from "../db/index.js";
import { passwordResets, users } from "../db/schema.js";
import { requestPasswordReset } from "./userService.js";

afterEach(async () => {
  await closeDatabase();
});

test("forgot-password lookup normalizes input before lookup", async () => {
  await initDatabase("pglite://");
  const db = getDb();

  const [user] = await db.insert(users).values({
    id: "11111111-1111-1111-1111-111111111111",
    email: "owner@example.com",
    name: "owner",
    displayName: "owner",
    passwordHash: "hash",
    emailVerified: true,
  }).returning();

  await requestPasswordReset("Owner@Example.COM");

  const rows = await db.select().from(passwordResets);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].userId, user.id);
});
