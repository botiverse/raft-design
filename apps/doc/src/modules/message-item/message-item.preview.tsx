import { useState, type ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import {
  MessageItemPreview,
  type MessageItemPreviewChrome,
  type MessageItemPreviewProductState,
  type MessageItemPreviewSenderState,
  type MessageItemPreviewSystemEvent,
  type MessageItemPreviewTranslation,
} from "./compositions/item-preview.composition.tsx";

const CHROME_OPTIONS = [
  "default",
  "active",
  "search-match",
  "selected",
  "continuation",
] as const satisfies readonly MessageItemPreviewChrome[];

const CONTENT_OPTIONS = [
  "plain",
  "markdown",
  "translation pending",
  "translation",
  "translation bilingual",
  "translation unavailable",
] as const;

type PreviewContent = (typeof CONTENT_OPTIONS)[number];

const SCENARIO_OPTIONS = [
  "message",
  "forwarded",
  "quoted",
  "quoted states",
  "action",
  "system",
] as const;

type PreviewScenario = (typeof SCENARIO_OPTIONS)[number];

const TRANSLATION_BY_CONTENT = {
  plain: "none",
  markdown: "none",
  "translation pending": "pending",
  translation: "translated",
  "translation bilingual": "bilingual",
  "translation unavailable": "failed",
} as const satisfies Record<PreviewContent, MessageItemPreviewTranslation>;

const PRODUCT_STATE_BY_SCENARIO = {
  message: "none",
  forwarded: "forwarded",
  quoted: "quoted",
  "quoted states": "quoted-feedback",
  action: "action",
} as const satisfies Record<Exclude<PreviewScenario, "system">, MessageItemPreviewProductState>;

const SENDER_STATE_OPTIONS = [
  "none",
  "deleted",
  "left",
  "removed",
] as const satisfies readonly MessageItemPreviewSenderState[];

const SYSTEM_EVENT_OPTIONS = [
  "archive",
  "reminder",
  "group",
] as const satisfies readonly MessageItemPreviewSystemEvent[];

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
  const [chrome, setChrome] = useState<MessageItemPreviewChrome>("default");
  const [meta, setMeta] = useState(true);
  const [content, setContent] = useState<PreviewContent>("plain");
  const [senderState, setSenderState] = useState<MessageItemPreviewSenderState>("none");
  const [converting, setConverting] = useState(false);
  const [systemEvent, setSystemEvent] = useState<MessageItemPreviewSystemEvent>("archive");
  const [task, setTask] = useState(false);
  const [image, setImage] = useState(false);
  const [video, setVideo] = useState(false);
  const [files, setFiles] = useState(false);
  const [saved, setSaved] = useState(false);
  const [replies, setReplies] = useState(false);
  const [newReplies, setNewReplies] = useState(false);
  const [draftReply, setDraftReply] = useState(false);
  const [reactions, setReactions] = useState(true);
  const [mobileReactionAdd, setMobileReactionAdd] = useState(false);
  const [toolbar, setToolbar] = useState(true);

  const isMessage = scenario === "message";
  const isRowVisible = isMessage && chrome !== "continuation";

  return (
    <Preview previewMode="light" previewClassName="items-stretch">
      <Preview.Canvas>
        <div className="w-full max-w-3xl">
          <MessageItemPreview
            chrome={chrome}
            meta={meta}
            markdown={content === "markdown"}
            translation={TRANSLATION_BY_CONTENT[content]}
            productState={scenario === "system" ? "none" : PRODUCT_STATE_BY_SCENARIO[scenario]}
            senderState={senderState}
            converting={converting}
            systemEvent={scenario === "system" ? systemEvent : undefined}
            task={task}
            image={image}
            video={video}
            files={files}
            saved={saved}
            replies={replies}
            newReplies={newReplies}
            draftReply={draftReply}
            reactions={reactions}
            mobileReactionAdd={mobileReactionAdd}
            toolbar={toolbar}
          />
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.ControlGroup label="Scenario">
          <Preview.Control label="Scenario" htmlFor="message-item-preview-scenario">
            <Preview.Select
              id="message-item-preview-scenario"
              label="Scenario"
              options={SCENARIO_OPTIONS}
              value={scenario}
              onValueChange={(value) => setScenario(value as PreviewScenario)}
            />
          </Preview.Control>
        </Preview.ControlGroup>

        {isMessage ? (
          <Preview.ControlGroup label="Row">
            <Preview.Control label="Row state" htmlFor="message-item-preview-chrome">
              <Preview.Select
                id="message-item-preview-chrome"
                label="Row state"
                options={CHROME_OPTIONS}
                value={chrome}
                onValueChange={(value) => setChrome(value as MessageItemPreviewChrome)}
              />
            </Preview.Control>
            {isRowVisible ? (
              <>
                <Preview.Control label="Model meta" htmlFor="message-item-preview-meta">
                  <Preview.Checkbox
                    id="message-item-preview-meta"
                    label="Model meta"
                    checked={meta}
                    onCheckedChange={setMeta}
                  />
                </Preview.Control>
                <Preview.Control label="Sender state" htmlFor="message-item-preview-sender-state">
                  <Preview.Select
                    id="message-item-preview-sender-state"
                    label="Sender state"
                    options={SENDER_STATE_OPTIONS}
                    value={senderState}
                    onValueChange={(value) =>
                      setSenderState(value as MessageItemPreviewSenderState)
                    }
                  />
                </Preview.Control>
                <Preview.Control label="Converting" htmlFor="message-item-preview-converting">
                  <Preview.Checkbox
                    id="message-item-preview-converting"
                    label="Converting"
                    checked={converting}
                    onCheckedChange={setConverting}
                  />
                </Preview.Control>
              </>
            ) : null}
          </Preview.ControlGroup>
        ) : null}

        {isRowVisible ? (
          <Preview.ControlGroup label="Content">
            <Preview.Control label="Content" htmlFor="message-item-preview-content">
              <Preview.Select
                id="message-item-preview-content"
                label="Content"
                options={CONTENT_OPTIONS}
                value={content}
                onValueChange={(value) => setContent(value as PreviewContent)}
              />
            </Preview.Control>
          </Preview.ControlGroup>
        ) : null}

        {scenario === "system" ? (
          <Preview.ControlGroup label="System">
            <Preview.Control label="System event" htmlFor="message-item-preview-system-event">
              <Preview.Select
                id="message-item-preview-system-event"
                label="System event"
                options={SYSTEM_EVENT_OPTIONS}
                value={systemEvent}
                onValueChange={(value) => setSystemEvent(value as MessageItemPreviewSystemEvent)}
              />
            </Preview.Control>
          </Preview.ControlGroup>
        ) : null}

        {isMessage ? (
          <>
            <Preview.ControlGroup label="Attachments">
              <Preview.Control label="Image" htmlFor="message-item-preview-image">
                <Preview.Checkbox
                  id="message-item-preview-image"
                  label="Image"
                  checked={image}
                  onCheckedChange={setImage}
                />
              </Preview.Control>
              <Preview.Control label="Video" htmlFor="message-item-preview-video">
                <Preview.Checkbox
                  id="message-item-preview-video"
                  label="Video"
                  checked={video}
                  onCheckedChange={setVideo}
                />
              </Preview.Control>
              <Preview.Control label="Files" htmlFor="message-item-preview-files">
                <Preview.Checkbox
                  id="message-item-preview-files"
                  label="Files"
                  checked={files}
                  onCheckedChange={setFiles}
                />
              </Preview.Control>
            </Preview.ControlGroup>

            <Preview.ControlGroup label="Footer">
              <Preview.Control label="Task" htmlFor="message-item-preview-task">
                <Preview.Checkbox
                  id="message-item-preview-task"
                  label="Task"
                  checked={task}
                  onCheckedChange={setTask}
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
              <Preview.Control label="Replies" htmlFor="message-item-preview-replies">
                <Preview.Checkbox
                  id="message-item-preview-replies"
                  label="Replies"
                  checked={replies}
                  onCheckedChange={setReplies}
                />
              </Preview.Control>
              {replies ? (
                <Preview.Control label="New replies" htmlFor="message-item-preview-new-replies">
                  <Preview.Checkbox
                    id="message-item-preview-new-replies"
                    label="New replies"
                    checked={newReplies}
                    onCheckedChange={setNewReplies}
                  />
                </Preview.Control>
              ) : null}
              <Preview.Control label="Draft reply" htmlFor="message-item-preview-draft-reply">
                <Preview.Checkbox
                  id="message-item-preview-draft-reply"
                  label="Draft reply"
                  checked={draftReply}
                  onCheckedChange={setDraftReply}
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
              {reactions ? (
                <Preview.Control
                  label="Mobile add"
                  htmlFor="message-item-preview-mobile-reaction-add"
                >
                  <Preview.Checkbox
                    id="message-item-preview-mobile-reaction-add"
                    label="Mobile add"
                    checked={mobileReactionAdd}
                    onCheckedChange={setMobileReactionAdd}
                  />
                </Preview.Control>
              ) : null}
            </Preview.ControlGroup>

            {chrome !== "selected" ? (
              <Preview.ControlGroup label="Actions">
                <Preview.Control label="Toolbar" htmlFor="message-item-preview-toolbar">
                  <Preview.Checkbox
                    id="message-item-preview-toolbar"
                    label="Toolbar"
                    checked={toolbar}
                    onCheckedChange={setToolbar}
                  />
                </Preview.Control>
              </Preview.ControlGroup>
            ) : null}
          </>
        ) : null}
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
