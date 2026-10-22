import { useCallback, useState } from "react";
import { Link as LinkIcon } from "lucide-react";
import {
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
  PreviewCardFooter,
  PreviewCardMeta,
} from "@botiverse/raft-ui/wip";

export function PreviewCardAppPromptComposition() {
  const [allowed, setAllowed] = useState(false);
  const handleAllow = useCallback(() => {
    setAllowed(true);
  }, []);

  return (
    <div className="flex size-full min-h-72 items-start justify-center pt-8">
      <p className="m-0 max-w-full text-sm leading-6 text-foreground">
        <span>The fix is in </span>
        {allowed ? (
          <MessageReferenceChip
            variant="info"
            capped
            render={<a href="#stamp-pull-10449" target="_blank" rel="noopener noreferrer" />}
          >
            <MessageReferenceIcon>
              <img src="/app-icons/stamp.svg" alt="" />
            </MessageReferenceIcon>
            <MessageReferenceLabel>
              #10449 refactor(i18n): one display-locale source for web and desktop
            </MessageReferenceLabel>
          </MessageReferenceChip>
        ) : (
          <PreviewCard>
            <PreviewCardTrigger
              render={
                <MessageReferenceChip
                  variant="muted"
                  capped
                  render={<a href="#stamp-pull-10449" target="_blank" rel="noopener noreferrer" />}
                />
              }
            >
              <LinkIcon />
              <MessageReferenceLabel>stamp.build/botiverse/slock/pull/10449</MessageReferenceLabel>
            </PreviewCardTrigger>
            <PreviewCardContent>
              <PreviewCardBody>
                <PreviewCardTitle>Show previews from Stamp?</PreviewCardTitle>
                <PreviewCardMeta>
                  Stamp will show you the title and details of its links in your messages.
                </PreviewCardMeta>
              </PreviewCardBody>
              <PreviewCardActions>
                <Button variant="outline" onClick={handleAllow}>
                  Show Previews
                </Button>
              </PreviewCardActions>
              <PreviewCardFooter>Stamp · stamp.build</PreviewCardFooter>
            </PreviewCardContent>
          </PreviewCard>
        )}
        <span>, merged this morning.</span>
      </p>
    </div>
  );
}
