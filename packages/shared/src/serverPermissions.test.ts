import assert from "node:assert/strict";
import test from "node:test";
import type { ServerCapability, ServerRole } from "./serverPermissions.js";
import {
  canChangeMemberRole,
  MANAGEABLE_SERVER_ROLES,
  SERVER_CAPABILITY_KEYS,
  getServerCapabilities,
  hasServerCapability,
  isAdminOrOwner,
  isOwnerRole,
} from "./serverPermissions.js";

const EXPECTED_CAPABILITIES: Record<ServerRole, Record<ServerCapability, boolean>> = {
  owner: {
    manageServer: true,
    manageChannels: true,
    manageAgents: true,
    manageMachines: true,
    manageMembers: true,
    changeMemberRoles: true,
    manageBilling: true,
    joinPublicChannels: true,
  },
  admin: {
    manageServer: true,
    manageChannels: true,
    manageAgents: true,
    manageMachines: true,
    manageMembers: true,
    changeMemberRoles: true,
    manageBilling: false,
    joinPublicChannels: true,
  },
  member: {
    manageServer: false,
    manageChannels: false,
    manageAgents: false,
    manageMachines: false,
    manageMembers: false,
    changeMemberRoles: false,
    manageBilling: false,
    joinPublicChannels: true,
  },
};

for (const role of Object.keys(EXPECTED_CAPABILITIES) as ServerRole[]) {
  test(`capability matrix stays stable for ${role}`, () => {
    assert.deepStrictEqual(getServerCapabilities(role), EXPECTED_CAPABILITIES[role]);

    for (const capability of SERVER_CAPABILITY_KEYS) {
      assert.equal(hasServerCapability(role, capability), EXPECTED_CAPABILITIES[role][capability]);
    }
  });
}

test("nullish roles get no capabilities", () => {
  for (const capability of SERVER_CAPABILITY_KEYS) {
    assert.equal(hasServerCapability(null, capability), false);
    assert.equal(hasServerCapability(undefined, capability), false);
  }
});

test("owner/admin/member invariants remain intact", () => {
  assert.equal(isOwnerRole("owner"), true);
  assert.equal(isOwnerRole("admin"), false);
  assert.equal(isAdminOrOwner("owner"), true);
  assert.equal(isAdminOrOwner("admin"), true);
  assert.equal(isAdminOrOwner("member"), false);

  for (const capability of ["manageServer", "manageChannels", "manageAgents", "manageMachines", "manageMembers", "joinPublicChannels"] satisfies ServerCapability[]) {
    assert.equal(
      hasServerCapability("owner", capability),
      hasServerCapability("admin", capability),
      `${capability} should stay aligned for owner/admin`
    );
  }

  assert.equal(hasServerCapability("owner", "changeMemberRoles"), true);
  assert.equal(hasServerCapability("admin", "changeMemberRoles"), true);
  assert.equal(hasServerCapability("member", "changeMemberRoles"), false);

  assert.equal(hasServerCapability("owner", "manageBilling"), true);
  assert.equal(hasServerCapability("admin", "manageBilling"), false);
  assert.equal(hasServerCapability("member", "manageBilling"), false);
});

test("role transition rules stay aligned with the simplified owner/admin/member model", () => {
  for (const nextRole of MANAGEABLE_SERVER_ROLES) {
    assert.equal(canChangeMemberRole("owner", "member", nextRole), true);
    assert.equal(canChangeMemberRole("owner", "admin", nextRole), true);
    assert.equal(canChangeMemberRole("owner", "owner", nextRole), true);
  }

  assert.equal(canChangeMemberRole("admin", "member", "admin"), true);
  assert.equal(canChangeMemberRole("admin", "member", "member"), false);
  assert.equal(canChangeMemberRole("admin", "member", "owner"), false);
  assert.equal(canChangeMemberRole("admin", "admin", "admin"), false);
  assert.equal(canChangeMemberRole("admin", "admin", "member"), false);
  assert.equal(canChangeMemberRole("admin", "admin", "owner"), false);
  assert.equal(canChangeMemberRole("admin", "owner", "admin"), false);
  assert.equal(canChangeMemberRole("admin", "owner", "member"), false);
  assert.equal(canChangeMemberRole("admin", "owner", "owner"), false);

  for (const nextRole of MANAGEABLE_SERVER_ROLES) {
    assert.equal(canChangeMemberRole("member", "member", nextRole), false);
    assert.equal(canChangeMemberRole(null, "member", nextRole), false);
    assert.equal(canChangeMemberRole(undefined, "admin", nextRole), false);
  }
});
