import {
  shouldRetryAuthRestore,
  type AuthRestoreState,
} from "./authRestoreMachine";

export function shouldRecoverAuthOnBrowserSignal(params: {
  visible: boolean;
  online: boolean;
  initialized: boolean;
  restoreState: AuthRestoreState;
  hasStoredSession: boolean;
}): boolean {
  if (!params.visible || !params.online) return false;
  return shouldRetryAuthRestore({
    initialized: params.initialized,
    restoreState: params.restoreState,
    hasStoredSession: params.hasStoredSession,
  });
}

export function getLiveSessionRecoveryPlan(params: {
  visible: boolean;
  online: boolean;
  hasStoredSession: boolean;
  socketConnected: boolean;
}): {
  reconnectSocket: boolean;
  reloadLiveData: boolean;
} {
  if (!params.visible || !params.online || !params.hasStoredSession) {
    return {
      reconnectSocket: false,
      reloadLiveData: false,
    };
  }

  return {
    reconnectSocket: !params.socketConnected,
    reloadLiveData: true,
  };
}
