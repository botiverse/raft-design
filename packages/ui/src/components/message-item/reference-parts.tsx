import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageReference, type MessageReferenceVariantProps } from "./message-reference.recipe";
import { type DataAttributes } from "./recipe";

type MessageReferenceTreatment = NonNullable<MessageReferenceVariantProps["treatment"]>;
type MessageReferenceLinkProps = useRender.ComponentProps<"a">;
type MessageReferenceStatusProps = useRender.ComponentProps<"span">;

function useMessageReferenceLink(
  treatment: MessageReferenceTreatment,
  slot: string,
  { className, render, ...props }: MessageReferenceLinkProps,
) {
  const theme = useThemeFamily();
  const { root } = messageReference({ treatment, theme });
  const defaultProps: useRender.ElementProps<"a"> & DataAttributes = {
    "data-message-reference": "",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(defaultProps, props),
    state: { slot },
  });
}

function useMessageReferenceStatus(
  treatment: MessageReferenceTreatment,
  slot: string,
  { className, render, ...props }: MessageReferenceStatusProps,
) {
  const theme = useThemeFamily();
  const { root } = messageReference({ treatment, theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot },
  });
}

export type MessageReferenceMentionProps = MessageReferenceLinkProps;

export function MessageReferenceMention(props: MessageReferenceMentionProps) {
  return useMessageReferenceLink("mention", "message-reference-mention", props);
}

export type MessageReferenceSelfMentionProps = MessageReferenceLinkProps;

export function MessageReferenceSelfMention(props: MessageReferenceSelfMentionProps) {
  return useMessageReferenceLink("selfMention", "message-reference-self-mention", props);
}

export type MessageReferenceChannelProps = MessageReferenceLinkProps;

export function MessageReferenceChannel(props: MessageReferenceChannelProps) {
  return useMessageReferenceLink("channel", "message-reference-channel", props);
}

export type MessageReferenceTaskProps = MessageReferenceLinkProps;

export function MessageReferenceTask(props: MessageReferenceTaskProps) {
  return useMessageReferenceLink("task", "message-reference-task", props);
}

export type MessageReferenceThreadProps = MessageReferenceLinkProps;

export function MessageReferenceThread(props: MessageReferenceThreadProps) {
  return useMessageReferenceLink("thread", "message-reference-thread", props);
}

export type MessageReferencePermalinkProps = MessageReferenceLinkProps & {
  external?: boolean;
};

export function MessageReferencePermalink({ external, ...props }: MessageReferencePermalinkProps) {
  return useMessageReferenceLink(
    external ? "externalPermalink" : "permalink",
    "message-reference-permalink",
    props,
  );
}

export type MessageReferenceLoadingProps = MessageReferenceStatusProps;

export function MessageReferenceLoading(props: MessageReferenceLoadingProps) {
  return useMessageReferenceStatus("loading", "message-reference-loading", props);
}

export type MessageReferenceUnavailableProps = MessageReferenceStatusProps & {
  kind: "channel" | "task" | "thread";
};

export function MessageReferenceUnavailable({ kind, ...props }: MessageReferenceUnavailableProps) {
  return useMessageReferenceStatus(
    `${kind}Unavailable` as MessageReferenceTreatment,
    "message-reference-unavailable",
    props,
  );
}

export type MessageReferenceLabelProps = useRender.ComponentProps<"span">;

export function MessageReferenceLabel({ className, render, ...props }: MessageReferenceLabelProps) {
  const { label } = messageReference();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: label({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-label" },
  });
}

export type MessageReferenceMetaProps = useRender.ComponentProps<"span">;

export function MessageReferenceMeta({ className, render, ...props }: MessageReferenceMetaProps) {
  const { meta } = messageReference();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-reference-meta" },
  });
}
