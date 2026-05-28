export interface ProviderDashboardBannerState {
  actionLabel: string;
  message: string;
}

export function buildProviderDashboardActionLabel(
  configuredProviderCount: number,
  pendingProviderCount: number,
  systemProviderAttentionCount: number,
  hasAvailableProviderKinds: boolean,
): string {
  if (configuredProviderCount === 0) {
    if (systemProviderAttentionCount > 0) {
      return "Review Provider Setup";
    }
    if (pendingProviderCount > 0) {
      return "Finish Provider Setup";
    }
    return "Add Provider";
  }
  return hasAvailableProviderKinds ? "Manage Providers" : "View Providers";
}

export function buildProviderDashboardBannerState(
  configuredProviderCount: number,
  pendingProviderCount: number,
  systemProviderMessage: string | null,
): ProviderDashboardBannerState | null {
  if (configuredProviderCount > 0) {
    return null;
  }
  if (systemProviderMessage) {
    return {
      message: systemProviderMessage,
      actionLabel: "Review setup",
    };
  }
  if (pendingProviderCount > 0) {
    return {
      message: "Provider setup still needs local credentials.",
      actionLabel: "Finish setup",
    };
  }
  return {
    message: "No model provider configured.",
    actionLabel: "Add one now",
  };
}
