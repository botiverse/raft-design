import { AlertTriangle, Paperclip, Send, X } from "lucide-react";
import { useState } from "react";
import { Banner, BannerAction, BannerDescription, BannerTitle, Button } from "raft-ui";
import {
  Composer,
  ComposerActions,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
} from "raft-ui/wip";

import { ComposerAttachmentsComposition } from "./composer-shared.composition.tsx";

const MAX_ATTACHMENTS = 10;

export function ComposerAttachmentLimitComposition() {
  const [count, setCount] = useState(MAX_ATTACHMENTS);
  const [limitReached, setLimitReached] = useState(true);

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {limitReached ? (
        <Banner status="warning" size="md" className="w-full">
          <AlertTriangle />
          <BannerTitle>Attachment limit reached</BannerTitle>
          <BannerDescription>
            You can attach up to {MAX_ATTACHMENTS} files per message.
          </BannerDescription>
          <BannerAction>
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Dismiss attachment limit notice"
              onClick={() => setLimitReached(false)}
            >
              <X />
            </Button>
          </BannerAction>
        </Banner>
      ) : null}
      <ComposerRoot>
        <ComposerAttachmentsComposition
          imageStates={[]}
          fileStates={Array.from({ length: count }, () => "uploaded" as const)}
          onRemove={() => {
            setCount((current) => Math.max(0, current - 1));
            setLimitReached(false);
          }}
        />
        <Composer>
          <ComposerInput aria-label="Message #proj-uiux" placeholder="Message #proj-uiux" />
          <ComposerToolbar>
            <ComposerActions>
              <ComposerIconButton
                aria-label="Attach file"
                onClick={() => {
                  if (count >= MAX_ATTACHMENTS) {
                    setLimitReached(true);
                    return;
                  }
                  setCount((current) => current + 1);
                  setLimitReached(false);
                }}
              >
                <Paperclip />
              </ComposerIconButton>
            </ComposerActions>
            <ComposerMeta>
              <ComposerSubmit aria-label="Send" disabled>
                <Send />
              </ComposerSubmit>
            </ComposerMeta>
          </ComposerToolbar>
        </Composer>
      </ComposerRoot>
    </div>
  );
}
