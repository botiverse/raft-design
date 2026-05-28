import { canChangeMemberRole, type ServerRole } from "@slock-ai/shared";

export interface ServerAdminSettingsMember {
  userId: string;
  name: string;
  displayName: string | null;
  email: string | null;
  avatarUrl?: string | null;
  gravatarHash?: string;
  role: ServerRole;
}

export function getPrivilegedMembers(members: ServerAdminSettingsMember[]) {
  return members
    .filter((member) => member.role === "owner" || member.role === "admin")
    .sort((left, right) => {
      if (left.role !== right.role) return left.role === "owner" ? -1 : 1;
      return getMemberLabel(left).localeCompare(getMemberLabel(right));
    });
}

export const getAdminMembers = getPrivilegedMembers;

export function getAdminCandidateMembers(
  members: ServerAdminSettingsMember[],
  actorRole: ServerRole | null | undefined
) {
  return members
    .filter((member) =>
      member.role !== "owner" &&
      (canChangeMemberRole(actorRole, member.role, "owner") || canChangeMemberRole(actorRole, member.role, "admin"))
    )
    .sort((left, right) => getMemberLabel(left).localeCompare(getMemberLabel(right)));
}

export function getAdminRoleOptions(
  actorRole: ServerRole | null | undefined,
  member: Pick<ServerAdminSettingsMember, "role">,
) {
  return (["owner", "admin"] as const).filter((role) => role !== member.role && canChangeMemberRole(actorRole, member.role, role));
}

export function canRemoveAdminMember(
  actorRole: ServerRole | null | undefined,
  member: Pick<ServerAdminSettingsMember, "role">,
  ownerCount = Number.POSITIVE_INFINITY,
) {
  if (member.role !== "owner" && member.role !== "admin") return false;
  if (member.role === "owner" && ownerCount <= 1) return false;
  return canChangeMemberRole(actorRole, member.role, "member");
}

export function getMemberLabel(member: Pick<ServerAdminSettingsMember, "name" | "displayName" | "email">) {
  return member.displayName || member.name || member.email || "Unknown member";
}
