import { ComponentPlayground } from "#/components/component-playground.tsx";
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

type PlaygroundValues = {
  scenario: PreviewScenario;
  chrome: MessageItemPreviewChrome;
  meta: boolean;
  content: PreviewContent;
  senderState: MessageItemPreviewSenderState;
  converting: boolean;
  systemEvent: MessageItemPreviewSystemEvent;
  task: boolean;
  image: boolean;
  video: boolean;
  files: boolean;
  saved: boolean;
  replies: boolean;
  newReplies: boolean;
  draftReply: boolean;
  reactions: boolean;
  mobileReactionAdd: boolean;
  toolbar: boolean;
};

export function MessageItemPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{
        scenario: "message",
        chrome: "default",
        meta: true,
        content: "plain",
        senderState: "none",
        converting: false,
        systemEvent: "archive",
        task: false,
        image: false,
        video: false,
        files: false,
        saved: false,
        replies: false,
        newReplies: false,
        draftReply: false,
        reactions: true,
        mobileReactionAdd: false,
        toolbar: true,
      }}
      controls={[
        {
          group: "Scenario",
          name: "scenario",
          label: "Scenario",
          type: "select",
          options: SCENARIO_OPTIONS,
        },
        {
          group: "Row",
          name: "chrome",
          label: "Row state",
          type: "select",
          options: CHROME_OPTIONS,
          when: (values) => values.scenario === "message",
        },
        {
          group: "Row",
          name: "meta",
          label: "Model meta",
          type: "boolean",
          when: (values) => values.scenario === "message" && values.chrome !== "continuation",
        },
        {
          group: "Row",
          name: "senderState",
          label: "Sender state",
          type: "select",
          options: SENDER_STATE_OPTIONS,
          when: (values) => values.scenario === "message" && values.chrome !== "continuation",
        },
        {
          group: "Row",
          name: "converting",
          label: "Converting",
          type: "boolean",
          when: (values) => values.scenario === "message" && values.chrome !== "continuation",
        },
        {
          group: "Content",
          name: "content",
          label: "Content",
          type: "select",
          options: CONTENT_OPTIONS,
          when: (values) => values.scenario === "message" && values.chrome !== "continuation",
        },
        {
          group: "System",
          name: "systemEvent",
          label: "System event",
          type: "select",
          options: SYSTEM_EVENT_OPTIONS,
          when: (values) => values.scenario === "system",
        },
        {
          group: "Footer",
          name: "task",
          label: "Task",
          type: "boolean",
          when: (values) => values.scenario === "message",
        },
        {
          group: "Attachments",
          name: "image",
          label: "Image",
          type: "boolean",
          when: (values) => values.scenario === "message",
        },
        {
          group: "Attachments",
          name: "video",
          label: "Video",
          type: "boolean",
          when: (values) => values.scenario === "message",
        },
        {
          group: "Attachments",
          name: "files",
          label: "Files",
          type: "boolean",
          when: (values) => values.scenario === "message",
        },
        {
          group: "Footer",
          name: "saved",
          label: "Saved",
          type: "boolean",
          when: (values) => values.scenario === "message",
        },
        {
          group: "Footer",
          name: "replies",
          label: "Replies",
          type: "boolean",
          when: (values) => values.scenario === "message",
        },
        {
          group: "Footer",
          name: "newReplies",
          label: "New replies",
          type: "boolean",
          when: (values) => values.scenario === "message" && values.replies,
        },
        {
          group: "Footer",
          name: "draftReply",
          label: "Draft reply",
          type: "boolean",
          when: (values) => values.scenario === "message",
        },
        {
          group: "Footer",
          name: "reactions",
          label: "Reactions",
          type: "boolean",
          when: (values) => values.scenario === "message",
        },
        {
          group: "Footer",
          name: "mobileReactionAdd",
          label: "Mobile add",
          type: "boolean",
          when: (values) => values.scenario === "message" && values.reactions,
        },
        {
          group: "Actions",
          name: "toolbar",
          label: "Toolbar",
          type: "boolean",
          when: (values) => values.scenario === "message" && values.chrome !== "selected",
        },
      ]}
      previewMode="light"
      previewClassName="items-stretch"
      render={(values) => (
        <div className="w-full max-w-3xl">
          <MessageItemPreview
            chrome={values.chrome}
            meta={values.meta}
            markdown={values.content === "markdown"}
            translation={TRANSLATION_BY_CONTENT[values.content]}
            productState={
              values.scenario === "system" ? "none" : PRODUCT_STATE_BY_SCENARIO[values.scenario]
            }
            senderState={values.senderState}
            converting={values.converting}
            systemEvent={values.scenario === "system" ? values.systemEvent : undefined}
            task={values.task}
            image={values.image}
            video={values.video}
            files={values.files}
            saved={values.saved}
            replies={values.replies}
            newReplies={values.newReplies}
            draftReply={values.draftReply}
            reactions={values.reactions}
            mobileReactionAdd={values.mobileReactionAdd}
            toolbar={values.toolbar}
          />
        </div>
      )}
    />
  );
}
