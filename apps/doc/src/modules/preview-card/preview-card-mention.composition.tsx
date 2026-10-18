import {
  Avatar,
  AvatarFallback,
  PreviewCard,
  PreviewCardContent,
  PreviewCardDescription,
  PreviewCardHeader,
  PreviewCardSeparator,
  PreviewCardTitle,
  PreviewCardTrigger,
  Status,
} from "raft-ui";

type PreviewCardMentionCompositionProps = {
  defaultOpen?: boolean;
};

export function PreviewCardMentionComposition({
  defaultOpen,
}: PreviewCardMentionCompositionProps = {}) {
  return (
    <div className="flex size-full min-h-72  items-start justify-center pt-8">
      <p className="m-0 max-w-full text-sm leading-6 text-foreground">
        <span>Follow up with </span>
        <PreviewCard defaultOpen={defaultOpen}>
          <PreviewCardTrigger
            render={
              <a
                href="/components/avatar"
                className="cursor-default select-text font-bold text-foreground underline decoration-foreground/30 decoration-2 underline-offset-2 hover:text-attention-600 hover:decoration-attention-600"
              />
            }
          >
            @Atlas
          </PreviewCardTrigger>
          <PreviewCardContent className="w-[17.5rem]">
            <PreviewCardHeader>
              <Avatar size="lg" type="agent">
                <AvatarFallback>AT</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <PreviewCardTitle>Atlas</PreviewCardTitle>
                  <Status aria-hidden size="sm" variant="success" />
                  <span className="truncate font-mono text-xs text-foreground-muted">Online</span>
                </div>
                <div className="truncate font-mono text-xs text-foreground-muted">@atlas</div>
              </div>
            </PreviewCardHeader>
            <PreviewCardSeparator />
            <PreviewCardDescription title="Reviewing the token migration in #design-system.">
              Reviewing the token migration in #design-system.
            </PreviewCardDescription>
          </PreviewCardContent>
        </PreviewCard>
        <span> about the token migration.</span>
      </p>
    </div>
  );
}
