import assert from "node:assert/strict";
import test from "node:test";
import {
  canRemoveAdminMember,
  getAdminCandidateMembers,
  getAdminMembers,
  getAdminRoleOptions,
  type ServerAdminSettingsMember,
} from "../src/utils/serverAdminSettings.js";

const members: ServerAdminSettingsMember[] = [
  { userId: "owner-1", name: "owner", displayName: "Owner", email: "owner@slock.ai", role: "owner" },
  { userId: "admin-2", name: "zoe", displayName: "Zoe", email: "zoe@slock.ai", role: "admin" },
  { userId: "admin-1", name: "ada", displayName: "Ada", email: "ada@slock.ai", role: "admin" },
  { userId: "member-1", name: "member", displayName: "Member", email: "member@slock.ai", role: "member" },
];

test("admin settings list owners first then admins in stable label order", () => {
  assert.deepEqual(
    getAdminMembers(members).map((member) => member.userId),
    ["owner-1", "admin-1", "admin-2"]
  );
});

test("admin settings add candidates are existing members that the actor can promote", () => {
  assert.deepEqual(
    getAdminCandidateMembers(members, "owner").map((member) => member.userId),
    ["admin-1", "member-1", "admin-2"]
  );
  assert.deepEqual(
    getAdminCandidateMembers(members, "admin").map((member) => member.userId),
    ["member-1"]
  );
  assert.deepEqual(
    getAdminCandidateMembers(members, "member").map((member) => member.userId),
    []
  );
});

test("admin settings role options follow server role transition policy", () => {
  assert.deepEqual(getAdminRoleOptions("owner", { role: "member" }), ["owner", "admin"]);
  assert.deepEqual(getAdminRoleOptions("owner", { role: "admin" }), ["owner"]);
  assert.deepEqual(getAdminRoleOptions("admin", { role: "member" }), ["admin"]);
  assert.deepEqual(getAdminRoleOptions("admin", { role: "admin" }), []);
});

test("admin settings remove action follows server role transition policy", () => {
  assert.equal(canRemoveAdminMember("owner", { role: "admin" }), true);
  assert.equal(canRemoveAdminMember("admin", { role: "admin" }), false);
  assert.equal(canRemoveAdminMember("owner", { role: "owner" }, 2), true);
  assert.equal(canRemoveAdminMember("owner", { role: "owner" }, 1), false);
});
