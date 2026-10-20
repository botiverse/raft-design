import { MESSAGE_EXAMPLE_HREFS } from "#/modules/message-item/message-item.fixtures.ts";

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
    href: MESSAGE_EXAMPLE_HREFS.releaseNotesChannel,
    name: "release-notes",
    threadHref: MESSAGE_EXAMPLE_HREFS.releaseNotesThread,
    treatment: "chip",
  },
  {
    href: MESSAGE_EXAMPLE_HREFS.allChannel,
    name: "all",
    threadHref: MESSAGE_EXAMPLE_HREFS.stateModelThread,
    treatment: "chip",
  },
  {
    href: MESSAGE_EXAMPLE_HREFS.northstarJointChannel,
    name: "northstar-launch-handoff",
    treatment: "joint",
  },
] as const;

export const EXAMPLE_REFERENCE_TASKS = [
  { href: MESSAGE_EXAMPLE_HREFS.stateModelTask, number: "21", status: "in-progress" },
] as const;
