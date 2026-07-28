import type { Components } from "react-markdown";
import { MarkdownLink, TaskChip } from "raft-ui";
import { MessageReferenceChip } from "raft-ui/wip";
import { parseMarkdownReference } from "#/lib/markdown/parse-markdown-reference.ts";
import {
  MessageMentionReferenceComposition,
  MessageSelfMentionReferenceComposition,
  MessageTargetReferenceComposition,
} from "./compositions/reference-adapters.composition.tsx";
import {
  EXAMPLE_REFERENCE_ACTORS,
  EXAMPLE_REFERENCE_CHANNELS,
  EXAMPLE_REFERENCE_TASKS,
} from "./example-reference.fixtures.ts";

function findActor(name: string) {
  return EXAMPLE_REFERENCE_ACTORS.find(
    (actor) => actor.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
  );
}

function findChannel(name: string) {
  return EXAMPLE_REFERENCE_CHANNELS.find(
    (channel) => channel.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
  );
}

/**
 * Maps the marked references in a docs example source onto the reference adapters, mirroring how
 * a product renderer resolves them against its own entities.
 */
export function createExampleReferenceComponents(portalContainer?: HTMLElement | null): Components {
  return {
    a: ({ node, href, children, ...props }) => {
      const reference = parseMarkdownReference(node?.properties?.dataMarkdownReference);

      if (!reference) {
        return (
          <MarkdownLink {...props} href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </MarkdownLink>
        );
      }

      if (reference.kind === "mention") {
        const actor = findActor(reference.name);
        if (!actor) return <>{children}</>;

        const Mention = actor.self
          ? MessageSelfMentionReferenceComposition
          : MessageMentionReferenceComposition;

        // The adapters strip the sigil off a string label, so pass the resolved name.
        return (
          <Mention portalContainer={portalContainer} preview={<p>{actor.preview}</p>}>
            {actor.name}
          </Mention>
        );
      }

      if (reference.kind === "task") {
        const task = EXAMPLE_REFERENCE_TASKS.find(
          (candidate) => candidate.number === reference.number,
        );
        if (!task) return <>{children}</>;

        return (
          <TaskChip status={task.status} render={<a href={task.href} />}>
            {`#${task.number}`}
          </TaskChip>
        );
      }

      const channel = findChannel(reference.name);
      if (!channel) return <>{children}</>;

      if (channel.treatment === "target") {
        return (
          <MessageTargetReferenceComposition href={channel.href}>
            {channel.name}
          </MessageTargetReferenceComposition>
        );
      }

      if (reference.shortId) {
        return (
          <MessageReferenceChip variant="info" render={<a href={channel.threadHref} />}>
            {children}
          </MessageReferenceChip>
        );
      }

      return (
        <MessageReferenceChip variant="accent" render={<a href={channel.href} />}>
          {children}
        </MessageReferenceChip>
      );
    },
  };
}
