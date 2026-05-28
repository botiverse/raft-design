import { hasServerCapability, type ServerCapability, type ServerRole } from "@slock-ai/shared";
import * as serverService from "../services/serverService.js";

export async function getServerRole(serverId: string, userId: string): Promise<ServerRole | null> {
  return serverService.getMemberRole(serverId, userId);
}

export async function userHasServerCapability(serverId: string, userId: string, capability: ServerCapability): Promise<boolean> {
  return hasServerCapability(await getServerRole(serverId, userId), capability);
}
