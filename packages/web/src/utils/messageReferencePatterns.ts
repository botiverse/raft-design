// Single grammar source for channel / thread / DM reference tokens.
//
// These raw pattern fragments are the ONE place the ref grammar is defined.
// Both the message-body renderer (via the factories below) and the Activity
// Diagnostics tokenizer (which composes its own combined scan regex) MUST
// build from these exported constants — never re-spell the char classes.
// Otherwise a grammar change (e.g. allowing `.` in channel names) would shift
// chat rendering while activity links silently drift. (@Bugen review,
// 2026-05-18 #proj-uiux:2921feaf — exactly the bug class this seam kills.)

/** Channel-name char class (Unicode letters/numbers + `_` `-`). */
export const CHANNEL_REF_NAME_PATTERN = String.raw`[\p{L}\p{N}_-]+`;

/** Thread short-id: 6–8 lowercase hex chars. */
export const THREAD_SHORT_ID_PATTERN = String.raw`[\da-f]{6,8}`;

// DM peer handles are restricted to ASCII word chars + hyphen, matching the
// existing `dm:@peer` parsing in MessageItem.tsx. Kept narrower than the
// channel-name class on purpose so `dm:@a:b` style targets parse cleanly.
/** DM peer-handle char class. */
export const DM_REF_PEER_PATTERN = String.raw`[\w-]+`;

export function createChannelThreadRefRegex(): RegExp {
  return new RegExp(`#(${CHANNEL_REF_NAME_PATTERN}):(${THREAD_SHORT_ID_PATTERN})`, "giu");
}

export function createChannelRefRegex(): RegExp {
  return new RegExp(`#(${CHANNEL_REF_NAME_PATTERN})`, "gu");
}

export function createDmThreadRefRegex(): RegExp {
  return new RegExp(`dm:@(${DM_REF_PEER_PATTERN}):(${THREAD_SHORT_ID_PATTERN})`, "giu");
}

export function createDmRefRegex(): RegExp {
  return new RegExp(`dm:@(${DM_REF_PEER_PATTERN})`, "giu");
}
