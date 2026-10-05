import { useCallback, useState } from "react";
import type { ReactNode } from "react";

import { Preview } from "#/components/preview.tsx";
import { SidebarComposition } from "./sidebar.composition.tsx";
import type { SidebarContentState, SidebarLiveActivityState } from "./sidebar.composition.tsx";

const CONTENT_STATES = ["Populated", "Empty"] as const;
type PreviewContentState = (typeof CONTENT_STATES)[number];

function getContentState(content: PreviewContentState): SidebarContentState {
  return content === "Empty" ? "empty" : "populated";
}

function getLiveActivityState(liveActivity: boolean): SidebarLiveActivityState {
  return liveActivity ? "active" : "none";
}

type SidebarPreviewProps = {
  codeBlock: ReactNode;
};

export function SidebarPreview({ codeBlock }: SidebarPreviewProps) {
  const [content, setContent] = useState<PreviewContentState>("Populated");
  const [liveActivity, setLiveActivity] = useState(true);

  const handleContentChange = useCallback(
    (value: string) => setContent(value as PreviewContentState),
    [],
  );

  return (
    <Preview previewClassName="!h-[560px] !min-h-0 !items-stretch !justify-center !p-2">
      <Preview.Canvas>
        <div className="flex h-full w-[308px] items-stretch bg-layer-canvas-muted">
          <SidebarComposition
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
              onValueChange={handleContentChange}
            />
          </Preview.Control>
        </Preview.ControlGroup>
        <Preview.ControlGroup label="Live activity">
          <Preview.Control label="Show activity" htmlFor="sidebar-preview-live-activity">
            <Preview.Checkbox
              id="sidebar-preview-live-activity"
              label="Show activity"
              checked={liveActivity}
              onCheckedChange={setLiveActivity}
            />
          </Preview.Control>
        </Preview.ControlGroup>
      </Preview.Controls>
      <Preview.Code codeBlock={codeBlock} />
    </Preview>
  );
}
