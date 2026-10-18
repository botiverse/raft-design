import { Download, X } from "lucide-react";
import {
  Badge,
  Button,
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxHeaderMeta,
  LightboxStage,
  LightboxTitle,
  LightboxToolbar,
  LightboxTrigger,
} from "raft-ui";

function AttachmentPreviewTypeLabel() {
  return <Badge variant="primary">HTML preview</Badge>;
}

export function AttachmentPreviewShellComposition() {
  return (
    <Lightbox modal={false}>
      <LightboxTrigger render={<Button type="button" variant="default" />}>
        Open attachment preview
      </LightboxTrigger>
      <LightboxContent render={<section aria-label="Attachment preview" />}>
        <LightboxToolbar>
          <LightboxHeaderMeta title="diagram-export.html · HTML preview">
            <AttachmentPreviewTypeLabel />
            <LightboxTitle>diagram-export.html</LightboxTitle>
          </LightboxHeaderMeta>
          <LightboxActions>
            <Button type="button" variant="default" size="icon-sm" aria-label="Download">
              <Download />
            </Button>
            <LightboxClose
              aria-label="Close"
              render={<Button type="button" variant="default" size="icon-sm" />}
            >
              <X />
            </LightboxClose>
          </LightboxActions>
        </LightboxToolbar>
        <LightboxStage>
          <iframe
            title="Attachment preview"
            src="https://example.com"
            className="size-full border-0 bg-white"
            referrerPolicy="no-referrer"
            sandbox=""
          />
        </LightboxStage>
      </LightboxContent>
    </Lightbox>
  );
}
