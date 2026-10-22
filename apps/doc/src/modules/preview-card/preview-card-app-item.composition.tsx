import {
  Badge,
  Button,
  MessageReferenceChip,
  MessageReferenceLabel,
  PreviewCard,
  PreviewCardContent,
  PreviewCardTitle,
  PreviewCardTrigger,
} from "@botiverse/raft-ui";
import {
  MessageReferenceIcon,
  PreviewCardActions,
  PreviewCardBody,
  PreviewCardEyebrow,
  PreviewCardFooter,
  PreviewCardMeta,
} from "@botiverse/raft-ui/wip";

export function PreviewCardAppItemComposition() {
  return (
    <div className="flex size-full min-h-80 items-start justify-center pt-8">
      <p className="m-0 max-w-full text-sm leading-6 text-foreground">
        <span>The fix is in </span>
        <PreviewCard>
          <PreviewCardTrigger
            render={
              <MessageReferenceChip
                variant="info"
                capped
                render={<a href="#stamp-pull-10449" target="_blank" rel="noopener noreferrer" />}
              />
            }
          >
            <MessageReferenceIcon>
              <img src="/app-icons/stamp.svg" alt="" />
            </MessageReferenceIcon>
            <MessageReferenceLabel>
              #10449 refactor(i18n): one display-locale source for web and desktop
            </MessageReferenceLabel>
          </PreviewCardTrigger>
          <PreviewCardContent>
            <PreviewCardBody>
              <PreviewCardEyebrow>botiverse/slock</PreviewCardEyebrow>
              <PreviewCardTitle>
                #10449 refactor(i18n): one display-locale source for web and desktop
              </PreviewCardTitle>
              <PreviewCardMeta>
                <Badge appearance="outline" variant="muted">
                  Merged
                </Badge>
                <span>Martin · +803 −498</span>
              </PreviewCardMeta>
            </PreviewCardBody>
            <PreviewCardActions>
              <Button
                variant="outline"
                render={<a href="#stamp-pull-10449" target="_blank" rel="noopener noreferrer" />}
              >
                Open in Stamp
              </Button>
              <Button
                variant="ghost"
                render={
                  <a href="#stamp-pull-10449-files" target="_blank" rel="noopener noreferrer" />
                }
              >
                View Changes
              </Button>
            </PreviewCardActions>
            <PreviewCardFooter>Stamp · stamp.build</PreviewCardFooter>
          </PreviewCardContent>
        </PreviewCard>
        <span>, merged this morning.</span>
      </p>
    </div>
  );
}
