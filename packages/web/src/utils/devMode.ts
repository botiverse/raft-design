export const SLOCKDEV_EMAIL = "dev@slock.ai";
export const SLOCKDEV_PASSWORD = "password123";

export type AuthView = "login" | "register" | "forgot-password";

export function isSlockdevEnvironment(deploymentEnv: string | undefined | null): boolean {
  return deploymentEnv === "slockdev";
}

export function getEnvironmentLabel(deploymentEnv: string | undefined | null): string | null {
  if (deploymentEnv === "slockdev") return "Dev";
  if (deploymentEnv === "staging") return "Staging";
  return null;
}

export function getSlockdevSeedCommand(envName: string | undefined | null): string {
  const name = envName?.trim() || "<env>";
  return `./slockdev seed ${name}`;
}

export function shouldAutoDismissSlockdevAnnouncement(deploymentEnv: string | undefined | null): boolean {
  return isSlockdevEnvironment(deploymentEnv);
}

export function shouldAutoLoginSlockdev(params: {
  deploymentEnv: string | undefined | null;
  initialized: boolean;
  attempted: boolean;
  hasUser: boolean;
  hasStoredSession: boolean;
  authView: AuthView;
  authCallback: string | null;
  resetToken: string | null;
  inviteToken: string | null;
}): boolean {
  return (
    isSlockdevEnvironment(params.deploymentEnv)
    && params.initialized
    && !params.attempted
    && !params.hasUser
    && !params.hasStoredSession
    && params.authView === "login"
    && !params.authCallback
    && !params.resetToken
    && !params.inviteToken
  );
}
