export type ServerRole = "owner" | "admin" | "member";
export type ManageableServerRole = ServerRole;
export const MANAGEABLE_SERVER_ROLES = ["owner", "admin", "member"] as const satisfies readonly ManageableServerRole[];

export interface ServerCapabilities {
  manageServer: boolean;
  manageChannels: boolean;
  manageAgents: boolean;
  manageMachines: boolean;
  manageMembers: boolean;
  changeMemberRoles: boolean;
  manageBilling: boolean;
  joinPublicChannels: boolean;
}

export type ServerCapability = keyof ServerCapabilities;

export const SERVER_CAPABILITY_KEYS = [
  "manageServer",
  "manageChannels",
  "manageAgents",
  "manageMachines",
  "manageMembers",
  "changeMemberRoles",
  "manageBilling",
  "joinPublicChannels",
] as const satisfies readonly ServerCapability[];

const EMPTY_SERVER_CAPABILITIES: Readonly<ServerCapabilities> = Object.freeze({
  manageServer: false,
  manageChannels: false,
  manageAgents: false,
  manageMachines: false,
  manageMembers: false,
  changeMemberRoles: false,
  manageBilling: false,
  joinPublicChannels: false,
});

const SERVER_CAPABILITY_MATRIX: Record<ServerRole, Readonly<ServerCapabilities>> = {
  owner: Object.freeze({
    manageServer: true,
    manageChannels: true,
    manageAgents: true,
    manageMachines: true,
    manageMembers: true,
    changeMemberRoles: true,
    manageBilling: true,
    joinPublicChannels: true,
  }),
  admin: Object.freeze({
    manageServer: true,
    manageChannels: true,
    manageAgents: true,
    manageMachines: true,
    manageMembers: true,
    changeMemberRoles: true,
    manageBilling: false,
    joinPublicChannels: true,
  }),
  member: Object.freeze({
    manageServer: false,
    manageChannels: false,
    manageAgents: false,
    manageMachines: false,
    manageMembers: false,
    changeMemberRoles: false,
    manageBilling: false,
    joinPublicChannels: true,
  }),
};

export function isOwnerRole(role: ServerRole | null | undefined): role is "owner" {
  return role === "owner";
}

export function isAdminOrOwner(role: ServerRole | null | undefined): role is "owner" | "admin" {
  return role === "owner" || role === "admin";
}

export function getServerCapabilities(role: ServerRole | null | undefined): Readonly<ServerCapabilities> {
  return role ? SERVER_CAPABILITY_MATRIX[role] : EMPTY_SERVER_CAPABILITIES;
}

export function hasServerCapability(role: ServerRole | null | undefined, capability: ServerCapability): boolean {
  return getServerCapabilities(role)[capability];
}

/**
 * Owner is a normal server membership role. Owners can grant/revoke owner,
 * admin, and member roles; the server route enforces the data-dependent
 * invariant that a server must keep at least one owner. Admin behavior stays
 * intentionally narrow: admins can promote members to admin, but cannot touch
 * owners or demote peer admins.
 */
export function canChangeMemberRole(
  actorRole: ServerRole | null | undefined,
  targetRole: ServerRole | null | undefined,
  nextRole: ManageableServerRole
): boolean {
  if (!actorRole || !targetRole) {
    return false;
  }

  if (actorRole === "owner") {
    return true;
  }

  if (actorRole === "admin") {
    return targetRole === "member" && nextRole === "admin";
  }

  return false;
}
