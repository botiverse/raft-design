import { ImagePlus, Paperclip, Send } from "lucide-react";
import { Checkbox } from "raft-ui";
import {
  Composer,
  ComposerActions,
  ComposerDropOverlay,
  ComposerDropOverlayPrompt,
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
  imageUpload: boolean;
  fileUpload: boolean;
  manyAttachments: boolean;
  failedUpload: boolean;
  dropOverlay: boolean;
};

export function ChatComposerPreview() {
  return (
    <ComponentPlayground<ComposerPreviewValues>
      defaultValues={{
        draft: "",
        imageUpload: false,
        fileUpload: false,
        manyAttachments: false,
        failedUpload: false,
        dropOverlay: false,
      }}
      controls={[
        {
          group: "Attachments",
          name: "imageUpload",
          label: "Uploading image",
          type: "boolean",
        },
        {
          group: "Attachments",
          name: "fileUpload",
          label: "Uploading file",
          type: "boolean",
        },
        {
          group: "Attachments",
          name: "manyAttachments",
          label: "Many attachments",
          type: "boolean",
        },
        { group: "Attachments", name: "failedUpload", label: "Failed upload", type: "boolean" },
        { group: "Feedback", name: "dropOverlay", label: "Drop overlay", type: "boolean" },
      ]}
      previewClassName="items-stretch"
      render={(values, onValueChange) => (
        <div className="flex min-h-[22rem] w-full min-w-0 flex-col justify-end px-2">
          <ComposerRoot>
            {values.imageUpload ||
            values.fileUpload ||
            values.manyAttachments ||
            values.failedUpload ? (
              <ComposerAttachmentsComposition
                image={values.imageUpload}
                file={values.fileUpload}
                fileCount={values.manyAttachments ? 10 : undefined}
                fileUploading={values.fileUpload}
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
                  <ComposerIconButton
                    aria-label="Attach image"
                    onClick={() => onValueChange("imageUpload", !values.imageUpload)}
                  >
                    <ImagePlus />
                  </ComposerIconButton>
                  <ComposerIconButton
                    aria-label="Attach file"
                    onClick={() => onValueChange("fileUpload", !values.fileUpload)}
                  >
                    <Paperclip />
                  </ComposerIconButton>
                </ComposerActions>
                <ComposerMeta>
                  <ComposerToolbarLabel>
                    <Checkbox size="sm" aria-label="Send as task" />
                    As Task
                  </ComposerToolbarLabel>
                  <ComposerSubmit aria-label="Send" disabled={!values.draft.trim()}>
                    <span>Send</span>
                    <Send />
                  </ComposerSubmit>
                </ComposerMeta>
              </ComposerToolbar>
            </Composer>
            {values.dropOverlay ? (
              <ComposerDropOverlay aria-hidden>
                <ComposerDropOverlayPrompt />
              </ComposerDropOverlay>
            ) : null}
          </ComposerRoot>
        </div>
      )}
    />
  );
}
