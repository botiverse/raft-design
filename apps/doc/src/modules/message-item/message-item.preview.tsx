import { useState, type ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import {
  MessageItemPreview,
  type MessageItemPreviewChrome,
  type MessageItemPreviewTranslation,
} from "./compositions/item-preview.composition.tsx";

const SCENARIO_OPTIONS = ["message", "consecutive"] as const;

type PreviewScenario = (typeof SCENARIO_OPTIONS)[number];

const CHROME_OPTIONS = [
  "default",
  "active",
  "search-match",
  "selected",
] as const satisfies readonly Exclude<MessageItemPreviewChrome, "continuation">[];

const CONTENT_OPTIONS = ["plain", "markdown", "translation"] as const;

type PreviewContent = (typeof CONTENT_OPTIONS)[number];

const ATTACHMENT_OPTIONS = ["none", "image", "video", "files", "all"] as const;

type PreviewAttachments = (typeof ATTACHMENT_OPTIONS)[number];

const TRANSLATION_BY_CONTENT = {
  plain: "none",
  markdown: "none",
  translation: "translated",
} as const satisfies Record<PreviewContent, MessageItemPreviewTranslation>;

type CodeContent = ReactNode | AnyRenderableServerComponent;

type MessageItemPlaygroundPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function MessageItemPlaygroundPreview({
  code,
  collapsedCode,
}: MessageItemPlaygroundPreviewProps) {
  const [scenario, setScenario] = useState<PreviewScenario>("message");
  const [chrome, setChrome] = useState<(typeof CHROME_OPTIONS)[number]>("default");
  const [content, setContent] = useState<PreviewContent>("plain");
  const [attachments, setAttachments] = useState<PreviewAttachments>("none");
  const [replies, setReplies] = useState(false);
  const [reactions, setReactions] = useState(true);
  const [saved, setSaved] = useState(false);
  const [toolbar, setToolbar] = useState(true);

  const isMessage = scenario === "message";

  const image = attachments === "image" || attachments === "all";
  const video = attachments === "video" || attachments === "all";
  const files = attachments === "files" || attachments === "all";

  return (
    <Preview previewMode="light" previewClassName="items-stretch">
      <Preview.Canvas>
        <div className="w-full max-w-3xl">
          <MessageItemPreview
            chrome={scenario === "consecutive" ? "continuation" : chrome}
            markdown={content === "markdown"}
            translation={TRANSLATION_BY_CONTENT[content]}
            image={isMessage && image}
            video={isMessage && video}
            files={isMessage && files}
            saved={isMessage && saved}
            replies={isMessage && replies}
            reactions={isMessage && reactions}
            toolbar={isMessage && toolbar && chrome !== "selected"}
          />
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.ControlGroup label="Scenario">
          <Preview.Segmented
            label="Scenario"
            options={SCENARIO_OPTIONS}
            value={scenario}
            onValueChange={(value) => setScenario(value as PreviewScenario)}
          />
        </Preview.ControlGroup>

        {isMessage ? (
          <>
            <Preview.ControlGroup label="Row">
              <Preview.Control label="Chrome" htmlFor="message-item-preview-chrome">
                <Preview.Select
                  id="message-item-preview-chrome"
                  label="Chrome"
                  options={CHROME_OPTIONS}
                  value={chrome}
                  onValueChange={(value) => setChrome(value as (typeof CHROME_OPTIONS)[number])}
                />
              </Preview.Control>
              <Preview.Control label="Content" htmlFor="message-item-preview-content">
                <Preview.Select
                  id="message-item-preview-content"
                  label="Content"
                  options={CONTENT_OPTIONS}
                  value={content}
                  onValueChange={(value) => setContent(value as PreviewContent)}
                />
              </Preview.Control>
              <Preview.Control label="Attachments" htmlFor="message-item-preview-attachments">
                <Preview.Select
                  id="message-item-preview-attachments"
                  label="Attachments"
                  options={ATTACHMENT_OPTIONS}
                  value={attachments}
                  onValueChange={(value) => setAttachments(value as PreviewAttachments)}
                />
              </Preview.Control>
            </Preview.ControlGroup>

            <Preview.ControlGroup label="Footer">
              <Preview.Control label="Replies" htmlFor="message-item-preview-replies">
                <Preview.Checkbox
                  id="message-item-preview-replies"
                  label="Replies"
                  checked={replies}
                  onCheckedChange={setReplies}
                />
              </Preview.Control>
              <Preview.Control label="Reactions" htmlFor="message-item-preview-reactions">
                <Preview.Checkbox
                  id="message-item-preview-reactions"
                  label="Reactions"
                  checked={reactions}
                  onCheckedChange={setReactions}
                />
              </Preview.Control>
              <Preview.Control label="Saved" htmlFor="message-item-preview-saved">
                <Preview.Checkbox
                  id="message-item-preview-saved"
                  label="Saved"
                  checked={saved}
                  onCheckedChange={setSaved}
                />
              </Preview.Control>
              {chrome !== "selected" ? (
                <Preview.Control label="Toolbar" htmlFor="message-item-preview-toolbar">
                  <Preview.Checkbox
                    id="message-item-preview-toolbar"
                    label="Toolbar"
                    checked={toolbar}
                    onCheckedChange={setToolbar}
                  />
                </Preview.Control>
              ) : null}
            </Preview.ControlGroup>
          </>
        ) : null}
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
