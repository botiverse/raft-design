import {
  Button,
  Panel,
  PanelActions,
  PanelBody,
  PanelHeader,
  PanelHeaderContent,
  PanelHeading,
  PanelScrollContent,
  PanelScrollViewport,
  PanelTitle,
  PanelToggleAction,
  Text,
} from "@botiverse/raft-ui";
import {
  ModeBar,
  ModeBarAction,
  ModeBarContent,
  ModeBarDescription,
  ModeBarTitle,
} from "@botiverse/raft-ui/wip";
import { MessageSquarePlus } from "lucide-react";
import { useCallback, useState } from "react";

export function ModeBarPreviewContent() {
  const [commenting, setCommenting] = useState(true);
  const [drafts, setDrafts] = useState(1);
  const done = useCallback(() => setCommenting(false), []);
  const addDraft = useCallback(() => setDrafts((count) => count + 1), []);

  return (
    <Panel edge="inset" className="flex h-72 w-full max-w-160 min-h-0 flex-col bg-layer-canvas">
      <PanelHeader className="border-b border-line-seam">
        <PanelHeaderContent>
          <PanelHeading>
            <PanelTitle>Q3 launch plan</PanelTitle>
          </PanelHeading>
        </PanelHeaderContent>
        <PanelActions>
          <PanelToggleAction
            pressed={commenting}
            onPressedChange={setCommenting}
            aria-label="Comment"
          >
            <MessageSquarePlus aria-hidden />
          </PanelToggleAction>
        </PanelActions>
      </PanelHeader>

      {commenting ? (
        <ModeBar>
          <ModeBarContent>
            <ModeBarTitle>
              Commenting · {drafts} {drafts === 1 ? "draft" : "drafts"}.
            </ModeBarTitle>
            <ModeBarDescription>Select text to comment on it.</ModeBarDescription>
          </ModeBarContent>
          <ModeBarAction onClick={done}>Done</ModeBarAction>
        </ModeBar>
      ) : null}

      <PanelBody>
        <PanelScrollViewport>
          <PanelScrollContent className="flex flex-col items-start gap-4 px-5 py-6 max-md:px-4">
            <Text.Sans>
              Goal: ship 1.1 before September 30, with Artifacts on for every server that opts in.
            </Text.Sans>
            {commenting ? (
              <Button variant="default" size="md" onClick={addDraft}>
                Add to Batch
              </Button>
            ) : null}
          </PanelScrollContent>
        </PanelScrollViewport>
      </PanelBody>
    </Panel>
  );
}

export function ModeBarPreviewComposition() {
  return (
    <div className="flex size-full items-center justify-center px-3 py-4">
      <ModeBarPreviewContent />
    </div>
  );
}
