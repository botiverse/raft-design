// A long, deterministic channel history for the VirtualList examples: message `n` is always the same,
// so older pages can be built on demand and every reload shows the same rows.

export type ChannelMessage = {
  id: string;
  n: number;
  sender: string;
  type: "human" | "agent";
  time: string;
  text: string;
};

const SENDERS = [
  { name: "Martin", type: "human" },
  { name: "Wug", type: "agent" },
  { name: "Bugen", type: "agent" },
] as const;

const TEXTS = [
  "Picking this up.",
  "The staging deploy is green. Running the smoke suite before we tag the release.",
  "Can someone check the rollback runbook? The step for the cache warm-up still points at the old dashboard.",
  "Done, the fixtures are regenerated and the snapshots match.",
  "I compared the error rate before and after the change across the last three days. It is flat on web and slightly lower on iOS, which is what we expected from moving the retry into the client. I'll keep watching it overnight.",
  "Thanks!",
  "Moving the review to tomorrow morning so Bugen can rerun the suite first.",
  "The migration touched 1,284 rows. Two of them had a null owner; I left those as they were and opened a task for them.",
  "Agreed.",
  "Here is the plan for the rest of the week: finish the importer, write the release notes, and pair with Martin on the flaky upload test. If the importer slips I'll say so here first.",
  "Looks good, merging after CI.",
  "The upload test failed again on the second retry. Attaching the trace.",
] as const;

/** Message `n` of the channel (0 is the oldest). */
export function createChannelMessage(n: number): ChannelMessage {
  const sender = SENDERS[(n * 5) % SENDERS.length]!;
  const minutes = 9 * 60 + ((n * 3) % (10 * 60));
  const time = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
  return {
    id: `message-${n}`,
    n,
    sender: sender.name,
    type: sender.type,
    time,
    text: TEXTS[(n * 5) % TEXTS.length]!,
  };
}

/** `count` messages from message `from` on, oldest first. */
export function createChannelMessages(from: number, count: number): ChannelMessage[] {
  return Array.from({ length: count }, (_, i) => createChannelMessage(from + i));
}

/** The words an agent's reply streams in, one at a time. */
export const STREAMED_REPLY =
  "I went through the failed runs from this morning. All of them time out on the same upload step, after the second retry, and only on the runners in the new region. The file itself is fine: the same test passes locally and on the old runners. My guess is the new region's proxy closes idle connections sooner than our client expects. I'll lower the keep-alive in the test client and rerun the suite there.".split(
    " ",
  );

export type ReleaseNote = {
  id: string;
  version: string;
  changes: string[];
};

const CHANGES = [
  "Threads open beside the conversation instead of over it.",
  "Agents show what they are working on in the member list.",
  "Search finds messages by the files attached to them.",
  "Pasting a link to a task shows its status in the message.",
  "The composer keeps a draft per channel.",
  "Reactions are grouped by emoji, with who reacted on hover.",
  "Fixed a crash when an image failed to load in a thread.",
  "Fixed the unread line jumping when older messages loaded.",
] as const;

/** Release notes, newest first: each release has one to four changes. */
export function createReleaseNotes(count: number): ReleaseNote[] {
  return Array.from({ length: count }, (_, i) => {
    const release = count - i;
    const changeCount = 1 + ((release * 7) % 4);
    return {
      id: `release-${release}`,
      version: `0.${Math.floor(release / 10)}.${release % 10}`,
      changes: Array.from(
        { length: changeCount },
        (_, j) => CHANGES[(release * 3 + j) % CHANGES.length]!,
      ),
    };
  });
}
