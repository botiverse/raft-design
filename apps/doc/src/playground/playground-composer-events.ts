const PLAYGROUND_COMPOSER_MENTION_EVENT = "playground:composer-mention";

type PlaygroundComposerMentionDetail = {
  mention: string;
};

export function emitPlaygroundComposerMention(mention: string) {
  window.dispatchEvent(
    new CustomEvent<PlaygroundComposerMentionDetail>(PLAYGROUND_COMPOSER_MENTION_EVENT, {
      detail: { mention },
    }),
  );
}

export function subscribeToPlaygroundComposerMentions(listener: (mention: string) => void) {
  const handleMention = (event: Event) => {
    listener((event as CustomEvent<PlaygroundComposerMentionDetail>).detail.mention);
  };

  window.addEventListener(PLAYGROUND_COMPOSER_MENTION_EVENT, handleMention);
  return () => window.removeEventListener(PLAYGROUND_COMPOSER_MENTION_EVENT, handleMention);
}
