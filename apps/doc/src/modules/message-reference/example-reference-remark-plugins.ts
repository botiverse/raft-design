import type { MarkdownPluginList } from "#/lib/markdown/markdown-plugins.ts";
import { createRemarkReferences } from "#/lib/markdown/create-remark-references.ts";
import {
  EXAMPLE_REFERENCE_ACTORS,
  EXAMPLE_REFERENCE_CHANNELS,
} from "./example-reference.fixtures.ts";

/** Marks the references the docs example sources write as plain `@name` / `#name` text. */
export const EXAMPLE_REFERENCE_REMARK_PLUGINS: MarkdownPluginList = [
  createRemarkReferences({
    actorNames: EXAMPLE_REFERENCE_ACTORS.map((actor) => actor.name),
    channelNames: EXAMPLE_REFERENCE_CHANNELS.map((channel) => channel.name),
  }),
];
