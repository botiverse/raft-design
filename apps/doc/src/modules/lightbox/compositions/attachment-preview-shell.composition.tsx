import { Download, X } from "lucide-react";
import { Badge, Button } from "raft-ui";
import {
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxHeader,
  LightboxStage,
  LightboxTitle,
  LightboxTrigger,
} from "raft-ui";

export function AttachmentPreviewShellComposition() {
  return (
    <Lightbox modal={false}>
      <LightboxTrigger render={<Button type="button" variant="default" />}>
        Open attachment preview
      </LightboxTrigger>
      <LightboxContent render={<section aria-label="Attachment preview" />}>
        <LightboxHeader>
          <div className="flex h-14 items-center gap-3 px-4">
            <LightboxTitle>diagram-export.html</LightboxTitle>
            <Badge appearance="soft" uppercase>
              HTML preview
            </Badge>
            <LightboxActions>
              <Button type="button" size="icon-sm" aria-label="Download">
                <Download />
              </Button>
              <LightboxClose render={<Button type="button" size="icon-sm" aria-label="Close" />}>
                <X />
              </LightboxClose>
            </LightboxActions>
          </div>
        </LightboxHeader>
        <LightboxStage>
          <iframe title="Attachment preview" className="h-full w-full bg-white" />
        </LightboxStage>
      </LightboxContent>
    </Lightbox>
  );
}
