export interface LoginEntryState {
  buttonLabel: string;
  description: string;
  shouldAuthenticateInApp: boolean;
}

export function buildLoginEntryState(localEncryptionAvailable: boolean): LoginEntryState {
  if (!localEncryptionAvailable) {
    return {
      buttonLabel: "Save server locally",
      description:
        "Local secret encryption is unavailable in this environment, so the daemon app cannot store a Slock session on this machine. You can still save this server locally, but in-app Slock login remains unavailable.",
      shouldAuthenticateInApp: false,
    };
  }

  return {
    buttonLabel: "Login with Slock",
    description:
      "Opens a secure Slock sign-in window inside the app, syncs the workspaces you can manage, and prepares the local shell for direct machine registration.",
    shouldAuthenticateInApp: true,
  };
}
