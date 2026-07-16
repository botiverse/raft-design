import { ResizableGroup, ResizableHandle, ResizablePanel } from "raft-ui";

function Pane({ children }: { children: string }) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-layer-panel p-4 text-center font-mono text-sm text-foreground-muted">
      {children}
    </div>
  );
}

export function ResizableVerticalComposition() {
  return (
    <ResizableGroup orientation="vertical" className="h-72 rounded-md border border-line">
      <ResizablePanel id="preview" defaultSize={58} minSize={25}>
        <Pane>Preview</Pane>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="details" minSize={20}>
        <Pane>Details</Pane>
      </ResizablePanel>
    </ResizableGroup>
  );
}
