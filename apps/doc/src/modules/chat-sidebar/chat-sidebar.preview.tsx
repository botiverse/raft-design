import { useState, type ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import {
  ChatSidebarComposition,
  type ChatSidebarContentState,
  type ChatSidebarLiveActivityState,
} from "./chat-sidebar.composition.tsx";

const CONTENT_STATES = ["Populated", "Empty"] as const;
type PreviewContentState = (typeof CONTENT_STATES)[number];

function getContentState(content: PreviewContentState): ChatSidebarContentState {
  return content === "Empty" ? "empty" : "populated";
}

function getLiveActivityState(liveActivity: boolean): ChatSidebarLiveActivityState {
  return liveActivity ? "active" : "none";
}

type CodeContent = ReactNode | AnyRenderableServerComponent;

type ChatSidebarPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function ChatSidebarPreview({ code, collapsedCode }: ChatSidebarPreviewProps) {
  const [content, setContent] = useState<PreviewContentState>("Populated");
  const [liveActivity, setLiveActivity] = useState(true);

  return (
    <Preview previewClassName="!h-[560px] !min-h-0 !items-stretch !justify-center !p-2">
      <Preview.Canvas>
        <div className="flex h-full w-[308px] items-stretch bg-layer-page">
          <ChatSidebarComposition
            contentState={getContentState(content)}
            liveActivityState={getLiveActivityState(liveActivity)}
          />
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.ControlGroup label="Content">
          <Preview.Control label="Lists">
            <Preview.Radio
              label="Lists"
              options={CONTENT_STATES}
              value={content}
              onValueChange={(value) => setContent(value as PreviewContentState)}
            />
          </Preview.Control>
        </Preview.ControlGroup>
        <Preview.ControlGroup label="Live activity">
          <Preview.Control label="Show activity" htmlFor="chat-sidebar-preview-live-activity">
            <Preview.Checkbox
              id="chat-sidebar-preview-live-activity"
              label="Show activity"
              checked={liveActivity}
              onCheckedChange={setLiveActivity}
            />
          </Preview.Control>
        </Preview.ControlGroup>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
