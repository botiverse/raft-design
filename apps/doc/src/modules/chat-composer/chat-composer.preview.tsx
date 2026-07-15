import { ImagePlus, Paperclip, Send } from "lucide-react";
import { Checkbox } from "raft-ui";
import {
  Composer,
  ComposerActions,
  ComposerDropOverlay,
  ComposerDropOverlayLabel,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
  ComposerToolbarLabel,
} from "raft-ui/wip";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { ComposerAttachmentsComposition } from "./compositions/composer-shared.composition.tsx";

type ComposerPreviewValues = {
  draft: string;
  asTask: boolean;
  imageUpload: boolean;
  fileUpload: boolean;
  failedUpload: boolean;
  dropOverlay: boolean;
};

export function ChatComposerPreview() {
  return (
    <ComponentPlayground<ComposerPreviewValues>
      defaultValues={{
        draft: "",
        asTask: false,
        imageUpload: false,
        fileUpload: false,
        failedUpload: false,
        dropOverlay: false,
      }}
      controls={[
        { group: "Toolbar", name: "asTask", label: "As Task", type: "boolean" },
        { group: "Attachments", name: "imageUpload", label: "Image upload", type: "boolean" },
        { group: "Attachments", name: "fileUpload", label: "File upload", type: "boolean" },
        { group: "Attachments", name: "failedUpload", label: "Failed upload", type: "boolean" },
        { group: "Feedback", name: "dropOverlay", label: "Drop overlay", type: "boolean" },
      ]}
      previewClassName="items-stretch"
      render={(values, onValueChange) => (
        <div className="flex h-[22rem] w-full min-w-0 flex-col justify-end px-2">
          <ComposerRoot positioned={values.dropOverlay}>
            {values.imageUpload || values.fileUpload || values.failedUpload ? (
              <ComposerAttachmentsComposition
                image={values.imageUpload}
                file={values.fileUpload}
                failed={values.failedUpload}
              />
            ) : null}
            <Composer>
              <ComposerInput
                aria-label="Message #proj-uiux"
                placeholder="Message #proj-uiux"
                value={values.draft}
                onChange={(event) => onValueChange("draft", event.currentTarget.value)}
              />
              <ComposerToolbar>
                <ComposerActions>
                  <ComposerIconButton aria-label="Attach image" disabled>
                    <ImagePlus />
                  </ComposerIconButton>
                  <ComposerIconButton aria-label="Attach file" disabled>
                    <Paperclip />
                  </ComposerIconButton>
                </ComposerActions>
                <ComposerMeta>
                  <ComposerToolbarLabel>
                    <Checkbox
                      checked={values.asTask}
                      onCheckedChange={(checked) => onValueChange("asTask", checked)}
                      size="sm"
                      aria-label="Send as task"
                    />
                    As Task
                  </ComposerToolbarLabel>
                  <ComposerSubmit aria-label="Send" disabled>
                    <span>Send</span>
                    <Send />
                  </ComposerSubmit>
                </ComposerMeta>
              </ComposerToolbar>
            </Composer>
            {values.dropOverlay ? (
              <ComposerDropOverlay aria-hidden>
                <ComposerDropOverlayLabel>Drop files to attach</ComposerDropOverlayLabel>
              </ComposerDropOverlay>
            ) : null}
          </ComposerRoot>
        </div>
      )}
    />
  );
}
