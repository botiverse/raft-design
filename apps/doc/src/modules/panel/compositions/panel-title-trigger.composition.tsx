import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  PanelAction,
  PanelActions,
  PanelHeader,
  PanelHeaderContent,
  PanelHeading,
  PanelMeta,
  PanelStatus,
} from "@botiverse/raft-ui";
import { PanelTitleTrigger } from "@botiverse/raft-ui/wip";
import { X } from "lucide-react";
import { useCallback, useState } from "react";

const ARTIFACTS = {
  "launch-plan": { title: "Q3 launch plan", version: "v3" },
  "pricing-notes": { title: "Pricing notes", version: "v1" },
  "onboarding-checklist": { title: "Onboarding checklist", version: "v7" },
};

type ArtifactId = keyof typeof ARTIFACTS;

const TITLE_TRIGGER = <PanelTitleTrigger />;

export function PanelTitleTriggerContent() {
  const [shown, setShown] = useState<ArtifactId>("launch-plan");
  const [listOpen, setListOpen] = useState(false);
  const show = useCallback((value: string) => {
    setShown(value as ArtifactId);
    setListOpen(false);
  }, []);
  const openList = useCallback(() => setListOpen(true), []);
  const closeList = useCallback(() => setListOpen(false), []);
  const artifact = ARTIFACTS[shown];

  return (
    <div className="w-full max-w-160 bg-layer-canvas">
      <PanelHeader className="border-b border-line-seam">
        <PanelHeaderContent>
          <PanelHeading>
            <DropdownMenu>
              <DropdownMenuTrigger render={TITLE_TRIGGER}>{artifact.title}</DropdownMenuTrigger>
              <DropdownMenuContent aria-label="Recent Artifacts">
                <DropdownMenuRadioGroup value={shown} onValueChange={show}>
                  <DropdownMenuRadioItem value="launch-plan">Q3 launch plan</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pricing-notes">Pricing notes</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="onboarding-checklist">
                    Onboarding checklist
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openList}>All Artifacts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <PanelStatus>{artifact.version}</PanelStatus>
          </PanelHeading>
          <PanelMeta>{listOpen ? "Showing all Artifacts" : "Artifact · #launch-week"}</PanelMeta>
        </PanelHeaderContent>
        <PanelActions>
          <PanelAction aria-label="Close" onClick={closeList}>
            <X />
          </PanelAction>
        </PanelActions>
      </PanelHeader>
    </div>
  );
}

export function PanelTitleTriggerComposition() {
  return (
    <div className="flex size-full items-center justify-center px-3 py-4">
      <PanelTitleTriggerContent />
    </div>
  );
}
