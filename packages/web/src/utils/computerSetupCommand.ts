export const STAGING_COMPUTER_SERVER_URL = "https://slock-server-staging.fly.dev";

export interface ComputerSetupCommandOptions {
  legacyApiKey?: string | null;
}

export function getComputerSetupCommand(
  serverSlug: string | undefined | null,
  deploymentEnv = import.meta.env?.VITE_DEPLOYMENT_ENV,
  serverUrl?: string,
  options: ComputerSetupCommandOptions = {},
): string | null {
  const slug = serverSlug?.trim().replace(/^\/+/, "");
  if (!slug) return null;
  if (slug !== "botiverse" && deploymentEnv !== "slockdev") return null;

  const commandServerUrl = deploymentEnv === "staging"
    ? STAGING_COMPUTER_SERVER_URL
    : deploymentEnv === "slockdev"
      ? serverUrl
      : null;
  const legacyKey = options.legacyApiKey?.trim();
  const adoptArgs = legacyKey ? ` --adopt-legacy --legacy-api-key ${legacyKey}` : "";
  const serverUrlArg = commandServerUrl ? ` --server-url ${commandServerUrl}` : "";
  return `npx @slock-ai/computer@latest setup /${slug}${adoptArgs}${serverUrlArg}`;
}
