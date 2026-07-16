import { ScrollArea } from "@base-ui/react/scroll-area";
import {
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  PanelScrollContent,
  PanelScrollbar,
  PanelScrollbarThumb,
  PanelScrollViewport,
} from "raft-ui";

const ACTIVITY = ["Created design notes", "Reviewed prototypes", "Published release candidate"];

export function PanelBasicComposition() {
  return (
    <Panel className="flex h-80 flex-col overflow-hidden rounded-md border border-line bg-layer-panel">
      <PanelHeader className="flex h-12 shrink-0 items-center border-b border-line px-4 font-medium">
        Activity
      </PanelHeader>
      <PanelBody>
        <ScrollArea.Root className="h-full">
          <PanelScrollViewport render={<ScrollArea.Viewport />}>
            <PanelScrollContent render={<ScrollArea.Content />} className="space-y-3 p-4">
              {ACTIVITY.map((item) => (
                <div key={item} className="rounded-md bg-layer-muted px-3 py-2 text-sm">
                  {item}
                </div>
              ))}
            </PanelScrollContent>
          </PanelScrollViewport>
          <PanelScrollbar render={<ScrollArea.Scrollbar />}>
            <PanelScrollbarThumb render={<ScrollArea.Thumb />} />
          </PanelScrollbar>
        </ScrollArea.Root>
      </PanelBody>
      <PanelFooter className="border-t border-line bg-layer-panel px-4 py-3 text-sm text-foreground-muted">
        Footer content stays consumer-owned.
      </PanelFooter>
    </Panel>
  );
}
