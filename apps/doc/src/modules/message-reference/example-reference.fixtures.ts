import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

type ExampleReferenceActor = {
  name: string;
  preview: string;
  readState?: "read" | "unread";
  self: boolean;
};

/** Actors, channels, and tasks the docs Markdown examples reference by name. */
export const EXAMPLE_REFERENCE_ACTORS: readonly ExampleReferenceActor[] = [
  { name: "Atlas", preview: "Atlas · owner", readState: "read", self: false },
  { name: "Ada", preview: "Ada · current workspace member", self: true },
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
  {
    href: MESSAGE_PLAYGROUND_URLS.northstarJointChannel,
    name: "northstar-launch-handoff",
    treatment: "joint",
  },
] as const;

export const EXAMPLE_REFERENCE_TASKS = [
  { href: MESSAGE_PLAYGROUND_URLS.stateModelTask, number: "21", status: "in-progress" },
] as const;
