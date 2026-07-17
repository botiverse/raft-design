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
  imageFailed: boolean;
  fileUpload: boolean;
  failedUpload: boolean;
  dropOverlay: boolean;
};

export function ChatComposerPreview() {
  return (
    <ComponentPlayground<ComposerPreviewValues>
      key="composer-preview-six-attachment-states"
      defaultValues={{
        draft: "",
        imageUpload: true,
        imageFailed: true,
        fileUpload: true,
        failedUpload: true,
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
          name: "imageFailed",
          label: "Failed image upload",
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
          name: "failedUpload",
          label: "Failed file upload",
          type: "boolean",
        },
        { group: "Feedback", name: "dropOverlay", label: "Drop overlay", type: "boolean" },
      ]}
      previewClassName="items-stretch"
      render={(values, onValueChange) => {
        const submitDisabled =
          values.imageUpload || values.imageFailed || values.fileUpload || values.failedUpload;

        return (
          <div className="flex min-h-[22rem] w-full min-w-0 flex-col justify-end px-2">
            <ComposerRoot>
              <ComposerAttachmentsComposition
                imageStates={[
                  "uploaded",
                  ...(values.imageUpload ? (["uploading"] as const) : []),
                  ...(values.imageFailed ? (["failed"] as const) : []),
                ]}
                fileStates={[
                  "uploaded",
                  ...(values.fileUpload ? (["uploading"] as const) : []),
                  ...(values.failedUpload ? (["failed"] as const) : []),
                  "uploaded",
                  "uploaded",
                  "uploaded",
                ]}
                onRetry={(name) => {
                  if (name.endsWith(".png")) {
                    onValueChange("imageFailed", false);
                    onValueChange("imageUpload", true);
                    return;
                  }
                  onValueChange("failedUpload", false);
                  onValueChange("fileUpload", true);
                }}
              />
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
                    <ComposerSubmit aria-label="Send" disabled={submitDisabled}>
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
        );
      }}
    />
  );
}
