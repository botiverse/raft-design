import type { Components } from "react-markdown";
import { GitBranch, Hash } from "lucide-react";
import {
  MarkdownLink,
  MessageReferenceChip,
  MessageReferenceLabel,
  PreviewCardDescription,
  PreviewCardHeader,
  PreviewCardSeparator,
  PreviewCardTitle,
  TaskChip,
  TaskStatusIcon,
} from "@botiverse/raft-ui";
import { MessageReferenceReadMark } from "@botiverse/raft-ui/wip";
import { parseMarkdownReference } from "#/lib/markdown/parse-markdown-reference.ts";
import { MessageMentionReferenceComposition } from "./compositions/reference-adapters.composition.tsx";
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

        return (
          <MessageMentionReferenceComposition
            portalContainer={portalContainer}
            preview={
              actor.readState ? (
                <>
                  <PreviewCardHeader>
                    <PreviewCardTitle>{actor.preview}</PreviewCardTitle>
                  </PreviewCardHeader>
                  <PreviewCardSeparator />
                  <PreviewCardDescription>
                    {actor.readState === "read" ? "Read" : "Not read yet"}
                  </PreviewCardDescription>
                </>
              ) : (
                <p>{actor.preview}</p>
              )
            }
            variant={actor.self ? "primary" : "secondary"}
          >
            {`@${actor.name}`}
            {actor.readState === "read" ? (
              <MessageReferenceReadMark>Read</MessageReferenceReadMark>
            ) : null}
          </MessageMentionReferenceComposition>
        );
      }

      if (reference.kind === "task") {
        const task = EXAMPLE_REFERENCE_TASKS.find(
          (candidate) => candidate.number === reference.number,
        );
        if (!task) return <>{children}</>;

        return (
          <TaskChip
            variant="inline"
            status={task.status}
            render={<a href={task.href} aria-label={`Open task #${task.number}`} />}
          >
            <TaskStatusIcon status={task.status} />
            {`#${task.number}`}
          </TaskChip>
        );
      }

      const channel = findChannel(reference.name);
      if (!channel) return <>{children}</>;

      if (channel.treatment === "joint") {
        return (
          <MessageReferenceChip
            variant="accent"
            render={<a href={channel.href} aria-label={`Open joint channel #${channel.name}`} />}
          >
            <GitBranch />
            <MessageReferenceLabel>{channel.name}</MessageReferenceLabel>
          </MessageReferenceChip>
        );
      }

      if (reference.shortId) {
        return (
          <MessageReferenceChip
            variant="info"
            render={<a href={channel.threadHref} aria-label={`Open thread in #${channel.name}`} />}
          >
            <Hash />
            <MessageReferenceLabel>{channel.name}</MessageReferenceLabel>
          </MessageReferenceChip>
        );
      }

      return (
        <MessageReferenceChip
          variant="accent"
          render={<a href={channel.href} aria-label={`Open #${channel.name}`} />}
        >
          <Hash />
          <MessageReferenceLabel>{channel.name}</MessageReferenceLabel>
        </MessageReferenceChip>
      );
    },
  };
}
