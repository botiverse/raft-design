/**
 * Tracks Codex app-server turn lifecycle state used for stdin steering.
 *
 * This is deliberately independent from event parsing. The normalizer decides
 * which raw event means "turn started", "progress", or "tool boundary"; this
 * helper owns only the derived state budget.
 */
export class RuntimeTurnState {
  private currentTurnId: string | null = null;
  /**
   * Post-tool window where the app-server may not yet accept stdin steering.
   * Gate busy-mode delivery until turn/completed or next progress.
   */
  private steeringGateActive = false;

  reset() {
    this.currentTurnId = null;
    this.steeringGateActive = false;
  }

  get activeTurnId(): string | null {
    return this.currentTurnId;
  }

  get canSteerBusy(): boolean {
    return Boolean(this.currentTurnId && !this.steeringGateActive);
  }

  markTurnStarted(turnId?: string | null) {
    if (turnId !== undefined && turnId !== null) {
      this.currentTurnId = turnId;
    }
    this.steeringGateActive = false;
  }

  adoptTurnId(turnId: string) {
    this.currentTurnId = turnId;
  }

  markProgress() {
    this.steeringGateActive = false;
  }

  markToolBoundary() {
    this.steeringGateActive = true;
  }

  markTurnCompleted() {
    this.currentTurnId = null;
    this.steeringGateActive = false;
  }
}
