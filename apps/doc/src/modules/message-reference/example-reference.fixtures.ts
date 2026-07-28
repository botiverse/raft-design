import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

/** Actors, channels, and tasks the docs Markdown examples reference by name. */
export const EXAMPLE_REFERENCE_ACTORS = [
  { name: "Atlas", preview: "Atlas · owner", self: false },
  { name: "you", preview: "You · Current workspace member", self: true },
] as const;

export const EXAMPLE_REFERENCE_CHANNELS = [
  {
    href: MESSAGE_PLAYGROUND_URLS.releaseNotesChannel,
    name: "release-notes",
    threadHref: MESSAGE_PLAYGROUND_URLS.releaseNotesThread,
    treatment: "chip",
  },
  {
    href: MESSAGE_PLAYGROUND_URLS.apiDocsMessage,
    name: "all",
    treatment: "target",
  },
] as const;

export const EXAMPLE_REFERENCE_TASKS = [
  { href: MESSAGE_PLAYGROUND_URLS.stateModelTask, number: "21", status: "in_progress" },
] as const;
