/**
 * Owns pending busy-delivery notification state.
 *
 * The count is intentionally separate from inbox length: it tracks messages
 * queued since the last notification attempt, so compaction suppression and
 * encode failures can restore the notification debt without duplicating inbox
 * state.
 */
export class RuntimeNotificationState {
  private timerValue: ReturnType<typeof setTimeout> | null = null;
  private pendingCountValue = 0;

  get pendingCount(): number {
    return this.pendingCountValue;
  }

  get timer(): ReturnType<typeof setTimeout> | null {
    return this.timerValue;
  }

  get hasTimer(): boolean {
    return this.timerValue !== null;
  }

  add(count = 1): number {
    this.pendingCountValue += count;
    return this.pendingCountValue;
  }

  clearPending() {
    this.pendingCountValue = 0;
  }

  clearTimer() {
    if (this.timerValue) {
      clearTimeout(this.timerValue);
      this.timerValue = null;
    }
  }

  clear() {
    this.clearPending();
    this.clearTimer();
  }

  schedule(callback: () => void, delayMs: number): boolean {
    if (this.timerValue) return false;
    this.timerValue = setTimeout(callback, delayMs);
    return true;
  }

  takePendingAndClearTimer(): number {
    const count = this.pendingCountValue;
    this.pendingCountValue = 0;
    this.clearTimer();
    return count;
  }
}
