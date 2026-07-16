import { ComponentPlayground } from "#/components/component-playground.tsx";

import {
  ChatSidebarComposition,
  type ChatSidebarContentState,
  type ChatSidebarLiveActivityState,
} from "./chat-sidebar.composition.tsx";

const CONTENT_STATES = ["Populated", "Empty"] as const;
type PreviewValues = {
  content: (typeof CONTENT_STATES)[number];
  liveActivity: boolean;
};

function getContentState(content: PreviewValues["content"]): ChatSidebarContentState {
  return content === "Empty" ? "empty" : "populated";
}

function getLiveActivityState(liveActivity: boolean): ChatSidebarLiveActivityState {
  return liveActivity ? "active" : "none";
}

export function ChatSidebarPreview() {
  return (
    <ComponentPlayground<PreviewValues>
      defaultValues={{ content: "Populated", liveActivity: true }}
      controls={[
        {
          group: "Content",
          name: "content",
          label: "Lists",
          type: "radio",
          options: CONTENT_STATES,
        },
        {
          group: "Live activity",
          name: "liveActivity",
          label: "Show activity",
          type: "boolean",
        },
      ]}
      layout="split"
      previewClassName="!h-[560px] !min-h-0 !items-stretch !justify-center !p-2"
      render={(values) => (
        <div className="flex h-full w-[308px] items-stretch bg-layer-page">
          <ChatSidebarComposition
            contentState={getContentState(values.content)}
            liveActivityState={getLiveActivityState(values.liveActivity)}
          />
        </div>
      )}
    />
  );
}
