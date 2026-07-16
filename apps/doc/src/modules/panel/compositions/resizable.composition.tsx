import { ResizableGroup, ResizableHandle, ResizablePanel } from "raft-ui";

import { PanelBasicComposition } from "./basic.composition.tsx";

export function PanelResizableComposition() {
  return (
    <ResizableGroup orientation="horizontal" className="h-80 rounded-md border border-line">
      <ResizablePanel id="main" minSize={45}>
        <PanelBasicComposition />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="details" defaultSize={38} minSize={28}>
        <PanelBasicComposition />
      </ResizablePanel>
    </ResizableGroup>
  );
}
