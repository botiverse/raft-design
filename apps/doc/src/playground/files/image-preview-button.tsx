import { Download, X } from "lucide-react";
import {
  Button,
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxHeader,
  LightboxMedia,
  LightboxStage,
  LightboxTitle,
  LightboxTrigger,
} from "@botiverse/raft-ui";
import { MessageImageGalleryPreview } from "@botiverse/raft-ui";

import { openMockAttachmentPreview } from "./open-mock-attachment-preview.ts";

export function ImagePreviewButton({ src, name }: { src: string; name: string }) {
  return (
    <Lightbox>
      <LightboxTrigger render={<MessageImageGalleryPreview aria-label={`Preview ${name}`} />} />
      <LightboxContent>
        <LightboxHeader>
          <LightboxTitle>{name}</LightboxTitle>
          <LightboxActions>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Download"
              title="Download"
              onClick={openMockAttachmentPreview}
            >
              <Download />
            </Button>
            <LightboxClose
              render={
                <Button size="icon-sm" variant="outline" aria-label="Close" title="Close">
                  <X />
                </Button>
              }
            />
          </LightboxActions>
        </LightboxHeader>
        <LightboxStage>
          <LightboxMedia render={<img src={src} alt={name} />} />
        </LightboxStage>
      </LightboxContent>
    </Lightbox>
  );
}
