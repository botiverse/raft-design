export const STATUSES = ["process", "finish", "error", "wait"] as const;

/** A step's own status in the preview; `auto` leaves it to `current`. */
export const STEP_STATUS_OPTIONS = ["auto", ...STATUSES] as const;
