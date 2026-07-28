import type { Components } from "react-markdown";
import { MessageMarkdownAdapter } from "#/lib/message-markdown/message-markdown-adapter.tsx";
import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { createMessageMarkdownSource } from "../message-markdown.fixtures.ts";

export type MessageMarkdownCompositionProps = {
  /** Docs-only source adapter; product adapters may replace nodes with domain components. */
  components?: Components;
  imageSrc?: string;
  source?: string;
};

export function MessageMarkdownComposition({
  components,
  imageSrc = MESSAGE_FIXTURE_IMAGE_SRC,
  source,
}: MessageMarkdownCompositionProps = {}) {
  return (
    <MessageMarkdownAdapter
      source={source ?? createMessageMarkdownSource(imageSrc)}
      components={components}
    />
  );
}
