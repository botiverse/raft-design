import { ResizableGroup, ResizableHandle, ResizablePanel } from "raft-ui";

function Pane({ children }: { children: string }) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-layer-panel p-4 text-center font-mono text-sm text-foreground-muted">
      {children}
    </div>
  );
}

export function ResizableHorizontalComposition() {
  return (
    <ResizableGroup orientation="horizontal" className="h-72 rounded-md border border-line">
      <ResizablePanel id="navigation" defaultSize={32} minSize={20} maxSize={45}>
        <Pane>Navigation</Pane>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="content" minSize={40}>
        <Pane>Content</Pane>
      </ResizablePanel>
    </ResizableGroup>
  );
}
