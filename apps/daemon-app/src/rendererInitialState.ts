import type { DaemonAppState, DaemonViewState } from "./model";

export function parseRequestedViewState(search: string): DaemonViewState | null {
  const raw = new URLSearchParams(search).get("state");
  switch (raw) {
    case "login":
    case "setup":
    case "dashboard":
    case "providers":
      return raw;
    default:
      return null;
  }
}

export function resolveInitialRendererState(
  state: DaemonAppState,
  requestedViewState: DaemonViewState | null,
): DaemonAppState {
  if (!requestedViewState || state.currentView === requestedViewState) {
    return state;
  }

  return {
    ...state,
    currentView: requestedViewState,
  };
}
